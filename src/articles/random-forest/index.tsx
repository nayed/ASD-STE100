import Playground from "./Playground";
import { Fig1, Fig3Bars, Fig4Chips, RevealSvg, Toc } from "./figures";
import "./rf.css";

/* Listing 11-1: a Python example, with comments set in olive */
const SKLEARN = `from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.model_selection import train_test_split

iris = load_iris()
X, y = iris.data, iris.target
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=0)

forest = RandomForestClassifier(
    n_estimators=200,      # B: the number of trees
    max_features="sqrt",   # m = √p at each split
    oob_score=True,        # compute the OOB score (section 7.0)
    n_jobs=-1,             # train the trees in parallel
    random_state=0,
)
forest.fit(X_train, y_train)

print(f"OOB score:  {forest.oob_score_:.3f}")
print(f"test score: {forest.score(X_test, y_test):.3f}")

# permutation importance on test data (section 8.0)
result = permutation_importance(forest, X_test, y_test, random_state=0)
for name, value in zip(iris.feature_names, result.importances_mean):
    print(f"{name:18} {value:.3f}")`;

/* the real output of Listing 11-1, run with scikit-learn 1.9.1 on Python 3.14 */
const SKLEARN_OUTPUT = `OOB score:  0.955
test score: 0.974
sepal length (cm)  0.000
sepal width (cm)   0.000
petal length (cm)  0.137
petal width (cm)   0.184`;

function Listing({ code, output = false }: { code: string; output?: boolean }) {
  return (
    <pre className={output ? "code out" : "code"}>
      {code.split("\n").map((line, i) => {
        const at = line.indexOf("#");
        return (
          <span key={i}>
            {at < 0 ? line : line.slice(0, at)}
            {at >= 0 && <span className="c">{line.slice(at)}</span>}
            {"\n"}
          </span>
        );
      })}
    </pre>
  );
}

