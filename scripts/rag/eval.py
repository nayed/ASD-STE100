import json, math, re
import numpy as np
from fastembed import TextEmbedding

data = json.load(open("corpus.json"))
chunks, questions = data["chunks"], data["questions"]
ids = [c["id"] for c in chunks]

# keyword search: BM25 over lower-case words, without stop words
STOP = set("a an the and or of to in on at for by is are was be it its this that with from "
           "as do does did i my you your what which when where why how can must if not too".split())

def words(s):
    found = re.findall(r"[a-z0-9]+(?:\.[0-9]+)?", s.lower())
    return [w[:-1] if len(w) > 3 and w.endswith("s") and not w.endswith("ss") else w
            for w in found if w not in STOP]

docs = [words(c["title"] + " " + c["text"]) for c in chunks]
avg = sum(map(len, docs)) / len(docs)
df = {t: sum(t in d for d in docs) for d in docs for t in d}

def bm25(q, k1=1.2, b=0.75):
    score = np.zeros(len(docs))
    for i, d in enumerate(docs):
        for t in words(q):
            if t in d:
                idf = math.log(1 + (len(docs) - df[t] + 0.5) / (df[t] + 0.5))
                tf = d.count(t)
                score[i] += idf * tf * (k1 + 1) / (tf + k1 * (1 - b + b * len(d) / avg))
    return score

# meaning search: cosine similarity of embeddings (the vectors have length 1)
model = TextEmbedding("BAAI/bge-small-en-v1.5", cache_dir="./models")
vectors = np.array(list(model.passage_embed([c["title"] + ". " + c["text"] for c in chunks])))

def dense(q):
    return vectors @ next(model.query_embed([q]))

def ranking(score, positive_only=False):
    order = [i for i in np.argsort(-score, kind="stable") if score[i] > 0 or not positive_only]
    return {ids[i]: r + 1 for r, i in enumerate(order)}

# hybrid search: reciprocal rank fusion of the two rankings
def fuse(a, b, k=60):
    s = {i: sum(1 / (k + r[i]) for r in (a, b) if i in r) for i in ids}
    return {i: r + 1 for r, i in enumerate(sorted(ids, key=lambda i: -s[i]))}

if __name__ == "__main__":
    rows = []
    for item in questions:
        kw, mn = ranking(bm25(item["q"]), True), ranking(dense(item["q"]))
        rows.append([r.get(item["gold"]) for r in (kw, mn, fuse(kw, mn))])
    print(f"{'question':46}{'gold':>6}{'bm25':>7}{'dense':>7}{'hybrid':>8}")
    for item, row in zip(questions, rows):
        print(f"{item['q']:46}{item['gold']:>6}" + "".join(f"{r or '-':>{w}}" for r, w in zip(row, (7, 7, 8))))
    n = len(rows)
    for name, f in (("recall@1", lambda r: r == 1), ("recall@3", lambda r: r is not None and r <= 3)):
        print(f"{name:52}" + "".join(f"{f'{sum(f(row[m]) for row in rows)}/{n}':>{w}}" for m, w in zip(range(3), (7, 7, 8))))
    print(f"{'MRR':52}" + "".join(f"{sum(1 / row[m] for row in rows if row[m]) / n:>{w}.3f}" for m, w in zip(range(3), (7, 7, 8))))
