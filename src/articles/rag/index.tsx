import "./rag.css";
import { Call, Code, DocBar, Figure, ISSUED, Rail, REV, Section, Term, useReading } from "./chrome";
import { AskDossier, Masthead } from "./cover";
import EVAL from "../../../scripts/rag/eval.py?highlight";
import { CHUNKS, EVAL_OUTPUT, MODEL, RUN } from "./data";
import { FigChunker, FigSystem, FigTwoWays } from "./figs1";
import { FigPlane, FigPrompt, FigRetriever } from "./figs2";
import { FigEval, FigLadder, FigRun } from "./figs3";

export default function Rag() {
  const reading = useReading();
  return (
    <div className="rag">
      <DocBar active={reading.active} progress={reading.progress} />
      <div className="wrap">
        <Rail active={reading.active} />
        <main>
          <Masthead />
          <AskDossier />

          {/* ============ 01 ============ */}
          <Section id="s01">
            <div className="cols">
              <div className="stack">
                <p className="lead">
                  RAG means retrieval-augmented generation. The system retrieves chunks of your documents. It adds them to
                  the question. Then the model generates the answer from them.
                </p>
                <p>A language model alone answers from its training data. That data can be old. It does not contain your documents.</p>
                <p>
                  The model can also write a sentence that sounds correct but is false. With RAG, each fact in the answer
                  points to its chunk.
                </p>
                <p>RAG does not change the model. It changes what the model reads. A new document is available when it is in the index.</p>
              </div>
              <div className="stack">
                <Call>RAG is a method, not a model. A search system and a language model do the work together.</Call>
                <div className="duo">
                  <div>
                    <h5>Use RAG when</h5>
                    <p>The answer must come from your documents. The documents change often. A person must check the source of each fact.</p>
                  </div>
                  <div>
                    <h5>Do not use RAG when</h5>
                    <p>General knowledge is sufficient. Or all your documents are so short that they fit in one prompt.</p>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 22 }}>
              <Figure no="01" title="Two ways to answer the same question" sheet="Sheet 01 / Fig 01" inverse note="Lane A gives no source to check. Lane B gives the source of each fact.">
                <FigTwoWays />
              </Figure>
            </div>
          </Section>

          {/* ============ 02 ============ */}
          <Section id="s02">
            <div className="cols">
              <div className="stack">
                <p className="lead">
                  A RAG system works in two phases. The indexing phase prepares the documents before anyone asks. The
                  question phase runs each time a person asks.
                </p>
                <p>The two phases share one part: the vector index. If the index is wrong or old, the prompt and the model cannot correct the answer.</p>
              </div>
              <div className="stack">
                <p>Figure 02 shows the parts and the direction of the data. Select a block to see what it does and how it fails.</p>
                <Call kind="caution">
                  Use the same embedding model for the documents and for the questions. You cannot compare vectors from two different models.
                </Call>
              </div>
            </div>
            <div style={{ marginTop: 22 }}>
              <Figure no="02" title="RAG system — two phases, one shared index" sheet="Sheet 02 / Fig 02" note="The dashes move in the direction of the data. Phase A runs one time for each document. Phase B runs for each question.">
                <FigSystem />
              </Figure>
            </div>
          </Section>

          {/* ============ 03 ============ */}
          <Section id="s03">
            <div className="cols">
              <div className="stack">
                <p className="lead">
                  The system cuts each document into chunks before it makes the vectors. A whole manual matches each question a little, and no question well.
                </p>
                <p>
                  A chunk must hold one idea and the words around it. Small chunks are precise, but they lose context. Large chunks keep context, but
                  they fill the prompt.
                </p>
                <p>An overlap repeats the end of one chunk at the start of the next chunk. Then a fact on a cut stays complete in one chunk.</p>
              </div>
              <div className="stack">
                <p>Cut on headings, paragraphs and sentence ends. Do not cut a sentence or a table row in two.</p>
                <Call>
                  Real systems count chunks in tokens, not in characters. One English token is about four characters. Figure 03 counts characters so
                  that you can see each cut.
                </Call>
              </div>
            </div>
            <div style={{ marginTop: 22 }}>
              <Figure no="03" title="Cut one section of the manual into chunks" sheet="Sheet 03 / Fig 03" note="Cut by length, and some cuts fall inside a word. Cut by sentence, and no cut does. Cobalt shows the overlap.">
                <FigChunker />
              </Figure>
            </div>
            <h3>Procedure — build the index</h3>
            <ol className="proc">
              {[
                "Collect the documents that the system must use.",
                "Extract the text. Keep the headings, the lists and the table rows.",
                "Remove the text that repeats on each page, for example headers and footers.",
                "Cut the text into chunks on headings, paragraphs and sentence ends.",
                "Give each chunk an identity, the name of its document and a date.",
                "Make a vector for each chunk with the embedding model.",
                "Store each vector with its chunk in the vector index.",
                "When a document changes, remove its old chunks. Then add the new chunks.",
              ].map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <h3>The example manual</h3>
            <div className="tcap">Table 3-1 · HP-40 hydraulic pump manual (invented) · 12 chunks</div>
            <div className="tw">
              <table className="tbl" style={{ minWidth: 640 }}>
                <thead>
                  <tr>
                    <th>Chunk</th>
                    <th>Reference</th>
                    <th>Title</th>
                    <th>Text</th>
                  </tr>
                </thead>
                <tbody>
                  {CHUNKS.map((c) => (
                    <tr key={c.id}>
                      <td className="k a">{c.id}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{c.ref}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{c.title}</td>
                      <td>{c.text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* ============ 04 ============ */}
          <Section id="s04">
            <div className="cols">
              <div className="stack">
                <p className="lead">
                  An embedding model changes a text into a vector: a fixed list of numbers. The model in this document makes 384 numbers for each text.
                </p>
                <p>Texts with a similar meaning get vectors that point in a similar direction. The system measures the angle between two vectors.</p>
                <div className="formula">
                  <span className="eq">
                    cos θ ={" "}
                    <span className="frac">
                      <span>q · d</span>
                      <span>|q| |d|</span>
                    </span>
                  </span>
                  <span className="where">
                    q = vector of the question · d = vector of a chunk
                    <br />1 = same direction · 0 = no relation
                  </span>
                </div>
                <p>The model makes each vector the length 1. Then the cosine is the dot product of the two vectors.</p>
              </div>
              <div className="stack">
                <p>
                  Words do not have to match. The question “When must I swap the cartridge?” shares no word with chunk C-03. Its vector is still nearest
                  to C-03.
                </p>
                <p>Figure 04 uses the real vectors of the 12 chunks. Select a question to see its three nearest chunks.</p>
                <Call>
                  The positions in Figure 04 are a 2-D projection of 384 numbers. Some distances look wrong in two dimensions. The lines and the
                  scores use all 384 numbers.
                </Call>
              </div>
            </div>
            <div style={{ marginTop: 22 }}>
              <Figure no="04" title="The embedding plane — real vectors, one question" sheet="Sheet 04 / Fig 04" note={`The cobalt line goes to the nearest chunk. The dashed line in the list is the threshold of Sheet 07. Model: ${MODEL}.`}>
                <FigPlane />
              </Figure>
            </div>
          </Section>

          {/* ============ 05 ============ */}
          <Section id="s05">
            <div className="cols">
              <div className="stack">
                <p className="lead">The search gives a score to each chunk and sorts the chunks. It keeps the best k chunks. Usually k is a number from 3 to 8.</p>
                <p>If k is too small, the chunk with the fact can stay out of the prompt. If k is too large, the prompt fills with noise.</p>
                <p>
                  Keyword search gives a high score to a chunk that shares rare words with the question. BM25 is the usual formula. Meaning search
                  compares the vectors of Sheet 04.
                </p>
              </div>
              <div className="stack">
                <p>
                  Each search fails in a different way. Keyword search misses other words for the same thing. Meaning search can confuse two numbers.
                  Hybrid search joins the two rankings into one.
                </p>
                <Call kind="caution">
                  Do not use meaning search alone in a manual with many numbers. In Figure 05, “every 300 flight hours” finds the 600-hour filter chunk
                  first.
                </Call>
              </div>
            </div>
            <div style={{ marginTop: 22 }}>
              <Figure no="05" title="Three searches over the manual" sheet="Sheet 05 / Fig 05" note="Keyword search runs live in this page on any question. Meaning and hybrid search use the measured vectors, so they work on the preset questions.">
                <FigRetriever />
              </Figure>
            </div>
            <div className="cols" style={{ marginTop: 18 }}>
              <Call>
                Hybrid search in this document uses reciprocal rank fusion. Each search gives a chunk the value 1 / (60 + rank). The system adds the two values.
              </Call>
              <Call>
                Many systems add a reranker after the search. A reranker reads the question and each chunk together. It is slower, but it is more accurate.
              </Call>
            </div>
          </Section>

          {/* ============ 06 ============ */}
          <Section id="s06">
            <div className="cols">
              <div className="stack">
                <p className="lead">The system puts the kept chunks and the question into one text. This text is the augmented prompt.</p>
                <p>The prompt has four parts: the instruction, the chunks with their identities, the conversation and the question.</p>
                <p>
                  The instruction is the most important line. It tells the model to use only the chunks. It also tells the model what to write when
                  the chunks have no answer.
                </p>
              </div>
              <div className="stack">
                <p>The prompt must fit in the context window of the model. Keep space for the answer.</p>
                <Call>Models use the start and the end of a long prompt best (Liu et al., 2023). Put the best chunk first. Put the question last.</Call>
              </div>
            </div>
            <div style={{ marginTop: 22 }}>
              <Figure no="06" title="The augmented prompt and the context budget" sheet="Sheet 06 / Fig 06" note="The chunks come from meaning search. The budget strip uses example sizes, because real chunks are 200 to 800 tokens long.">
                <FigPrompt />
              </Figure>
            </div>
          </Section>

          {/* ============ 07 ============ */}
          <Section id="s07">
            <div className="cols">
              <div className="stack">
                <p className="lead">
                  The language model reads the prompt and writes the answer. A grounded answer uses only facts from the chunks. It cites the chunk of each fact.
                </p>
                <p>The model must obey these rules:</p>
                <ol className="rules">
                  {[
                    "Use only the chunks in the prompt.",
                    "Write one sentence for each fact.",
                    "Put the identity of the chunk after each sentence.",
                    "Give a number only if a chunk contains that number.",
                    "If the chunks do not contain the answer, write: The documents do not contain the answer.",
                    "Do not add an opinion or a guess.",
                  ].map((s, i) => (
                    <li key={s}>
                      <span>{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="stack">
                <p>
                  In Figure 07, a small writer program does step 4. It copies the closest sentences of the best chunk. A language model writes new
                  sentences, but the rules are the same.
                </p>
                <p>Select “300 flight hours”. The answer is wrong, because the search found the wrong chunk. The citation shows the error at once.</p>
                <Call kind="warning">
                  <span className="cmd">Do not accept an answer sentence without a citation.</span> A model can write a sentence that sounds correct but is in no chunk.
                </Call>
              </div>
            </div>
            <div style={{ marginTop: 22 }}>
              <Figure no="07" title="One question, from the search to the answer" sheet="Sheet 07 / Fig 07" note="The steps light up in order. The writer copies each sentence of the best chunk that scores at least 90 % of its best sentence.">
                <FigRun />
              </Figure>
            </div>
            <div style={{ marginTop: 18 }}>
              <Call kind="warning">
                <span className="cmd">Do not treat the text of a chunk as an instruction.</span> A document can contain text such as “ignore the rules”. The model reads
                it as part of the prompt. Filter the index by the access rights of each user.
              </Call>
            </div>
          </Section>

          {/* ============ 08 ============ */}
          <Section id="s08">
            <div className="cols">
              <div className="stack">
                <p className="lead">
                  Test the search and the answers separately. A system with good answers and a bad search writes clear answers from the wrong chunks.
                </p>
                <p>Make a set of real questions. For each question, record the chunk that contains the answer. This chunk is the gold chunk.</p>
              </div>
              <div className="tw">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Measure</th>
                      <th>Tests</th>
                      <th>Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Recall@k", "Search", "The share of questions with the gold chunk in the top k."],
                      ["MRR", "Search", "The mean of 1 / rank of the gold chunk. 1.000 means always first."],
                      ["Faithfulness", "Answer", "The share of answer sentences that the chunks support."],
                      ["Refusal rate", "Answer", "The share of questions with no answer that the system refuses."],
                    ].map(([a, b, c]) => (
                      <tr key={a}>
                        <td className="k">{a}</td>
                        <td>{b}</td>
                        <td>{c}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ marginTop: 22 }}>
              <Figure no="08" title="Rank of the gold chunk, for 12 questions and 3 searches" sheet="Sheet 08 / Fig 08" note="Each cell is the rank of the gold chunk. This page computes the ranks again with the code of Exhibit C.">
                <FigEval />
              </Figure>
            </div>
            <div className="cols" style={{ marginTop: 18 }}>
              <div className="stack">
                <p>
                  On these 12 questions, meaning search puts the gold chunk first 11 times. Keyword search fails on other words for the same thing: “swap
                  the cartridge” and “oil”.
                </p>
                <p>
                  Hybrid search corrects the 300-hour question, but it moves the oil question down to rank 5. No method is the best for every question.
                  Measure with your own questions before you select a method.
                </p>
              </div>
              <Call>Twelve questions show the method. They are too few to compare two real systems.</Call>
            </div>
            <div style={{ marginTop: 18 }} className="stack">
              <Code label="Exhibit C — eval.py" meta={`Python · ${EVAL.lines.length} lines · the code of Figures 05 and 08`} listing={EVAL} />
              <Term label="Output C — a real run" meta={`Python ${RUN.python} · fastembed ${RUN.fastembed} · ${RUN.date}`} command="python eval.py" output={EVAL_OUTPUT} />
            </div>
          </Section>

          {/* ============ 09 ============ */}
          <Section id="s09">
            <div className="cols">
              <p className="lead">
                Use this procedure when an answer is wrong. Do the checks in order. Start with the documents and the search, not with the model.
              </p>
              <p>Most wrong answers come from the documents or from the search. The model can only use the chunks that it gets.</p>
            </div>
            <div style={{ marginTop: 22 }}>
              <Figure no="09" title="Fault-isolation ladder — start at Q1" sheet="Sheet 09 / Fig 09" note="Select YES or NO for each check. A NO shows the fault and its correction.">
                <FigLadder />
              </Figure>
            </div>
            <div style={{ marginTop: 18 }}>
              <div className="tcap">Table 9-1 · Symptoms, causes and corrections</div>
              <div className="tw">
                <table className="tbl" style={{ minWidth: 640 }}>
                  <thead>
                    <tr>
                      <th>Symptom</th>
                      <th>Possible cause</th>
                      <th>Correction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["The answer is not in the documents.", "The search found no good chunk, and the model used its memory.", "Make the model refuse. Add the missing document to the index."],
                      ["The answer is correct but old.", "The index does not have the new revision of the document.", "Do the index procedure again when a document changes."],
                      ["The answer cites the wrong chunk.", "The chunks are too large, or the search confuses numbers.", "Make the chunks smaller. Use hybrid search or a reranker."],
                      ["The answer stops in the middle.", "The prompt leaves too little space for the answer (Figure 06).", "Decrease k, or make the chunks smaller."],
                      ["The answer has no citations.", "The prompt does not tell the model to cite the chunks.", "Put the citation rule in the instruction."],
                      ["One question gives two different answers.", "The temperature of the model is too high.", "Set the temperature to 0 for facts."],
                    ].map(([a, b, c]) => (
                      <tr key={a}>
                        <td style={{ color: "var(--ink)", fontWeight: 600 }}>{a}</td>
                        <td>{b}</td>
                        <td className="a">{c}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Section>

          {/* ============ 10 ============ */}
          <Section id="s10">
            <div className="cols">
              <p className="lead">
                RAG is one of three ways to give a model knowledge that it does not have. Fine-tuning changes the model. Long context puts all the
                documents into each prompt.
              </p>
              <p>The three ways can work together. For example, a fine-tuned model can answer from retrieved chunks.</p>
            </div>
            <div style={{ marginTop: 20 }}>
              <div className="tcap">Table 10-1 · RAG, fine-tuning and long context</div>
              <div className="tw">
                <table className="tbl" style={{ minWidth: 660 }}>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>RAG</th>
                      <th>Fine-tuning</th>
                      <th>Long context</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Adds new facts", "Yes, for each question", "Partly; exact facts are not reliable", "Yes, if the documents fit"],
                      ["Cost of an update", "Index one document again", "Train the model again", "None: change the text"],
                      ["Cites its sources", "Yes, by chunk identity", "No", "Yes, but it is hard to check"],
                      ["Access control", "Filter the chunks for each user", "Not possible after training", "For each prompt"],
                      ["Cost of each question", "A search and a short prompt", "A short prompt", "All the documents, each time"],
                      ["Changes the style of answers", "Little", "Yes", "Little"],
                      ["Typical failure", "The search finds the wrong chunks", "Confident answers without a source", "Facts lost in the middle"],
                    ].map(([p, a, b, c]) => (
                      <tr key={p}>
                        <td className="k">{p}</td>
                        <td className="a">{a}</td>
                        <td>{b}</td>
                        <td>{c}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <h3>Summary</h3>
            <ol className="sum">
              {[
                "RAG is a method, not a model.",
                "The system cuts the documents into chunks and makes a vector for each chunk.",
                "The search compares the question with the chunks and keeps the best k.",
                "The prompt holds the instruction, the kept chunks and the question.",
                "The model writes the answer from the chunks only, with a citation after each sentence.",
                "If no chunk contains the answer, the system refuses.",
                "To find a fault, check the documents, then the search, then the prompt, then the model.",
              ].map((s, i) => (
                <li key={s}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {s}
                </li>
              ))}
            </ol>
          </Section>

          {/* ============ A ============ */}
          <Section id="sA">
            <dl className="gloss">
              {[
                ["BM25", "A keyword search formula. It gives a high score to rare words that the question and the chunk share."],
                ["Chunk", "A small part of a document. The system stores, finds and cites chunks."],
                ["Context window", "The maximum number of tokens that a model reads and writes in one request."],
                ["Cosine similarity", "The cosine of the angle between two vectors. The value 1 means the same direction."],
                ["Embedding", "The vector that an embedding model makes from a text."],
                ["Faithfulness", "The share of answer sentences that the chunks support."],
                ["Gold chunk", "In a test set, the chunk that contains the answer to a question."],
                ["Grounded answer", "An answer that uses only facts from the chunks and cites them."],
                ["Hybrid search", "A search that joins the rankings of keyword search and meaning search."],
                ["MRR", "Mean reciprocal rank: the mean of 1 / rank of the gold chunk."],
                ["Prompt", "The text that the model reads before it writes."],
                ["Recall@k", "The share of questions with the gold chunk in the top k."],
                ["Reranker", "A model that scores a question and a chunk together, after the first search."],
                ["Token", "The unit of text that a model reads. One English token is about four characters."],
                ["Top-k", "The k chunks with the highest scores."],
                ["Vector index", "The store of all chunk vectors. It finds the nearest vectors fast."],
              ].map(([t, d]) => (
                <div key={t}>
                  <dt>{t}</dt>
                  <dd>{d}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <footer className="foot">
            <div className="stack">
              <div>
                <h5>Sources</h5>
                <ol>
                  <li>
                    Lewis, P. et al. (2020). <a href="https://arxiv.org/abs/2005.11401" target="_blank" rel="noreferrer">Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks</a>.
                  </li>
                  <li>Robertson, S. and Zaragoza, H. (2009). The Probabilistic Relevance Framework: BM25 and Beyond.</li>
                  <li>
                    Cormack, G. et al. (2009). <a href="https://doi.org/10.1145/1571941.1572114" target="_blank" rel="noreferrer">Reciprocal rank fusion outperforms Condorcet and individual rank learning methods</a>.
                  </li>
                  <li>
                    Liu, N. F. et al. (2023). <a href="https://arxiv.org/abs/2307.03172" target="_blank" rel="noreferrer">Lost in the Middle: How Language Models Use Long Contexts</a>.
                  </li>
                  <li>
                    Xiao, S. et al. (2023). <a href="https://arxiv.org/abs/2309.07597" target="_blank" rel="noreferrer">C-Pack: Packaged Resources To Advance General Chinese Embedding</a> (the BGE models).
                  </li>
                </ol>
              </div>
              <div>
                <h5>Colophon</h5>
                <p>
                  Set in IBM Plex Mono. Cobalt marks the key element of each figure. The HP-40 manual is not real. It is an example for this document. All scores,
                  vectors and answers come from real runs.
                </p>
              </div>
            </div>
            <div className="sign">
              <div className="rows">
                {[
                  ["Document", `RAG-100 · Rev ${REV} · ${ISSUED}`],
                  ["Prepared", "N. Saïd Ali"],
                  ["Measured", `${MODEL} · fastembed ${RUN.fastembed}`],
                  ["Language", "ASD-STE100 · sentence check: 0 faults"],
                  ["Figures", "09 · seven interactive"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <span>{k}</span>
                    <b>{v}</b>
                  </div>
                ))}
              </div>
              <div className="eod">End of document · RAG-100</div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