export default function RandomForest() {
  return (
    <div className="rf">
      <span className="crop c-tl"></span><span className="crop c-tr"></span>
      <span className="crop c-br"></span><span className="crop c-bl"></span>

      <div className="wrap">

        {/* ============ SIDEBAR ============ */}
        <aside className="side">
          <div className="side-inner">
            <div className="side-doc">RF-100</div>
            <div className="side-rev">REV B · RELEASED</div>
            <div className="side-h">CONTENTS</div>
            <Toc />
            <div className="side-meta">
              <div><span>STANDARD</span><b>ASD-STE100</b></div>
              <div><span>VOICE</span><b>ACTIVE</b></div>
              <div><span>TENSE</span><b>PRESENT</b></div>
              <div><span>SENTENCES</span><b>MAX 25 WORDS</b></div>
              <div><span>FIGURES</span><b>6 · TABLES 5</b></div>
            </div>
          </div>
        </aside>

        {/* ============ MAIN ============ */}
        <main>
          <header className="doc-head">
            <div className="eyebrow">TECHNICAL DOSSIER — MACHINE LEARNING SERIES</div>
            <h1>THE RANDOM FOREST ALGORITHM</h1>
            <p className="sub">DESCRIPTION, PROCEDURE, AND DIAGRAMS · WRITTEN IN SIMPLIFIED TECHNICAL ENGLISH (ASD-STE100)</p>
            <div className="stamp"><b>WRITTEN IN STE</b><span>ASD-STE100 · SIMPL. TECH. ENGLISH</span></div>
            <div className="meta-grid">
              <div><span className="k">DOC NO.</span><span className="v">RF-100</span></div>
              <div><span className="k">REVISION</span><span className="v">B</span></div>
              <div><span className="k">DATE</span><span className="v">2026-10-24</span></div>
              <div><span className="k">STATUS</span><span className="v g">RELEASED</span></div>
              <div><span className="k">WRITING STANDARD</span><span className="v">ASD-STE100</span></div>
              <div><span className="k">CLASSIFICATION</span><span className="v">UNCLASSIFIED</span></div>
            </div>
          </header>

          {/* 1.0 */}
          <section id="s1">
            <h2><span className="no">1.0</span>SCOPE</h2>
            <div className="mnote"><b>STE — WORDS</b>Short sentences only. Max 20 words per instruction. Max 25 words per description. One topic per paragraph.</div>
            <p>This document describes the Random Forest algorithm. The Random Forest is a supervised machine-learning method. It solves classification problems and regression problems. This document gives the theory, the procedure, and one interactive example.</p>
            <p>This document follows the writing rules of ASD-STE100. The sentences are short. The voice is active. The tense is the simple present. Each instruction stands alone in one sentence.</p>
            <div className="note"><span className="nk">NOTE — SOURCE</span>BREIMAN, L. "RANDOM FORESTS", MACHINE LEARNING 45(1), PAGES 5–32, 2001.</div>
          </section>

          {/* 2.0 */}
          <section id="s2">
            <h2><span className="no">2.0</span>DEFINITIONS</h2>
            <div className="mnote"><b>STE — NAMES</b>"Bootstrap", "Gini", and "Random Forest" are technical names. The standard permits technical names.</div>
            <p>Table 2-1 defines the terms of this document. Read this table before you read the procedure.</p>
            <table className="def">
              <thead><tr><th>TERM</th><th>MEANING</th></tr></thead>
              <tbody>
              <tr><td>DATA SET</td><td>A collection of examples. Each example holds values and a label.</td></tr>
              <tr><td>FEATURE</td><td>A property of an example. Examples: weight, color, size.</td></tr>
              <tr><td>CLASS</td><td>The category of the example. Example: "APPLE" or "LEMON".</td></tr>
              <tr><td>NODE</td><td>A test point of the tree. The node tests one feature against one threshold.</td></tr>
              <tr><td>LEAF</td><td>An end point of the tree. The leaf gives the result.</td></tr>
              <tr><td>BOOTSTRAP SAMPLE</td><td>A random sample of the data set. The draw is with replacement. Size: n examples.</td></tr>
              <tr><td>VOTE</td><td>The answer of one tree for one input.</td></tr>
              <tr><td>OVERFITTING</td><td>The model learns the noise of the training data. The model then fails on new data.</td></tr>
              <tr><td>OOB</td><td>"Out-of-bag". The examples that a bootstrap sample does not select. See section 7.0.</td></tr>
              <tr><td>GINI IMPURITY</td><td>A measure of the class mixture at a node. 0 means one class only. See section 3.1.</td></tr>
              <tr><td>n</td><td>The number of examples in the data set.</td></tr>
              <tr><td>B</td><td>The number of trees in the forest.</td></tr>
              <tr><td>p</td><td>The number of features of each example.</td></tr>
              <tr><td>m</td><td>The number of features that one split can test. m is smaller than p.</td></tr>
              </tbody>
            </table>
            <div className="figcap" style={{ marginTop: "8px" }}><span className="fno">TABLE 2-1</span><span>— TERMS OF THIS DOCUMENT</span><span className="fr">14 TERMS</span></div>
          </section>

          {/* 3.0 */}
          <section id="s3">
            <h2><span className="no">3.0</span>THE DECISION TREE</h2>
            <p>A decision tree is a flow chart of tests. Each internal node tests one feature against one threshold. Each branch is one answer. Each leaf gives one class. The tree sends each example along one path.</p>
            <p>Figure 1 shows a tree that classifies fruit. The green path shows the route of the current sample. Press "NEW SAMPLE" to send a different fruit through the tree.</p>

            <figure className="fig">
              <div className="figbody">
                <Fig1 />
              </div>
              <div className="figcap"><span className="fno">FIG. 1</span><span>— DECISION TREE, SINGLE SAMPLE PATH, FRUIT TASK</span><span className="fr">INTERACTIVE · 3 TESTS · 4 LEAVES</span></div>
            </figure>
            <h3><span className="no">3.1</span>HOW A NODE SELECTS ITS TEST</h3>
            <p>Each node must select one test. The tree measures the class mixture with the Gini impurity. For one node, G = 1 − Σ pₖ². Here, pₖ is the share of class k at the node.</p>
            <p>G = 0 means that the node holds one class only. With two classes, the maximum is 0.5. A good test makes two child nodes with low impurity.</p>
            <ol className="steps">
              <li>Calculate the impurity G of the node.</li>
              <li>Split the examples with one candidate test.</li>
              <li>Calculate G for each child node.</li>
              <li>Weight each child G by its share of the examples. Add the two values.</li>
              <li>Subtract this sum from the G of the node. The result is the Gini decrease.</li>
              <li>Repeat steps 2 to 5 for each candidate test. Select the largest decrease.</li>
            </ol>
            <table className="def">
              <thead><tr><th>NODE</th><th>APPLE</th><th>LEMON</th><th>GINI</th></tr></thead>
              <tbody>
              <tr><td>PARENT · 10 EXAMPLES</td><td>5</td><td>5</td><td>1 − 0.5² − 0.5² = 0.50</td></tr>
              <tr><td>YELLOW? NO · 5</td><td>4</td><td>1</td><td>1 − 0.8² − 0.2² = 0.32</td></tr>
              <tr><td>YELLOW? YES · 5</td><td>1</td><td>4</td><td>1 − 0.2² − 0.8² = 0.32</td></tr>
              <tr><td>AFTER THE SPLIT</td><td></td><td></td><td>0.5 × 0.32 + 0.5 × 0.32 = 0.32</td></tr>
              <tr><td>GINI DECREASE</td><td></td><td></td><td><b>0.50 − 0.32 = 0.18</b></td></tr>
              </tbody>
            </table>
            <div className="figcap" style={{ marginTop: "8px" }}><span className="fno">TABLE 3-1</span><span>— GINI DECREASE OF THE TEST "COLOR = YELLOW?"</span><span className="fr">WORKED EXAMPLE</span></div>
            <div className="note"><span className="nk">NOTE — REGRESSION</span>FOR REGRESSION, THE TREE USES THE VARIANCE OF THE TARGET VALUES. IT SELECTS THE SPLIT WITH THE LARGEST DECREASE IN VARIANCE.</div>
          </section>

          {/* 4.0 */}
          <section id="s4">
            <h2><span className="no">4.0</span>THE PROBLEM WITH ONE TREE</h2>
            <p>A tree can grow until it separates every training example. The tree then memorizes the noise. The training accuracy goes to 1.00. The accuracy on new data goes down. We call this effect overfitting.</p>
            <p>Figure 2 shows the typical curves. The test curve reaches a maximum at a moderate depth. After the maximum, the deep tree learns noise, not pattern. The forest in section 5.0 keeps deep trees and corrects them with a vote.</p>

            <figure className="fig">
              <div className="figbody">
                <RevealSvg id="fig2" viewBox="0 0 760 292" label="Accuracy versus tree depth chart">
                  <defs>
                    <pattern id="hatch" patternUnits="userSpaceOnUse" width="7" height="7">
                      <path d="M0,7 L7,0" stroke="#6E6E58" strokeWidth="1" opacity=".18"/>
                    </pattern>
                  </defs>
                  {/* overfit region */}
                  <rect className="late" x="365.5" y="30" width="354.5" height="220" fill="url(#hatch)"/>
                  <text className="late" x="712" y="47" fontSize="9.5" letterSpacing=".14em" fill="#6E6E58" textAnchor="end">OVERFITTING REGION</text>
                  {/* grid */}
                  <g stroke="#E7E5DA" strokeWidth="1">
                    <line x1="129.1" y1="30" x2="129.1" y2="250"/><line x1="188.2" y1="30" x2="188.2" y2="250"/>
                    <line x1="247.3" y1="30" x2="247.3" y2="250"/><line x1="306.4" y1="30" x2="306.4" y2="250"/>
                    <line x1="365.5" y1="30" x2="365.5" y2="250"/><line x1="424.5" y1="30" x2="424.5" y2="250"/>
                    <line x1="483.6" y1="30" x2="483.6" y2="250"/><line x1="542.7" y1="30" x2="542.7" y2="250"/>
                    <line x1="601.8" y1="30" x2="601.8" y2="250"/><line x1="660.9" y1="30" x2="660.9" y2="250"/>
                    <line x1="70" y1="74" x2="720" y2="74"/><line x1="70" y1="118" x2="720" y2="118"/>
                    <line x1="70" y1="162" x2="720" y2="162"/><line x1="70" y1="206" x2="720" y2="206"/>
                  </g>
                  {/* best depth marker */}
                  <line className="late" x1="365.5" y1="30" x2="365.5" y2="250" stroke="#0E7A3C" strokeWidth="1.5" strokeDasharray="5 4"/>
                  {/* axes */}
                  <line x1="70" y1="250" x2="720" y2="250" stroke="#191914" strokeWidth="1.5"/>
                  <line x1="70" y1="30" x2="70" y2="250" stroke="#191914" strokeWidth="1.5"/>
                  {/* y labels */}
                  <g fontSize="9.5" fill="#6E6E58" textAnchor="end">
                    <text x="62" y="34">100%</text><text x="62" y="78">90%</text><text x="62" y="122">80%</text>
                    <text x="62" y="166">70%</text><text x="62" y="210">60%</text><text x="62" y="254">50%</text>
                  </g>
                  {/* x labels */}
                  <g fontSize="9.5" fill="#6E6E58" textAnchor="middle">
                    <text x="70" y="266">1</text><text x="129.1" y="266">2</text><text x="188.2" y="266">3</text>
                    <text x="247.3" y="266">4</text><text x="306.4" y="266">5</text><text x="365.5" y="266">6</text>
                    <text x="424.5" y="266">7</text><text x="483.6" y="266">8</text><text x="542.7" y="266">9</text>
                    <text x="601.8" y="266">10</text><text x="660.9" y="266">11</text><text x="720" y="266">12</text>
                  </g>
                  <text x="395" y="288" fontSize="10" fill="#6E6E58" textAnchor="middle" letterSpacing=".12em">TREE DEPTH (LEVELS)</text>
                  <text transform="rotate(-90 20 140)" x="20" y="140" fontSize="9.5" fill="#6E6E58" textAnchor="middle" letterSpacing=".14em">ACCURACY</text>
                  {/* curves */}
                  <polyline className="draw" points="70,197.2 129.1,144.4 188.2,109.2 247.3,82.8 306.4,65.2 365.5,52 424.5,43.2 483.6,36.6 542.7,33.1 601.8,30.9 660.9,30 720,30" fill="none" stroke="#191914" strokeWidth="2"/>
                  <polyline className="draw" points="70,206 129.1,157.6 188.2,122.4 247.3,100.4 306.4,89.4 365.5,87.2 424.5,91.6 483.6,98.2 542.7,107 601.8,118 660.9,126.8 720,135.6" fill="none" stroke="#6E6E58" strokeWidth="2"/>
                  {/* annotations */}
                  <g className="late">
                    <circle cx="365.5" cy="87.2" r="4" fill="#0E7A3C"/>
                    <text x="358" y="244" fontSize="10.5" fontWeight="700" fill="#0E7A3C" textAnchor="end">BEST DEPTH 6</text>
                    <line x1="505" y1="158" x2="488" y2="106" stroke="#6E6E58" strokeWidth="1" strokeDasharray="3 3"/>
                    <text x="509" y="163" fontSize="10" fill="#6E6E58">NEW-DATA ACCURACY FALLS</text>
                    <line x1="80" y1="40" x2="106" y2="40" stroke="#191914" strokeWidth="2"/>
                    <text x="114" y="44" fontSize="10" fill="#191914">TRAIN SET</text>
                    <line x1="80" y1="58" x2="106" y2="58" stroke="#6E6E58" strokeWidth="2"/>
                    <text x="114" y="62" fontSize="10" fill="#6E6E58">TEST SET · NEW DATA</text>
                  </g>
                </RevealSvg>
              </div>
              <div className="figcap"><span className="fno">FIG. 2</span><span>— ACCURACY VERSUS TREE DEPTH, ONE TREE PER DEPTH LIMIT</span><span className="fr">TYPICAL CURVES · SYNTHETIC DATA</span></div>
            </figure>
          </section>

          {/* 5.0 */}
          <section id="s5">
            <h2><span className="no">5.0</span>THE FOREST PROCEDURE</h2>
            <p>The forest uses two sources of randomness against overfitting. Randomness makes the trees different. Different trees make different errors. The vote cancels the single errors. The procedure has three steps. This section gives steps 1 and 2.</p>

            <h3><span className="no">5.1</span>STEP 1 — MAKE THE BOOTSTRAP SAMPLES</h3>
            <ol className="steps">
              <li>Take one example from the data set at random.</li>
              <li>Put a copy of this example into the sample.</li>
              <li>Put the original example back into the data set.</li>
              <li>Repeat steps 1 to 3 until the sample has n examples.</li>
              <li>Make B samples in total. A typical value for B is 100.</li>
            </ol>
            <p>Figure 3 shows three samples of a data set with 12 examples. Look at the repeated examples. Look at the examples that the draw omits.</p>

            <figure className="fig">
              <div className="figbody">
                <svg id="fig3" viewBox="0 0 760 285" role="img" aria-label="Bootstrap sampling matrix">
                  <defs>
                    <marker id="ah3" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L8,4L0,8Z" fill="#6E6E58"/></marker>
                  </defs>
                  <text x="118" y="47" fontSize="12" fontWeight="600" textAnchor="end">D · 12</text>
                  <text x="118" y="139" fontSize="12" fontWeight="600" textAnchor="end">B1</text>
                  <text x="118" y="187" fontSize="12" fontWeight="600" textAnchor="end">B2</text>
                  <text x="118" y="235" fontSize="12" fontWeight="600" textAnchor="end">B3</text>
                  <Fig3Bars />
                  <line x1="250" y1="66" x2="250" y2="104" stroke="#6E6E58" strokeWidth="1.3" markerEnd="url(#ah3)"/>
                  <line x1="570" y1="66" x2="570" y2="104" stroke="#6E6E58" strokeWidth="1.3" markerEnd="url(#ah3)"/>
                  <text x="410" y="90" fontSize="10" fill="#6E6E58" textAnchor="middle" letterSpacing=".1em">THREE RANDOM SAMPLES · WITH REPLACEMENT</text>
                  {/* legend */}
                  <g fontSize="9.5" fill="#6E6E58">
                    <rect x="130" y="264" width="26" height="7.5" fill="#6E6E58"/>
                    <text x="164" y="273">×1 — SELECTED ONCE</text>
                    <rect x="322" y="255.5" width="26" height="7.5" fill="#6E6E58"/>
                    <rect x="322" y="264.5" width="26" height="7.5" fill="#0E7A3C"/>
                    <text x="356" y="273">×2 — SELECTED TWICE</text>
                    <rect x="522" y="255" width="26" height="17" fill="none" stroke="#6E6E58" strokeWidth="1.2" strokeDasharray="3 3"/>
                    <text x="556" y="273">0 — OUT-OF-BAG (NOT DRAWN)</text>
                  </g>
                </svg>
              </div>
              <div className="figcap"><span className="fno">FIG. 3</span><span>— BOOTSTRAP SAMPLING, THREE SAMPLES OF A 12-EXAMPLE SET</span><span className="fr">WITH REPLACEMENT · TYPICAL B = 100</span></div>
            </figure>

            <h3><span className="no">5.2</span>STEP 2 — GROW ONE TREE PER SAMPLE</h3>
            <ol className="steps">
              <li>Take one bootstrap sample from step 1.</li>
              <li>Start a tree at the root node.</li>
              <li>At each node, select a random subset of m features.</li>
              <li>Test only these m features.</li>
              <li>Select the split with the best Gini decrease.</li>
              <li>Split the examples into two child nodes.</li>
              <li>Repeat steps 3 to 6 until each leaf holds one class or very few examples.</li>
              <li>Make one tree for every bootstrap sample.</li>
            </ol>

            <figure className="fig">
              <div className="figbody">
                <svg id="fig4" viewBox="0 0 760 272" role="img" aria-label="Random feature subset selection at one node">
                  <defs>
                    <marker id="ah4" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L8,4L0,8Z" fill="#6E6E58"/></marker>
                  </defs>
                  <Fig4Chips />
                  {/* bracket around selected chips */}
                  <g stroke="#0E7A3C" strokeWidth="1.5" fill="none">
                    <path d="M415,59 H427"/><path d="M415,143 H427"/><path d="M415,199 H427"/><path d="M427,59 V199"/>
                  </g>
                  <line x1="427" y1="129" x2="460" y2="129" stroke="#6E6E58" strokeWidth="1.3" markerEnd="url(#ah4)"/>
                  <text x="433" y="118" fontSize="11" fontWeight="700" fill="#0E7A3C">m = 3</text>
                  {/* left box */}
                  <rect x="28" y="88" width="190" height="84" fill="none" stroke="#191914" strokeWidth="1.5"/>
                  <text x="123" y="108" fontSize="9.5" fill="#6E6E58" textAnchor="middle" letterSpacing=".14em">AT ONE NODE</text>
                  <text x="123" y="129" fontSize="13" fontWeight="600" textAnchor="middle">n EXAMPLES</text>
                  <text x="123" y="151" fontSize="11" textAnchor="middle">CANDIDATE FEATURES p = 8</text>
                  <line x1="218" y1="130" x2="242" y2="130" stroke="#6E6E58" strokeWidth="1.3" markerEnd="url(#ah4)"/>
                  {/* right box */}
                  <rect x="468" y="68" width="264" height="134" fill="none" stroke="#191914" strokeWidth="1.5"/>
                  <text x="600" y="92" fontSize="9.5" fill="#6E6E58" textAnchor="middle" letterSpacing=".16em">SPLIT SEARCH</text>
                  <line x1="484" y1="104" x2="716" y2="104" stroke="#E4E2D6" strokeWidth="1"/>
                  <text x="600" y="126" fontSize="11" textAnchor="middle">SCORE THE 3 CANDIDATE SPLITS</text>
                  <rect x="484" y="140" width="232" height="32" fill="rgba(14,122,60,.09)" stroke="#0E7A3C" strokeWidth="1.5"/>
                  <text x="600" y="161" fontSize="13" fontWeight="700" fill="#0E7A3C" textAnchor="middle">BEST SPLIT: X5 ≤ 4.5</text>
                  <text x="600" y="190" fontSize="9" fill="#6E6E58" textAnchor="middle" letterSpacing=".08em">THE OTHER 5 FEATURES: NOT TESTED</text>
                  <text x="28" y="262" fontSize="10" fill="#6E6E58" letterSpacing=".06em">TYPICAL: m = √p — CLASSIFICATION · m = p/3 — REGRESSION</text>
                </svg>
              </div>
              <div className="figcap"><span className="fno">FIG. 4</span><span>— RANDOM FEATURE SUBSET AT ONE NODE</span><span className="fr">m = 3 OF p = 8</span></div>
            </figure>

            <div className="note"><span className="nk">NOTE — TYPICAL VALUES</span>m = √p FOR CLASSIFICATION, AND m = p/3 FOR REGRESSION. THE TREES GROW TO FULL DEPTH. A DEPTH LIMIT IS OPTIONAL. IT SAVES MEMORY AND TIME.</div>
            <h3><span className="no">5.3</span>WHY TWO SOURCES OF RANDOMNESS</h3>
            <p>The vote cancels errors only when the trees make different errors. Bootstrap samples alone give similar trees. One strong feature often wins the first split in every tree. Then all trees make the same errors.</p>
            <p>The random feature subset stops this effect. Each tree must sometimes use a weaker feature. The trees become less correlated. A smaller m gives more different trees, but each tree is weaker.</p>
            <p>Bias is a constant error. Variance is an error that changes with the training sample. A deep tree has a small bias and a large variance. The vote reduces the variance. It does not reduce the bias. For this reason, the forest uses deep trees.</p>
          </section>

          {/* 6.0 */}
          <section id="s6">
            <h2><span className="no">6.0</span>THE VOTE</h2>
            <p>Step 3 collects the results of all trees. Figure 5 shows a vote of five trees. Class A gets three votes. Class B gets two votes. The result is class A.</p>
            <ol className="steps">
              <li>Give the new input to all B trees.</li>
              <li>Record the vote of each tree.</li>
              <li>Add the votes for each class.</li>
              <li>Select the class with the most votes.</li>
            </ol>
            <p>For regression, the forest does not count votes. The forest computes the mean of the tree results.</p>
            <div className="note"><span className="nk">NOTE — SOFT VOTE</span>SOME LIBRARIES DO NOT COUNT VOTES. SCIKIT-LEARN CALCULATES THE MEAN OF THE CLASS PROBABILITIES OF ALL TREES. IT THEN SELECTS THE CLASS WITH THE HIGHEST MEAN. THE RESULT IS USUALLY THE SAME.</div>

            <figure className="fig">
              <div className="figbody">
                <svg id="fig5" viewBox="0 0 760 315" role="img" aria-label="Majority vote diagram of five trees">
                  <defs>
                    <marker id="ah5" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L8,4L0,8Z" fill="#6E6E58"/></marker>
                  </defs>
                  {/* fan-out arrows */}
                  <g stroke="#6E6E58" strokeWidth="1.2" fill="none">
                    <path d="M142,165 H192 V35 H250"/><path d="M142,165 H192 V100 H250"/>
                    <path d="M142,165 H192 V165 H250"/><path d="M142,165 H192 V230 H250"/>
                    <path d="M142,165 H192 V290 H250"/>
                  </g>
                  {/* trees */}
                  <g>
                    <rect x="250" y="18" width="84" height="34" fill="none" stroke="#191914" strokeWidth="1.4"/><text x="292" y="39" fontSize="11" fontWeight="600" textAnchor="middle">TREE 1</text>
                    <rect x="250" y="83" width="84" height="34" fill="none" stroke="#191914" strokeWidth="1.4"/><text x="292" y="104" fontSize="11" fontWeight="600" textAnchor="middle">TREE 2</text>
                    <rect x="250" y="148" width="84" height="34" fill="none" stroke="#191914" strokeWidth="1.4"/><text x="292" y="169" fontSize="11" fontWeight="600" textAnchor="middle">TREE 3</text>
                    <rect x="250" y="213" width="84" height="34" fill="none" stroke="#191914" strokeWidth="1.4"/><text x="292" y="234" fontSize="11" fontWeight="600" textAnchor="middle">TREE 4</text>
                    <rect x="250" y="278" width="84" height="34" fill="none" stroke="#191914" strokeWidth="1.4"/><text x="292" y="299" fontSize="11" fontWeight="600" textAnchor="middle">TREE 5</text>
                  </g>
                  {/* tree to vote bus */}
                  <g stroke="#6E6E58" strokeWidth="1.2">
                    <path d="M334,35 H342"/><path d="M366,35 H396"/>
                    <path d="M334,100 H342"/><path d="M366,100 H396"/>
                    <path d="M334,165 H342"/><path d="M366,165 H396"/>
                    <path d="M334,230 H342"/><path d="M366,230 H396"/>
                    <path d="M334,290 H342"/><path d="M366,290 H396"/>
                    <path d="M396,35 V290"/>
                  </g>
                  <g fill="#191914">
                    <circle cx="396" cy="35" r="2.5"/><circle cx="396" cy="100" r="2.5"/><circle cx="396" cy="165" r="2.5"/>
                    <circle cx="396" cy="230" r="2.5"/><circle cx="396" cy="290" r="2.5"/>
                  </g>
                  <line x1="396" y1="165" x2="422" y2="165" stroke="#6E6E58" strokeWidth="1.3" markerEnd="url(#ah5)"/>
                  {/* vote chips */}
                  <g fontSize="10" fontWeight="700" textAnchor="middle">
                    <rect x="342" y="27" width="24" height="16" fill="none" stroke="#0E7A3C" strokeWidth="1.4"/><text x="354" y="39" fill="#0E7A3C">A</text>
                    <rect x="342" y="92" width="24" height="16" fill="none" stroke="#191914" strokeWidth="1.4"/><text x="354" y="104" fill="#191914">B</text>
                    <rect x="342" y="157" width="24" height="16" fill="none" stroke="#0E7A3C" strokeWidth="1.4"/><text x="354" y="169" fill="#0E7A3C">A</text>
                    <rect x="342" y="222" width="24" height="16" fill="none" stroke="#0E7A3C" strokeWidth="1.4"/><text x="354" y="234" fill="#0E7A3C">A</text>
                    <rect x="342" y="282" width="24" height="16" fill="none" stroke="#191914" strokeWidth="1.4"/><text x="354" y="294" fill="#191914">B</text>
                  </g>
                  {/* input */}
                  <rect x="30" y="140" width="112" height="50" fill="none" stroke="#191914" strokeWidth="1.5"/>
                  <text x="86" y="161" fontSize="9.5" fill="#6E6E58" textAnchor="middle" letterSpacing=".14em">NEW INPUT</text>
                  <text x="86" y="179" fontSize="11.5" fontWeight="600" textAnchor="middle">X = (X1, X2)</text>
                  {/* tally */}
                  <rect x="430" y="95" width="230" height="140" fill="none" stroke="#191914" strokeWidth="1.5"/>
                  <text x="444" y="120" fontSize="10" fill="#6E6E58" letterSpacing=".18em">VOTE TALLY</text>
                  <line x1="444" y1="132" x2="646" y2="132" stroke="#E4E2D6" strokeWidth="1"/>
                  <text x="444" y="163" fontSize="12" fontWeight="600">CLASS A</text>
                  <rect x="556" y="150" width="15" height="15" fill="#0E7A3C"/><rect x="576" y="150" width="15" height="15" fill="#0E7A3C"/><rect x="596" y="150" width="15" height="15" fill="#0E7A3C"/>
                  <text x="622" y="163" fontSize="13" fontWeight="700" fill="#0E7A3C">= 3</text>
                  <text x="444" y="197" fontSize="12" fontWeight="600">CLASS B</text>
                  <rect x="556" y="184" width="15" height="15" fill="#1D1D16"/><rect x="576" y="184" width="15" height="15" fill="#1D1D16"/>
                  <text x="622" y="197" fontSize="13" fontWeight="700">= 2</text>
                  <line x1="444" y1="214" x2="646" y2="214" stroke="#E4E2D6" strokeWidth="1"/>
                  <text x="444" y="228" fontSize="9.5" fill="#6E6E58" letterSpacing=".08em">MARGIN 3 : 2</text>
                  <line x1="545" y1="235" x2="545" y2="250" stroke="#6E6E58" strokeWidth="1.3" markerEnd="url(#ah5)"/>
                  <rect x="430" y="256" width="230" height="42" fill="rgba(14,122,60,.09)" stroke="#0E7A3C" strokeWidth="2"/>
                  <text x="545" y="276" fontSize="13.5" fontWeight="700" fill="#0E7A3C" textAnchor="middle">RESULT: CLASS A</text>
                  <text x="545" y="291" fontSize="9" fill="#6E6E58" textAnchor="middle" letterSpacing=".1em">MAJORITY OF B = 5 VOTES</text>
                </svg>
              </div>
              <div className="figcap"><span className="fno">FIG. 5</span><span>— MAJORITY VOTE OF FIVE TREES</span><span className="fr">RESULT: CLASS A · 3 : 2</span></div>
            </figure>
          </section>

          {/* 7.0 */}
          <section id="s7">
            <h2><span className="no">7.0</span>THE OUT-OF-BAG SCORE</h2>
            <p>On average, one bootstrap sample contains 63% of the examples. The draw omits the other 37%. We give these omitted examples a name: the out-of-bag examples. The short name is OOB.</p>
            <ol className="steps">
              <li>Grow the forest. Record the OOB examples of every tree.</li>
              <li>For each example, collect the votes of the trees that did not train on it.</li>
              <li>Compare these collected votes with the true labels.</li>
              <li>Compute the total accuracy. This number is the OOB score.</li>
            </ol>
            <p>The OOB score estimates the accuracy on new data. Each example is test data for about one third of the trees. You get this estimate without a separate test set.</p>
            <p>Use a separate test set for the final score. Also use it when you compare settings. The OOB score is a fast check, not a replacement.</p>
            <div className="note"><span className="nk">NOTE — THE NUMBER 63%</span>THE VALUE 1 − 1/e ≈ 0.632 IS THE LIMIT FOR A LARGE DATA SET. FOR n EXAMPLES, THE SHARE IS 1 − (1 − 1/n)ⁿ. FOR n = 12, THE SHARE IS 0.65.</div>
          </section>

          {/* 8.0 */}
          <section id="s8">
            <h2><span className="no">8.0</span>FEATURE IMPORTANCE</h2>
            <p>A forest can rank the features by their effect on the result. Libraries give two types of importance values. Table 8-1 compares them.</p>
            <table className="def">
              <thead><tr><th>TYPE</th><th>METHOD</th><th>WEAK POINT</th></tr></thead>
              <tbody>
              <tr><td>MEAN DECREASE IN IMPURITY</td><td>Add the Gini decrease of all splits on the feature. Calculate the mean over all trees.</td><td>It is fast. It favors features with many different values. It uses the training data.</td></tr>
              <tr><td>PERMUTATION IMPORTANCE</td><td>Shuffle the values of one feature in test data. Measure the decrease in accuracy.</td><td>It is slower. It measures the effect on data that the trees did not train on.</td></tr>
              </tbody>
            </table>
            <div className="figcap" style={{ marginTop: "8px" }}><span className="fno">TABLE 8-1</span><span>— TWO TYPES OF FEATURE IMPORTANCE</span><span className="fr">2 METHODS</span></div>
            <h3><span className="no">8.1</span>PROCEDURE — PERMUTATION IMPORTANCE</h3>
            <ol className="steps">
              <li>Measure the accuracy of the forest on test data.</li>
              <li>Shuffle the values of one feature in the test data.</li>
              <li>Measure the accuracy again.</li>
              <li>Record the decrease. A large decrease shows an important feature.</li>
              <li>Repeat steps 2 to 4 for each feature.</li>
            </ol>
            <div className="note"><span className="nk">NOTE — CORRELATED FEATURES</span>TWO CORRELATED FEATURES SHARE THEIR IMPORTANCE. EACH FEATURE CAN LOOK WEAK. TEST THE TWO FEATURES TOGETHER, OR REMOVE ONE OF THEM.</div>
          </section>
          {/* 9.0 */}
          <section id="s9">
            <h2><span className="no">9.0</span>ADVANTAGES AND LIMITS</h2>
            <p>Table 9-1 lists the strong points and the weak points of the method.</p>
            <div className="pl">
              <div>
                <h4 className="g">ADVANTAGES</h4>
                <ol>
                  <li data-pre="A">High accuracy on many data types.</li>
                  <li data-pre="A">More trees do not cause overfitting.</li>
                  <li data-pre="A">The trees train in parallel.</li>
                  <li data-pre="A">The OOB score gives an accuracy estimate at no extra cost.</li>
                  <li data-pre="A">The algorithm gives feature importance values.</li>
                  <li data-pre="A">The default settings often work well.</li>
                  <li data-pre="A">The features do not need scaling.</li>
                </ol>
              </div>
              <div>
                <h4>LIMITS</h4>
                <ol>
                  <li data-pre="L">A large forest uses much memory.</li>
                  <li data-pre="L">Prediction is slower than prediction with one tree.</li>
                  <li data-pre="L">The model is hard to interpret.</li>
                  <li data-pre="L">The model does not extrapolate beyond the range of the training data.</li>
                  <li data-pre="L">Importance values can be unreliable when features show correlation (section 8.0).</li>
                </ol>
              </div>
            </div>
            <div className="figcap" style={{ marginTop: "10px" }}><span className="fno">TABLE 9-1</span><span>— ADVANTAGES AND LIMITS OF THE RANDOM FOREST</span><span className="fr">7 + 5 ITEMS</span></div>
          </section>

          {/* 10.0 */}
          <section id="s10">
            <h2><span className="no">10.0</span>INTERACTIVE EXAMPLE</h2>
            <p>Figure 6 trains a small forest in your browser. All computation runs on this page. No data goes to a network. The toy problem has two classes and two features, X1 and X2.</p>
            <ol className="steps">
              <li>Select a data shape. "BLOBS" is easy. "MOONS" and "RING" are hard.</li>
              <li>Select class A or class B. Click inside the plot. A new point appears.</li>
              <li>Move the TREES control from 1 to 49. The vote map becomes smooth.</li>
              <li>Set TREES to 1. Set DEPTH to 9. One tree overfits. The map becomes jagged.</li>
              <li>Set TREES to 49. Keep DEPTH at 9.</li>
              <li>Compare MEAN TREE OOB with FOREST OOB. On "MOONS" and "RING", the forest usually scores higher.</li>
            </ol>

            <figure className="fig">
              <div className="figbody">
                <Playground />
              </div>
              <div className="figcap"><span className="fno">FIG. 6</span><span>— LIVE RANDOM FOREST, COMPUTED IN THIS PAGE</span><span className="fr">INTERACTIVE · NO NETWORK</span></div>
            </figure>

            <div className="note"><span className="nk">NOTE — READOUTS</span>"MEAN TREE OOB" IS THE AVERAGE SCORE OF ONE TREE ALONE. "FOREST OOB" IS THE SCORE OF THE FULL VOTE. BOTH NUMBERS COME FROM OUT-OF-BAG EXAMPLES (SECTION 7.0).</div>
          </section>

          {/* 11.0 */}
          <section id="s11">
            <h2><span className="no">11.0</span>THE FOREST IN CODE</h2>
            <p>Most projects use a library. scikit-learn is the standard Python library for classic machine learning. Every model trains with fit and predicts with predict.</p>
            <p>Listing 11-1 uses scikit-learn. It trains a forest and prints the OOB score and the test score. Then it prints the permutation importance of each feature.</p>
            <Listing code={SKLEARN} />
            <div className="figcap"><span className="fno">LISTING 11-1</span><span>— A RANDOM FOREST IN SCIKIT-LEARN</span><span className="fr">PYTHON · IRIS DATA SET</span></div>
            <p style={{ marginTop: "28px" }}>The listing gives this output:</p>
            <Listing code={SKLEARN_OUTPUT} output />
            <div className="figcap"><span className="fno">OUTPUT 11-1</span><span>— THE OUTPUT OF LISTING 11-1</span><span className="fr">SCIKIT-LEARN 1.9.1</span></div>
            <p style={{ marginTop: "20px" }}>The OOB score (0.955) is near the test score (0.974). The OOB estimate is correct here. Only the two petal features are important. Shuffle a sepal feature, and the test accuracy does not change.</p>
            <div className="note"><span className="nk">NOTE — VERSIONS</span>THIS OUTPUT COMES FROM SCIKIT-LEARN 1.9.1. OTHER VERSIONS CAN GIVE SLIGHTLY DIFFERENT NUMBERS.</div>
            <p style={{ marginTop: "28px" }}>Four settings control most of the result. Table 11-1 gives their effect.</p>
            <table className="def">
              <thead><tr><th>SETTING</th><th>EFFECT</th></tr></thead>
              <tbody>
              <tr><td>n_estimators (B)</td><td>More trees give a more stable vote. The accuracy stops increasing after some hundred trees. Each tree adds time.</td></tr>
              <tr><td>max_features (m)</td><td>Fewer features give more different trees, but weaker trees. Start with "sqrt" for classification.</td></tr>
              <tr><td>min_samples_leaf</td><td>Larger leaves give smoother results. Increase this value when the labels contain noise.</td></tr>
              <tr><td>max_depth</td><td>The default is no limit. Set a limit to save memory and time.</td></tr>
              </tbody>
            </table>
            <div className="figcap" style={{ marginTop: "8px" }}><span className="fno">TABLE 11-1</span><span>— THE FOUR MAIN SETTINGS</span><span className="fr">SCIKIT-LEARN NAMES</span></div>
            <div className="note"><span className="nk">NOTE — OTHER TREE ENSEMBLES</span>GRADIENT-BOOSTED TREES OFTEN GIVE A HIGHER ACCURACY ON TABLE DATA. EXAMPLES ARE XGBOOST, LIGHTGBM, AND HISTGRADIENTBOOSTING. THEY NEED MORE TUNING. A RANDOM FOREST IS A STRONG FIRST MODEL.</div>
          </section>
          {/* 12.0 */}
          <section id="s12">
            <h2><span className="no">12.0</span>SUMMARY</h2>
            <p className="sum">The Random Forest is a team of decision trees.</p>
            <p className="sum">Step 1 makes B bootstrap samples.</p>
            <p className="sum">Step 2 grows one deep tree per sample. Every split tests a random subset of features.</p>
            <p className="sum">Each split selects the largest Gini decrease.</p>
            <p className="sum">Step 3 collects the votes. The majority wins.</p>
            <p className="sum">One tree overfits. Many different trees cancel their errors.</p>
            <p className="sum key">This is the strength of the Random Forest. ■</p>
          </section>

          <footer>
            <div className="endline">— END OF DOCUMENT —</div>
            <div className="endmeta">RF-100 · REV B · SET IN IBM PLEX MONO · DIAGRAMS NOT TO SCALE · WRITTEN TO ASD-STE100</div>
            <div className="endmark">■</div>
          </footer>
        </main>
      </div>
    </div>
  );
}
