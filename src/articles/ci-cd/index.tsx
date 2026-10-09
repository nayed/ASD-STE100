import { useEffect, useRef } from "react";
import "./cicd.css";
import { mountCicd } from "./sim";
// the real CI of this repository, shown in 4.5 — imported, so the article never drifts from the file
import WORKFLOW from "../../../.github/workflows/ci.yml?raw";

const COLS = [1, 2, 3, 4, 5, 6, 7, 8];
const ROWS = ["A", "B", "C", "D", "E", "F"];

/**
 * TD-047, CI/CD with Git and GitHub. The markup is static; sim.ts drives the
 * clock, scroll progress, spine and the three interactive figures.
 */
export default function CiCd() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => (root.current ? mountCicd(root.current) : undefined), []);

  return (
    <div ref={root} className="cicd min-h-screen">
      {/* shared svg defs */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <marker id="mInk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10" fill="none" stroke="#3c3836" strokeWidth="1.6"/></marker>
          <marker id="mOlive" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10" fill="none" stroke="#7c6f64" strokeWidth="1.6"/></marker>
          <marker id="mTeal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10" fill="none" stroke="#3d7151" strokeWidth="1.6"/></marker>
          <pattern id="hatch" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">
            <rect width="7" height="7" fill="#ece7da"/>
            <line x1="0" y1="0" x2="0" y2="7" stroke="#3c3836" strokeOpacity="0.13" strokeWidth="1.2"/>
          </pattern>
        </defs>
      </svg>

      {/* zone rulers */}
      <div className="strip-h strip-t">{COLS.map((c) => <div key={c} className="zl">{c}</div>)}</div>
      <div className="strip-h strip-b">{COLS.map((c) => <div key={c} className="zl">{c}</div>)}</div>
      <div className="strip-v strip-l">{ROWS.map((r) => <div key={r} className="zl">{r}</div>)}</div>
      <div className="strip-v strip-r">{ROWS.map((r) => <div key={r} className="zl">{r}</div>)}</div>
      {/* fixed sheet chrome */}
      <div id="fr-out"></div><div id="fr-in"></div>
      <div id="prog"><div className="bar" id="bar"></div></div>
      <div className="cm t"></div><div className="cm b"></div><div className="cm l"></div><div className="cm r"></div>
      <div id="zone">ZONE A-1</div>
      <div id="roR"><b>TD-047</b> REV A</div>

      {/* left spine */}
      <aside className="spine">
        <div className="sp-doc">TD-047 · REV A · ASD-STE100</div>
        <nav className="sp-nav" id="spNav">
          <a href="#s01"><span>01</span></a>
          <a href="#s02"><span>02</span></a>
          <a href="#s03"><span>03</span></a>
          <a href="#s04"><span>04</span></a>
          <a href="#s05"><span>05</span></a>
          <a href="#s06"><span>06</span></a>
          <a href="#s07"><span>07</span></a>
          <a href="#s08"><span>08</span></a>
          <a href="#appA"><span>A</span></a>
        </nav>
      </aside>

      <div className="wrap">

      {/* ================= MASTHEAD ================= */}
      <header>
        <div className="mast-top">
          <span>TECHNICAL DOSSIER · SERIES <b>TD</b></span>
          <span>REF <b>TD-047</b> · REV <b>A</b></span>
        </div>
        <h1>Continuous Integration<br />and Continuous Delivery</h1>
        <div className="subject"><span className="sq"></span>SUBJECT — CI/CD PROCEDURE · VERSION CONTROL AND RELEASE PIPELINE · TOOLS: GIT, GITHUB</div>
        <div className="tblock">
          <div className="tb-t"><span className="k">Title</span><span className="v">CONTINUOUS INTEGRATION AND CONTINUOUS DELIVERY — CI/CD PROCEDURE</span></div>
          <div className="tb-d"><span className="k">Doc No</span><span className="v">TD-047</span></div>
          <div className="tb-r"><span className="k">Rev</span><span className="v">A</span></div>
          <div className="tb-s"><span className="k">Sheets</span><span className="v">08 + APP.A</span></div>
          <div className="tb-st"><span className="k">Status</span><span className="v"><span className="stsq"></span>PUBLISHED</span></div>
          <div className="tb-dt"><span className="k">Date</span><span className="v">2026-10-09</span></div>
          <div className="tb-sc"><span className="k">Scale</span><span className="v">NTS</span></div>
          <div className="tb-lg"><span className="k">Language</span><span className="v">ASD-STE100</span></div>
          <div className="tb-sign">
            <span><span className="k">Author</span><span className="v">N. SAÏD ALI</span></span>
            <span><span className="k">Draft</span><span className="v">AI-ASSISTED, EDITED</span></span>
            <span><span className="k">Checked</span><span className="v">NOT YET</span></span>
          </div>
        </div>
      </header>

      {/* ================= TOC ================= */}
      <nav className="toc">
        <div className="h2x">Contents</div>
        <ol>
          <li><a href="#s01"><span className="tno">01</span><span className="tt">GENERAL</span><span className="dots"></span><span className="pg">01</span></a></li>
          <li><a href="#s02"><span className="tno">02</span><span className="tt">GIT — VERSION CONTROL</span><span className="dots"></span><span className="pg">01</span></a></li>
          <li><a href="#s03"><span className="tno">03</span><span className="tt">GITHUB — THE SHARED REPOSITORY</span><span className="dots"></span><span className="pg">02</span></a></li>
          <li><a href="#s04"><span className="tno">04</span><span className="tt">CONTINUOUS INTEGRATION (CI)</span><span className="dots"></span><span className="pg">02</span></a></li>
          <li><a href="#s05"><span className="tno">05</span><span className="tt">CONTINUOUS DELIVERY AND DEPLOYMENT (CD)</span><span className="dots"></span><span className="pg">03</span></a></li>
          <li><a href="#s06"><span className="tno">06</span><span className="tt">THE COMPLETE PROCEDURE — SIMULATION</span><span className="dots"></span><span className="pg">04</span></a></li>
          <li><a href="#s07"><span className="tno">07</span><span className="tt">OPERATING RULES</span><span className="dots"></span><span className="pg">04</span></a></li>
          <li><a href="#s08"><span className="tno">08</span><span className="tt">DOCUMENT CONTROL</span><span className="dots"></span><span className="pg">05</span></a></li>
          <li><a href="#appA"><span className="tno">A</span><span className="tt">APPENDIX A — COMMAND REFERENCE</span><span className="dots"></span><span className="pg">05</span></a></li>
        </ol>
      </nav>

      {/* ================= 01 GENERAL ================= */}
      <section id="s01">
        <div className="shead">
          <span className="s-eyebrow">Section 01</span>
          <h2>General</h2>
          <span className="s-ghost">01</span>
        </div>
        <div className="sec-body">
          <h3><span className="idx">1.1</span>Purpose</h3>
          <p>This document tells you how a team records changes to software and how the team releases the software. The examples use Git for version control and GitHub for the shared repository. The text follows the main writing rules of ASD-STE100 Simplified Technical English.</p>

          <h3><span className="idx">1.2</span>Writing rules</h3>
          <div className="note">
            <span className="k">NOTE — STE</span>
            <span>SENTENCES: A MAXIMUM OF 20 WORDS · ONE INSTRUCTION PER SENTENCE.<br />VOICE: ACTIVE · TENSE: PRESENT.<br />VERBS: APPROVED WORDS. TECHNICAL NAMES (COMMIT, BRANCH, DEPLOY) ARE PERMITTED.</span>
          </div>

          <h3><span className="idx">1.3</span>Definitions</h3>
          <div className="tscroll"><table className="spec">
            <thead><tr><th style={{ width: "225px" }}>Term</th><th>Meaning</th></tr></thead>
            <tbody>
              <tr><td className="term">GIT</td><td>A tool that records the history of changes to files.</td></tr>
              <tr><td className="term">REPOSITORY</td><td>A store for a project and its full history.</td></tr>
              <tr><td className="term">COMMIT</td><td>A recorded change. Git gives each commit a unique name (SHA).</td></tr>
              <tr><td className="term">BRANCH</td><td>A line of work that starts at a commit. Work on a branch does not change other branches.</td></tr>
              <tr><td className="term">MAIN</td><td>The primary branch. The team keeps main stable at all times.</td></tr>
              <tr><td className="term">GITHUB</td><td>A web service that holds Git repositories and helps teams work together.</td></tr>
              <tr><td className="term">PULL REQUEST</td><td>A request to merge one branch into another. The team reviews the change.</td></tr>
              <tr><td className="term">PIPELINE</td><td>A set of automatic steps that build and test the software.</td></tr>
              <tr><td className="term">WORKFLOW</td><td>On GitHub, a file that tells GitHub Actions which pipeline to run, and when.</td></tr>
              <tr><td className="term">STATUS CHECK</td><td>The result of one pipeline job on a commit: pass or fail. GitHub shows it on the pull request.</td></tr>
              <tr><td className="term">ARTIFACT</td><td>A file that the pipeline makes. Example: a compiled program.</td></tr>
              <tr><td className="term">DEPLOY</td><td>To put a version of the software into an environment.</td></tr>
              <tr><td className="term">ROLLBACK</td><td>A procedure that returns the software to the last good version.</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* ================= 02 GIT ================= */}
      <section id="s02">
        <div className="shead">
          <span className="s-eyebrow">Section 02</span>
          <h2>Git — Version Control</h2>
          <span className="s-ghost">02</span>
        </div>
        <div className="sec-body">
          <h3><span className="idx">2.1</span>The four areas</h3>
          <p>Git keeps your files in three areas on your computer: the working directory, the index, and the local repository. The fourth area is the remote: a copy of the repository on a server. A change moves through the areas in this sequence:</p>
          <ol className="steps">
            <li>You edit files in the working directory.</li>
            <li>You put the changes that you select into the index with <code>git add</code>.</li>
            <li>You record the index as a commit with <code>git commit</code>.</li>
            <li>You send the commit to the remote with <code>git push</code>.</li>
          </ol>
          <div className="note"><span className="k">NOTE</span><span>Git gives each commit a unique name (SHA). Example: <b>a3f92c1</b>. You can change a commit that is only on your computer. Do not change a commit after you push it: other people can have that commit.</span></div>

          <figure className="fig">
            <figcaption className="fig-head">
              <span className="fig-no">FIG. 01</span><span className="fig-title">The four areas of Git — working copy to remote</span>
              <span className="fig-meta">INTERACTIVE · SHEET 1/5</span>
            </figcaption>
            <div className="fig-body">
              <svg className="svgbox" viewBox="0 0 940 240" role="img" aria-label="Diagram of the four Git areas">
                {/* command labels + ticks */}
                <text x="227" y="40" textAnchor="middle" fontSize="11" fontWeight="700" className="t-teal">git add</text>
                <line x1="227" y1="45" x2="227" y2="76" className="ln-olive" strokeDasharray="2 3"/>
                <text x="464" y="40" textAnchor="middle" fontSize="11" fontWeight="700" className="t-teal">git commit</text>
                <line x1="464" y1="45" x2="464" y2="76" className="ln-olive" strokeDasharray="2 3"/>
                <text x="701" y="40" textAnchor="middle" fontSize="11" fontWeight="700" className="t-teal">git push</text>
                <line x1="701" y1="45" x2="701" y2="76" className="ln-olive" strokeDasharray="2 3"/>
                {/* boxes */}
                <g>
                  <rect id="bxA" className="box boxR" x="15" y="54" width="190" height="62"/>
                  <rect x="25" y="64" width="15" height="15" fill="none" stroke="#3c3836" strokeWidth="1.2"/>
                  <text x="32.5" y="75.5" textAnchor="middle" fontSize="9" fontWeight="700" className="t-ink">A</text>
                  <text x="105" y="89" textAnchor="middle" fontSize="12" fontWeight="700" className="t-ink">WORKING DIR.</text>
                  <text x="105" y="104" textAnchor="middle" fontSize="8.5" letterSpacing="1" className="t-olive">YOU EDIT FILES</text>
                </g>
                <g>
                  <rect id="bxB" className="box boxR" x="252" y="54" width="190" height="62"/>
                  <rect x="262" y="64" width="15" height="15" fill="none" stroke="#3c3836" strokeWidth="1.2"/>
                  <text x="269.5" y="75.5" textAnchor="middle" fontSize="9" fontWeight="700" className="t-ink">B</text>
                  <text x="347" y="89" textAnchor="middle" fontSize="12" fontWeight="700" className="t-ink">INDEX</text>
                  <text x="347" y="104" textAnchor="middle" fontSize="8.5" letterSpacing="1" className="t-olive">STAGING AREA</text>
                </g>
                <g>
                  <rect id="bxC" className="box boxR" x="489" y="54" width="190" height="62"/>
                  <rect x="499" y="64" width="15" height="15" fill="none" stroke="#3c3836" strokeWidth="1.2"/>
                  <text x="506.5" y="75.5" textAnchor="middle" fontSize="9" fontWeight="700" className="t-ink">C</text>
                  <text x="584" y="89" textAnchor="middle" fontSize="12" fontWeight="700" className="t-ink">LOCAL REPO</text>
                  <text x="584" y="104" textAnchor="middle" fontSize="8.5" letterSpacing="1" className="t-olive">FULL HISTORY</text>
                </g>
                <g>
                  <rect id="bxD" x="726" y="54" width="190" height="62" fill="url(#hatch)" stroke="#3c3836" strokeWidth="1.5"/>
                  <rect x="736" y="64" width="15" height="15" fill="none" stroke="#3c3836" strokeWidth="1.2"/>
                  <text x="743.5" y="75.5" textAnchor="middle" fontSize="9" fontWeight="700" className="t-ink">D</text>
                  <text x="821" y="89" textAnchor="middle" fontSize="12" fontWeight="700" className="t-ink">REMOTE · GITHUB</text>
                  <text x="821" y="104" textAnchor="middle" fontSize="8.5" letterSpacing="1" className="t-olive">SHARED COPY</text>
                </g>
                {/* forward arrows */}
                <line x1="207" y1="85" x2="245" y2="85" className="ln-ink" markerEnd="url(#mInk)"/>
                <line x1="444" y1="85" x2="482" y2="85" className="ln-ink" markerEnd="url(#mInk)"/>
                <line x1="681" y1="85" x2="719" y2="85" className="ln-ink" markerEnd="url(#mInk)"/>
                {/* return path */}
                <path id="pull1" d="M821,121 V172 H110 V121" className="ln-olive" strokeDasharray="5 4" markerEnd="url(#mOlive)"/>
                <text x="465" y="192" textAnchor="middle" fontSize="10.5" className="t-olive">git pull = git fetch + git merge — get commits from the remote</text>
                <text id="shaL" className="f1sha" x="584" y="134" textAnchor="middle">7be04d2</text>
                {/* travelling token */}
                <g id="tok1" transform="translate(110,85)"><rect x="-7" y="-7" width="14" height="14"/></g>
              </svg>
              <div id="state1">STATE — <b>CHANGE IN WORKING DIRECTORY</b></div>
              <div className="btns" style={{ margin: "12px 0 4px" }}>
                <button className="btn" id="f1add"><span className="n">01</span>GIT ADD</button>
                <button className="btn" id="f1com" disabled><span className="n">02</span>GIT COMMIT</button>
                <button className="btn" id="f1push" disabled><span className="n">03</span>GIT PUSH</button>
                <button className="btn" id="f1pull" disabled><span className="n">04</span>GIT PULL</button>
                <button className="btn ghost" id="f1res" style={{ marginLeft: "auto" }}>RESET</button>
              </div>
            </div>
            <div className="fig-foot"><span>THE INDEX IS ALSO NAMED STAGING AREA. COMMAND NAMES ARE IN TEAL.</span><span>DWG TD-047-F01 · SCALE NTS</span></div>
          </figure>

          <h3><span className="idx">2.2</span>Fetch and pull</h3>
          <p><code>git pull</code> does two operations. First, <code>git fetch</code> gets the new commits from the remote. Then <code>git merge</code> adds these commits to your branch.</p>
          <p>Use <code>git fetch</code> alone when you want to look at the changes before you merge them. <code>git fetch</code> does not change your files.</p>

          <h3><span className="idx">2.3</span>Branches</h3>
          <p>The primary line of development has the name <b>main</b>. You make a new branch for each task. You make commits on your branch. The work on your branch does not change main.</p>
          <p>When the task is complete, you merge the branch into main. Git keeps the full history as a graph.</p>

          <figure className="fig">
            <figcaption className="fig-head">
              <span className="fig-no">FIG. 02</span><span className="fig-title">Branch and merge — the commit graph</span>
              <span className="fig-meta">HOVER COMMITS · SHEET 2/5</span>
            </figcaption>
            <div className="fig-body">
              <svg className="svgbox" viewBox="0 0 940 235" role="img" aria-label="Branch and merge commit graph">
                {/* ambient sync dot */}
                <circle r="3.5" fill="var(--teal)" opacity="0.9">
                  <animateMotion dur="9s" repeatCount="indefinite" path="M45,80 H155 C215,80 215,190 275,190 H655 C715,190 715,80 755,80 H895"/>
                </circle>
                {/* branch path (below main) */}
                <path d="M155,80 C215,80 215,190 275,190 L655,190 C715,190 715,80 755,80" className="ln-ink"/>
                {/* main line (top) */}
                <line x1="45" y1="80" x2="895" y2="80" className="ln-ink"/>
                <text x="58" y="58" fontSize="10" className="t-olive">main</text>
                <text x="465" y="222" textAnchor="middle" fontSize="10.5" className="t-olive">feature/login-fix</text>
                {/* commits */}
                <g className="commit" transform="translate(85,80)"><text className="sha" y="-18">e4a1f02</text><circle r="7"/></g>
                <g className="commit" transform="translate(155,80)"><text className="sha" y="-18">9c3d71f</text><circle r="7"/></g>
                <g className="commit" transform="translate(305,190)"><text className="sha" y="30">b7f2c88</text><circle r="7"/></g>
                <g className="commit" transform="translate(385,190)"><text className="sha" y="30">2da90e4</text><circle r="7"/></g>
                <g className="commit" transform="translate(465,190)"><text className="sha" y="30">51e77aa</text><circle r="7"/></g>
                <g className="commit merge" transform="translate(755,80)"><text className="sha" y="-18" fill="var(--teal)">a3f92c1</text><circle r="7"/></g>
                <text x="755" y="106" textAnchor="middle" fontSize="8.5" letterSpacing="1.5" className="t-olive">MERGE</text>
                <g className="commit" transform="translate(830,80)"><text className="sha" y="30">f01c35a</text><circle r="7"/></g>
                {/* HEAD pointer */}
                <line x1="830" y1="44" x2="830" y2="66" className="ln-olive" markerEnd="url(#mOlive)"/>
                <text x="830" y="36" textAnchor="middle" fontSize="9.5" className="t-olive">HEAD → main</text>
              </svg>
            </div>
            <div className="fig-foot"><span>POINT AT A COMMIT TO SHOW ITS SHA. THE TEAL DOT TRACES THE SYNC PATH.</span><span>DWG TD-047-F02 · SCALE NTS</span></div>
          </figure>
        </div>
      </section>

      {/* ================= 03 GITHUB ================= */}
      <section id="s03">
        <div className="shead">
          <span className="s-eyebrow">Section 03</span>
          <h2>GitHub — The Shared Repository</h2>
          <span className="s-ghost">03</span>
        </div>
        <div className="sec-body">
          <p>GitHub keeps a copy of the repository on the internet. The copy is the <b>remote</b>. Team members push commits to the remote. Team members get commits from the remote with <code>git pull</code>. GitHub shows the history, the branches, and the code reviews in a web interface.</p>

          <h3><span className="idx">3.1</span>Protected branches</h3>
          <div className="note caution"><span className="k">CAUTION</span><span>DO NOT PUSH DIRECTLY TO MAIN. MAIN IS A PROTECTED BRANCH. ALL CHANGES GO THROUGH A PULL REQUEST.</span></div>
          <p>A protected branch does not accept direct pushes. This rule keeps main stable. On GitHub, you set the rules in the repository settings, under Branches or Rules. Typical rules: require a pull request, require a review, and require the status checks to pass (see 4.6).</p>

          <h3><span className="idx">3.2</span>Pull request procedure</h3>
          <ol className="steps">
            <li>Push your branch to GitHub.</li>
            <li>Open a pull request on the GitHub website.</li>
            <li>Ask a team member to review the change.</li>
            <li>Wait for the automatic checks of the pipeline.</li>
            <li>Merge the pull request when all checks pass.</li>
            <li>Delete the branch after the merge.</li>
          </ol>
          <div className="note"><span className="k">NOTE</span><span>A reviewer writes comments on the code. You make the requested changes before the merge.</span></div>
        </div>
      </section>

      {/* ================= 04 CI ================= */}
      <section id="s04">
        <div className="shead">
          <span className="s-eyebrow">Section 04</span>
          <h2>Continuous Integration (CI)</h2>
          <span className="s-ghost">04</span>
        </div>
        <div className="sec-body">
          <h3><span className="idx">4.1</span>Principle</h3>
          <p>Continuous integration (CI) is a practice. Team members merge their work into main often. After each push and on each pull request, an automatic pipeline builds the software and runs the tests. The pipeline gives a clear signal: the change is good, or the change is bad.</p>

          <h3><span className="idx">4.2</span>Steps of the pipeline</h3>
          <div className="tscroll"><table className="spec">
            <thead><tr><th style={{ width: "225px" }}>Step</th><th>Function</th></tr></thead>
            <tbody>
              <tr><td className="term">BUILD</td><td>The pipeline compiles the code. If the build fails, the pipeline stops.</td></tr>
              <tr><td className="term">TEST</td><td>The pipeline runs the automatic tests. Failed tests stop the pipeline.</td></tr>
              <tr><td className="term">ANALYSIS</td><td>A tool checks the code against the style rules.</td></tr>
              <tr><td className="term">PACKAGE</td><td>The pipeline makes an artifact for deployment.</td></tr>
            </tbody>
          </table></div>

          <h3><span className="idx">4.3</span>Why CI works</h3>
          <p>Small changes are easy to review. An error stays near the change that caused the error. The team finds the error in minutes, not in weeks.</p>

          <h3><span className="idx">4.4</span>Operation</h3>
          <p>Use the simulation below. Start a pipeline run. If you want, put a fault into the TEST step. Then look at the result.</p>
          <p>This pipeline continues after CI. It deploys to staging and to production with no approval. That is continuous deployment (5.2). Section 5 shows the approval gate of continuous delivery.</p>

          <figure className="fig">
            <figcaption className="fig-head">
              <span className="fig-no">FIG. 03</span><span className="fig-title">CI/CD pipeline — continuous deployment, no approval gate</span>
              <span className="fig-meta">INTERACTIVE · SHEET 3/5</span>
            </figcaption>
            <div className="fig-body">
              <div className="stamp" id="stamp3">RELEASED</div>
              <div className="runbar">
                <span id="runinfo">PIPELINE IDLE — LAST TRIGGER: PUSH TO main</span>
                <span className="tel">T+<span id="el3">0.0</span>S</span>
              </div>
              <div className="pipe">
                <div className="stage"><header><span>S1</span><span className="lamp"></span></header><div className="nm">SOURCE</div><div className="st">IDLE</div></div>
                <div className="stage"><header><span>S2</span><span className="lamp"></span></header><div className="nm">BUILD</div><div className="st">IDLE</div></div>
                <div className="stage"><header><span>S3</span><span className="lamp"></span></header><div className="nm">TEST</div><div className="st">IDLE</div></div>
                <div className="stage"><header><span>S4</span><span className="lamp"></span></header><div className="nm">PACKAGE</div><div className="st">IDLE</div></div>
                <div className="stage"><header><span>S5</span><span className="lamp"></span></header><div className="nm">STAGING</div><div className="st">IDLE</div></div>
                <div className="stage"><header><span>S6</span><span className="lamp"></span></header><div className="nm">PRODUCTION</div><div className="st">IDLE</div></div>
              </div>
              <div className="ctrls" style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center", marginBottom: "14px" }}>
                <button className="btn primary" id="run3">RUN PIPELINE</button>
                <label className="fault"><input type="checkbox" id="fault3" /><span className="sw"></span><span className="ftxt">Fault injection — TEST step</span></label>
                <button className="btn ghost" id="reset3" style={{ marginLeft: "auto" }}>RESET</button>
              </div>
              <div className="console" id="cons3"></div>
            </div>
            <div className="fig-foot"><span>SIMULATION — ALL STEPS RUN IN YOUR BROWSER. NO DATA LEAVES THIS PAGE.</span><span>DWG TD-047-F03 · INTERACTIVE</span></div>
          </figure>

          <h3><span className="idx">4.5</span>CI on GitHub — GitHub Actions</h3>
          <p>GitHub runs pipelines with GitHub Actions. You write the pipeline in a workflow file. You put the file in the folder <code>.github/workflows/</code> of the repository. GitHub reads the file after each push.</p>
          <p>A workflow has three parts:</p>
          <ol className="steps">
            <li><b>on</b> — the events that start the workflow. Example: a push to main, or a pull request.</li>
            <li><b>runs-on</b> — the runner: a new, clean computer that GitHub gives to the job.</li>
            <li><b>steps</b> — the commands that the runner does, in sequence. If one step fails, the job stops.</li>
          </ol>
          <p>The workflow below is the CI of this wiki. It checks each pull request and each push to main.</p>
          <div className="listing">
            <div className="listing-head"><span>.github/workflows/ci.yml</span><span>YAML · THIS REPOSITORY</span></div>
            <pre>{WORKFLOW.split("\n").map((line, i) => (
              <span key={i} className={line.trimStart().startsWith("#") ? "c" : undefined}>{line + "\n"}</span>
            ))}</pre>
          </div>
          <div className="note"><span className="k">NOTE</span><span>Use <code>npm ci</code>, not <code>npm install</code>, in CI. <code>npm ci</code> installs the exact versions in <code>package-lock.json</code>. Each run then uses the same dependencies.</span></div>

          <h3><span className="idx">4.6</span>Required status checks</h3>
          <p>Each job in a workflow gives a status check on the commit. GitHub shows the checks on the pull request.</p>
          <p>A status check alone does not stop a merge. To stop the merge of a bad change, make the check required. Add the check to the protection rules of main (3.1). Then GitHub does not let you merge until the check passes.</p>
        </div>
      </section>

      {/* ================= 05 CD ================= */}
      <section id="s05">
        <div className="shead">
          <span className="s-eyebrow">Section 05</span>
          <h2>Continuous Delivery and Deployment (CD)</h2>
          <span className="s-ghost">05</span>
        </div>
        <div className="sec-body">
          <h3><span className="idx">5.1</span>Delivery</h3>
          <p>Continuous delivery adds steps after CI. The pipeline makes an artifact and puts the artifact into a release store. A person approves the release to production.</p>

          <h3><span className="idx">5.2</span>Deployment</h3>
          <p>Continuous deployment goes one step further. The pipeline deploys each good change to production. No person gives approval.</p>
          <div className="note"><span className="k">EXAMPLE</span><span>This wiki uses continuous deployment. After each push to main, Netlify builds the site and publishes it. GitHub Actions (4.5) checks the same commit in parallel.</span></div>

          <h3><span className="idx">5.3</span>Environments</h3>
          <p>The pipeline deploys the artifact to the environments in this sequence: development, staging, production. Staging is a copy of production. The team tests each release in staging first.</p>

          <figure className="fig">
            <figcaption className="fig-head">
              <span className="fig-no">FIG. 04</span><span className="fig-title">Deployment environments — the approval gate</span>
              <span className="fig-meta">ANIMATED · SHEET 4/5</span>
            </figcaption>
            <div className="fig-body">
              <svg className="svgbox" viewBox="0 0 940 245" role="img" aria-label="Deployment environments diagram">
                {/* flow dots */}
                <circle r="4" fill="var(--teal)"><animateMotion dur="2.6s" repeatCount="indefinite" path="M272,125 L358,125"/></circle>
                <circle r="4" fill="var(--teal)"><animateMotion dur="2.6s" begin="1.3s" repeatCount="indefinite" path="M582,125 L606,125"/></circle>
                {/* dev */}
                <rect x="50" y="92" width="220" height="66" className="box"/>
                <text x="160" y="120" textAnchor="middle" fontSize="13" fontWeight="700" className="t-ink">DEV</text>
                <text x="160" y="139" textAnchor="middle" fontSize="8.5" letterSpacing="1" className="t-olive">AUTOMATIC — EACH MERGE</text>
                {/* staging */}
                <rect x="360" y="92" width="220" height="66" className="box"/>
                <text x="470" y="120" textAnchor="middle" fontSize="13" fontWeight="700" className="t-ink">STAGING</text>
                <text x="470" y="139" textAnchor="middle" fontSize="8.5" letterSpacing="1" className="t-olive">AUTOMATIC — AFTER CI</text>
                {/* production (double border + hatch) */}
                <rect x="664" y="86" width="232" height="78" fill="none" stroke="#7c6f64" strokeWidth="1"/>
                <rect x="670" y="92" width="220" height="66" fill="url(#hatch)" stroke="#3c3836" strokeWidth="1.5"/>
                <text x="780" y="120" textAnchor="middle" fontSize="13" fontWeight="700" className="t-ink">PRODUCTION</text>
                <text x="780" y="139" textAnchor="middle" fontSize="8.5" letterSpacing="1" className="t-olive">LIVE SYSTEM — USERS</text>
                {/* arrows */}
                <line x1="272" y1="125" x2="354" y2="125" className="ln-ink" markerEnd="url(#mInk)"/>
                <line x1="582" y1="125" x2="610" y2="125" className="ln-ink"/>
                <line x1="640" y1="125" x2="662" y2="125" className="ln-ink" markerEnd="url(#mInk)"/>
                {/* approval gate — valve symbol */}
                <polygon points="612,114 612,136 627,125" fill="var(--panel)" stroke="#3c3836" strokeWidth="1.5"/>
                <polygon points="638,114 638,136 623,125" fill="var(--panel)" stroke="#3c3836" strokeWidth="1.5"/>
                <text x="625" y="152" textAnchor="middle" fontSize="8.5" letterSpacing="1.5" className="t-olive">APPROVAL</text>
                {/* legend */}
                <text x="50" y="205" fontSize="10" className="t-olive">CONTINUOUS DELIVERY — THE RELEASE STOPS BEFORE THE GATE. A PERSON APPROVES.</text>
                <text x="50" y="226" fontSize="10" className="t-teal">CONTINUOUS DEPLOYMENT — THE PIPELINE OPENS THE GATE. NO PERSON APPROVES.</text>
              </svg>
            </div>
            <div className="fig-foot"><span>THE GATE BETWEEN STAGING AND PRODUCTION NEEDS THE APPROVAL OF A PERSON.</span><span>DWG TD-047-F04 · SCALE NTS</span></div>
          </figure>

          <h3><span className="idx">5.4</span>The approval gate on GitHub</h3>
          <p>On GitHub, a deployment job can use an environment. Example: an environment with the name production. You can give the environment required reviewers.</p>
          <p>When the job starts, it stops and waits. A reviewer approves the deployment on GitHub. Then the job continues. This is the approval gate of FIG. 04.</p>

          <h3><span className="idx">5.5</span>Rollback</h3>
          <p>Sometimes a release shows an error in production. Then you do a rollback. A rollback puts the last good version into production. Keep the rollback procedure simple. Test the rollback procedure at regular intervals.</p>
          <p>In a pipeline, a rollback deploys the previous artifact again. It does not change the history in Git. To undo the change in Git, use <code>git revert</code>. It makes a new commit that undoes the change. The pipeline then deploys that commit, the same as all other changes.</p>
          <div className="note"><span className="k">NOTE</span><span>Do not deploy a fix directly to production. Send all fixes through the pipeline.</span></div>
        </div>
      </section>

      {/* ================= 06 PROCEDURE ================= */}
      <section id="s06">
        <div className="shead">
          <span className="s-eyebrow">Section 06</span>
          <h2>The Complete Procedure — Simulation</h2>
          <span className="s-ghost">06</span>
        </div>
        <div className="sec-body">
          <p>Sections 2 to 5 give the separate procedures. This section shows the complete sequence.</p>
          <p>Use the simulation. Press each button and do one step. The console shows the commands. Set fault injection if you want the CI step to find a fault. Then you push a fix, and CI runs again.</p>

          <figure className="fig">
            <figcaption className="fig-head">
              <span className="fig-no">FIG. 05</span><span className="fig-title">Complete procedure — branch to production</span>
              <span className="fig-meta">INTERACTIVE · SHEET 5/5</span>
            </figcaption>
            <div className="fig-body">
              <div className="stamp" id="stamp5">DEPLOYED</div>
              <svg className="svgbox" viewBox="0 0 940 385" role="img" aria-label="Interactive branch and merge simulation">
                {/* main line */}
                <line x1="60" y1="280" x2="880" y2="280" className="ln-ink"/>
                <text x="66" y="262" fontSize="10" className="t-olive">main</text>
                {/* base commits */}
                <g transform="translate(115,280)"><circle r="7" fill="var(--panel)" stroke="#3c3836" strokeWidth="1.8"/><text y="24" textAnchor="middle" fontSize="9" className="t-olive">e4a1f02</text></g>
                <g transform="translate(185,280)"><circle r="7" fill="var(--panel)" stroke="#3c3836" strokeWidth="1.8"/><text y="24" textAnchor="middle" fontSize="9" className="t-olive">9c3d71f</text></g>
                {/* branch path */}
                <path id="brPath" d="M185,280 C255,280 255,165 325,165 L600,165" className="ln-ink"/>
                <g id="brLblG" className="fade"><text x="330" y="142" textAnchor="middle" fontSize="10.5" fontWeight="600" className="t-teal">fix/login-error</text></g>
                {/* branch commits */}
                <g id="cb1" className="pop" transform="translate(365,165)"><circle r="7"/></g>
                <g id="cb2" className="pop" transform="translate(485,165)"><circle r="7"/></g>
                <g id="cbf" className="pop" transform="translate(585,165)"><circle r="7"/></g>
                {/* merge path + commit */}
                <path id="mgPath" d="M600,165 C675,165 675,280 745,280" className="ln-ink"/>
                <g id="mgG" className="fade">
                  <circle cx="745" cy="280" r="8" fill="var(--teal)"/>
                  <text x="745" y="264" textAnchor="middle" fontSize="8.5" letterSpacing="1.5" className="t-olive">MERGE</text>
                  <text x="745" y="304" textAnchor="middle" fontSize="9" className="t-teal">a3f92c1</text>
                </g>
                {/* pull request card */}
                <g id="prG" className="fade">
                  <rect x="400" y="70" width="250" height="72" fill="var(--panel)" stroke="#3c3836" strokeWidth="1.5" strokeDasharray="5 4"/>
                  <text x="525" y="90" textAnchor="middle" fontSize="11" fontWeight="700" className="t-ink">PULL REQUEST #47</text>
                  <text x="525" y="104" textAnchor="middle" fontSize="8.5" letterSpacing="1" className="t-olive">REVIEW + AUTOMATIC CHECKS</text>
                  <rect id="lB" className="lampSVG" x="455" y="112" width="9" height="9"/>
                  <rect id="lT" className="lampSVG" x="515" y="112" width="9" height="9"/>
                  <rect id="lL" className="lampSVG" x="575" y="112" width="9" height="9"/>
                  <text x="459" y="134" textAnchor="middle" fontSize="7.5" className="t-olive">BUILD</text>
                  <text x="519" y="134" textAnchor="middle" fontSize="7.5" className="t-olive">TEST</text>
                  <text x="579" y="134" textAnchor="middle" fontSize="7.5" className="t-olive">LINT</text>
                </g>
                {/* deploy */}
                <g id="depG" className="fade">
                  <path id="depLine" d="M745,290 L745,326" className="ln-teal"/>
                  <polygon className="tip" points="745,332 739,322 751,322" fill="var(--teal)" style={{ opacity: "0", transition: "opacity .25s .75s" }}/>
                  <rect x="668" y="330" width="154" height="38" fill="var(--panel)" stroke="#3c3836" strokeWidth="1.5"/>
                  <text x="745" y="353" textAnchor="middle" fontSize="11" fontWeight="700" className="t-ink">PRODUCTION</text>
                  <text x="764" y="318" fontSize="10" fontWeight="700" className="t-teal">v2.4.1</text>
                  <circle id="rip5" className="rip" cx="745" cy="330" r="9"/>
                </g>
              </svg>
              <div className="btns" style={{ margin: "18px 0 14px" }}>
                <button className="btn" id="b51"><span className="n">01</span>CREATE BRANCH</button>
                <button className="btn" id="b52" disabled><span className="n">02</span>COMMIT</button>
                <button className="btn" id="b53" disabled><span className="n">03</span>COMMIT</button>
                <button className="btn" id="b54" disabled><span className="n">04</span>PUSH · OPEN PR</button>
                <button className="btn" id="b55" disabled><span className="n">05</span>RUN CI</button>
                <button className="btn fixb hide" id="b5fix"><span className="n">F</span>PUSH FIX · RE-RUN CI</button>
                <button className="btn" id="b56" disabled><span className="n">06</span>MERGE → MAIN</button>
                <button className="btn" id="b57" disabled><span className="n">07</span>DEPLOY</button>
                <label className="fault"><input type="checkbox" id="fault5" /><span className="sw"></span><span className="ftxt">Fault injection — TEST</span></label>
                <button className="btn ghost" id="b5r" style={{ marginLeft: "auto" }}>RESET</button>
              </div>
              <div className="console" id="cons5"></div>
            </div>
            <div className="fig-foot"><span>SIMULATION — SET FAULT INJECTION TO MAKE THE CI STEP FIND A FAULT. THEN YOU PUSH A FIX AND RUN CI AGAIN.</span><span>DWG TD-047-F05 · INTERACTIVE</span></div>
          </figure>
        </div>
      </section>

      {/* ================= 07 RULES ================= */}
      <section id="s07">
        <div className="shead">
          <span className="s-eyebrow">Section 07</span>
          <h2>Operating Rules</h2>
          <span className="s-ghost">07</span>
        </div>
        <div className="sec-body">
          <p>Follow these rules at all times. The rules keep the release procedure safe.</p>
          <div className="tscroll"><table className="spec">
            <thead><tr><th style={{ width: "320px" }}>Rule</th><th>Reason</th></tr></thead>
            <tbody>
              <tr><td className="term">Make small commits.</td><td>Small commits are easy to review and to revert.</td></tr>
              <tr><td className="term">Use a branch for each task.</td><td>Main stays stable at all times.</td></tr>
              <tr><td className="term">Run the pipeline before each merge.</td><td>Bad code does not reach main.</td></tr>
              <tr><td className="term">Merge to main often.</td><td>Each merge has few changes. Few changes make errors easy to find.</td></tr>
              <tr><td className="term">Deploy to production at regular intervals.</td><td>Each release is small. A rollback is then easy.</td></tr>
              <tr><td className="term">Test the rollback procedure.</td><td>The team can recover quickly from a bad release.</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* ================= 08 DOC CONTROL ================= */}
      <section id="s08">
        <div className="shead">
          <span className="s-eyebrow">Section 08</span>
          <h2>Document Control</h2>
          <span className="s-ghost">08</span>
        </div>
        <div className="sec-body">
          <div className="tscroll"><table className="spec">
            <thead><tr><th style={{ width: "70px" }}>Rev</th><th style={{ width: "130px" }}>Date</th><th>Description</th><th style={{ width: "140px" }}>Author</th></tr></thead>
            <tbody>
              <tr><td className="term">A</td><td>2026-10-09</td><td>First issue in this wiki. An AI-generated draft, edited: GitHub Actions (4.5, 4.6, 5.4), git fetch (2.2), rollback and git revert (5.5), fault injection in FIG. 05.</td><td>N. SAÏD ALI</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* ================= APPENDIX A ================= */}
      <section id="appA">
        <div className="shead">
          <span className="s-eyebrow">Appendix A</span>
          <h2>Appendix A — Command Reference</h2>
          <span className="s-ghost">A</span>
        </div>
        <div className="sec-body">
          <div className="tscroll"><table className="spec">
            <thead><tr><th style={{ width: "320px" }}>Command</th><th>Function</th></tr></thead>
            <tbody>
              <tr><td className="term">git clone &lt;url&gt;</td><td>Get a full copy of a remote repository.</td></tr>
              <tr><td className="term">git status</td><td>Show the state of the working directory and the index.</td></tr>
              <tr><td className="term">git switch -c &lt;name&gt;</td><td>Make a new branch and change to the branch. The older form is git checkout -b &lt;name&gt;.</td></tr>
              <tr><td className="term">git add &lt;file&gt;</td><td>Put a change into the index.</td></tr>
              <tr><td className="term">git commit -m "text"</td><td>Record the index as a commit with a message.</td></tr>
              <tr><td className="term">git push origin &lt;branch&gt;</td><td>Send local commits to the remote repository.</td></tr>
              <tr><td className="term">git fetch origin</td><td>Get the new commits from the remote. Your files do not change.</td></tr>
              <tr><td className="term">git pull origin main</td><td>Do git fetch, then merge the commits into your branch.</td></tr>
              <tr><td className="term">git log --oneline</td><td>Show the history of commits. One line for each commit.</td></tr>
              <tr><td className="term">git revert &lt;sha&gt;</td><td>Make a new commit that undoes an earlier commit. The history stays complete.</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      <div className="end">END OF DOCUMENT — TD-047 REV A</div>
      <div className="endsub">UNCONTROLLED WHEN PRINTED — VERIFY THE REVISION BEFORE USE</div>

      </div>
    </div>
  );
}
