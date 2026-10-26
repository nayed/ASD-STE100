"""
Writes src/articles/rag/data.ts: every measured value of the RAG article.

    cd scripts/rag
    python3 -m venv .venv
    .venv/bin/pip install -r requirements.txt
    .venv/bin/python build_data.py

The first run downloads BAAI/bge-small-en-v1.5 (about 65 MB) into ./models. The script embeds
the chunks and the questions of corpus.json, then writes the cosines, the 2-D projection, the
writer's answers, the title vector, and eval.py with what it prints (Exhibit C and Output C).
The article quotes some of these results (Sheets 05, 07, 08 and 09): after a change to
corpus.json, read those sheets again.
"""
import datetime, json, os, platform, re, subprocess, sys
from importlib.metadata import version

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)  # eval.py opens corpus.json and ./models in the working directory, when it is imported

import numpy as np
from eval import model, vectors, chunks, questions, data, ids

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "../../src/articles/rag/data.ts")
MODEL = "BAAI/bge-small-en-v1.5"
THRESHOLD = 0.62   # below this similarity, a chunk does not go to the writer
ask = [q["q"] for q in questions] + data["unanswerable"]
Q = np.array(list(model.query_embed(ask)))
cos = Q @ vectors.T                                    # [question, chunk]

# 2-D projection (PCA) of chunks and questions together
X = np.vstack([vectors, Q]); X = X - X.mean(0)
_, _, vt = np.linalg.svd(X, full_matrices=False)
P = X @ vt[:2].T; P = P / np.abs(P).max()

# the writer: copy the best-matching sentence(s) of the kept chunks
sent = [(c["id"], s) for c in chunks for s in re.split(r"(?<=\.)\s+", c["text"])]
S = np.array(list(model.passage_embed([s for _, s in sent])))
answers = []
for qi, q in enumerate(ask):
    order = np.argsort(-cos[qi])[:3]
    kept = [ids[i] for i in order if cos[qi, i] >= THRESHOLD]
    if not kept:
        answers.append({"kept": [], "sentences": []}); continue
    # the best chunk's sentences that score at least 90 % of its best sentence, in document order
    cand = [(float(Q[qi] @ S[j]), cid, s) for j, (cid, s) in enumerate(sent) if cid == kept[0]]
    best = max(c[0] for c in cand)
    picked = [c for c in cand if c[0] >= 0.9 * best]
    answers.append({"kept": kept, "sentences": [[cid, s, round(float(sc), 3)] for sc, cid, s in picked]})

title = next(model.passage_embed(["Retrieval-augmented generation"]))

# the long section that Fig. 03 cuts into chunks
chunker = ("Filter. The filter removes particles from the fluid before the fluid goes back to the reservoir. "
  "Replace the filter element every 600 flight hours. Replace it before this time if the clog indicator shows red. "
  "To replace the element, set the pump switch to OFF. Release the system pressure. Remove the filter bowl and discard the old element. "
  "Install a new element and a new O-ring. Tighten the bowl to 12 Nm. Do a leak check at 3000 psi.")

# Exhibit C and Output C: the script, and what it prints when it runs
eval_src = open("eval.py").read().rstrip("\n")
eval_out = subprocess.run([sys.executable, "eval.py"], capture_output=True, text=True, check=True).stdout.rstrip("\n")

run = {"date": datetime.date.today().isoformat(), "python": ".".join(platform.python_version_tuple()[:2]),
       "numpy": ".".join(np.__version__.split(".")[:2]), "fastembed": version("fastembed")}
J = lambda o: json.dumps(o, ensure_ascii=False)
ts = f'''/**
 * Data of RAG-100, written by scripts/rag/build_data.py: do not edit by hand. Measured on {run["date"]} with
 * fastembed {run["fastembed"]}, model {MODEL}, Python {run["python"]} and numpy {run["numpy"]}: every cosine,
 * projection, answer and the title vector below is a measured value.
 * The example manual (HP-40 hydraulic pump) is invented for this dossier.
 */

export type Chunk = {{ id: string; ref: string; title: string; text: string }};
export type Question = {{ q: string; gold: string }};
export type Answer = {{ kept: string[]; sentences: [id: string, sentence: string, score: number][] }};

export const MODEL = {J(MODEL)};
export const DIMS = {vectors.shape[1]};
/** the run that measured the values below */
export const RUN = {J(run)};

export const CHUNKS: Chunk[] = {J(chunks)};

/** the test set: each question with its gold chunk */
export const QUESTIONS: Question[] = {J(questions)};

/** a question that the manual cannot answer */
export const UNANSWERABLE = {J(data["unanswerable"][0])};

/** similarity below which a chunk does not go to the writer */
export const THRESHOLD = {THRESHOLD};

/** questions in the order of COS rows: QUESTIONS, then UNANSWERABLE */
export const ASK: string[] = {J(ask)};

/** cosine similarity of each question (row) with each chunk (column), from all 384 numbers */
export const COS: number[][] = {J(np.round(cos, 3).tolist())};

/** 2-D projection (PCA) of the real vectors, scaled to -1…1 */
export const PROJ_CHUNKS: [number, number][] = {J(np.round(P[:len(chunks)], 3).tolist())};
export const PROJ_QUESTIONS: [number, number][] = {J(np.round(P[len(chunks):], 3).tolist())};

/** what the writer copied for each question (rows as in ASK) */
export const ANSWERS: Answer[] = {J(answers)};

/** the embedding of "Retrieval-augmented generation": the cover band */
export const TITLE_VECTOR: number[] = {J(np.round(title, 4).tolist())};

/** the long section that Fig. 03 cuts into chunks */
export const CHUNKER_TEXT = {J(chunker)};

/** Exhibit C: the evaluation script, and what it printed */
export const EVAL_PY = {J(eval_src)};
export const EVAL_OUTPUT = {J(eval_out)};
'''
open(OUT, "w").write(ts)

for q, a, c in zip(ask, answers, cos):
    print(f"Q: {q}\n   kept {a['kept']}  top cos {c.max():.3f}\n   A: " + (" ".join(f"{s} [{cid}]" for cid, s, _ in a["sentences"]) or "(refuse)"))
print(f"wrote {os.path.relpath(OUT)} ({len(ts)} bytes)")
