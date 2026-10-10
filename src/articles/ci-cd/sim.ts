/**
 * Behaviour of the CI/CD dossier, ported from its original inline script:
 * scroll progress, zone viewfinder, spine scroll-spy, and the three
 * interactive figures (Fig. 01 four areas, Fig. 03 pipeline runner,
 * Fig. 05 complete procedure, with its fault and merge-conflict paths).
 *
 * It drives the markup that index.tsx renders, scoped to `root`, and returns a
 * cleanup that stops every timer, listener and running animation. index.tsx
 * renders static JSX, so React never re-renders the nodes changed here.
 */
export function mountCicd(root: HTMLElement): () => void {
  const $ = <T extends Element = HTMLElement>(id: string) => root.querySelector<T>(`#${id}`)!;
  const ac = new AbortController();
  const on = (el: EventTarget, type: string, fn: EventListener) => el.addEventListener(type, fn, { signal: ac.signal });
  const timers: number[] = [];
  let dead = false;
  const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

  /* ============ SCROLL PROGRESS ============ */
  const bar = $("bar");
  const onScroll = () => {
    const d = document.documentElement;
    const p = d.scrollTop / Math.max(1, d.scrollHeight - d.clientHeight);
    bar.style.width = (p * 100).toFixed(2) + "%";
  };
  on(window, "scroll", onScroll);
  onScroll();

  /* ============ ZONE VIEWFINDER ============ */
  // reads the ruler zone under the pointer: columns 1–8 across, rows A–F down the frame.
  // (The original always computed the window centre, so it never changed.)
  const zoneEl = $("zone");
  const showZone = (x: number, y: number) => {
    const top = root.querySelector<HTMLElement>(".strip-v")?.getBoundingClientRect();
    const y0 = top?.top ?? 0;
    const h = top?.height || innerHeight;
    const col = Math.min(8, Math.max(1, Math.floor((x / innerWidth) * 8) + 1));
    const row = "ABCDEF"[Math.min(5, Math.max(0, Math.floor(((y - y0) / h) * 6)))];
    zoneEl.textContent = `ZONE ${row}-${col}`;
  };
  on(window, "pointermove", (e) => showZone((e as PointerEvent).clientX, (e as PointerEvent).clientY));
  showZone(innerWidth / 2, innerHeight / 2);

  /* ============ SPINE — active section ============ */
  const links: Record<string, HTMLAnchorElement> = {};
  root.querySelectorAll<HTMLAnchorElement>("#spNav a").forEach((a) => (links[a.hash.slice(1)] = a));
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        Object.values(links).forEach((a) => a.classList.remove("on"));
        links[e.target.id]?.classList.add("on");
      }),
    { rootMargin: "-45% 0px -50% 0px" },
  );
  root.querySelectorAll("section[id]").forEach((s) => io.observe(s));

  /* ============ TWEEN + CONSOLE HELPERS ============ */
  const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const tween = (dur: number, fn: (t: number) => void) =>
    new Promise<void>((res) => {
      const t0 = performance.now();
      const step = (n: number) => {
        if (dead) return res();
        const t = Math.min(1, (n - t0) / dur);
        fn(t);
        if (t < 1) requestAnimationFrame(step);
        else res();
      };
      requestAnimationFrame(step);
    });
  /* every string passed here is a literal from this file, never user input */
  const mkLog = (cons: HTMLElement) => (html: string, cls?: string) => {
    const d = document.createElement("div");
    d.className = "ln" + (cls ? " " + cls : "");
    d.innerHTML = html;
    cons.appendChild(d);
    cons.scrollTop = cons.scrollHeight;
  };
  const cmd = (s: string) => `<span class="pr">$</span> <span class="cmd">${s}</span>`;

  /* ============ FIG. 01 — FOUR AREAS WALKTHROUGH ============ */
  {
    const tok = $<SVGGElement>("tok1");
    let tx = 110;
    let ty = 85;
    const set = () => tok.setAttribute("transform", `translate(${tx},${ty})`);
    set();
    const boxes = { A: $("bxA"), B: $("bxB"), C: $("bxC") };
    const flash = (b: Element) => {
      b.classList.add("hit");
      timers.push(window.setTimeout(() => b.classList.remove("hit"), 700));
    };
    const to = async (x: number, y: number, dur = 650) => {
      const fx = tx;
      const fy = ty;
      await tween(dur, (t) => {
        const e = ease(t);
        tx = fx + (x - fx) * e;
        ty = fy + (y - fy) * e;
        set();
      });
    };
    const pullPath = $<SVGPathElement>("pull1");
    const plen = pullPath.getTotalLength();
    const st = $("state1");
    const sha = $("shaL");
    const bAdd = $<HTMLButtonElement>("f1add");
    const bCom = $<HTMLButtonElement>("f1com");
    const bPush = $<HTMLButtonElement>("f1push");
    const bPull = $<HTMLButtonElement>("f1pull");
    const bRes = $<HTMLButtonElement>("f1res");
    const grp = [bAdd, bCom, bPush, bPull];
    const en = (arr: HTMLButtonElement[]) => {
      grp.forEach((b) => (b.disabled = true));
      arr.forEach((b) => (b.disabled = false));
    };
    const reset = () => {
      tx = 110;
      ty = 85;
      set();
      sha.classList.remove("on");
      st.innerHTML = "STATE — <b>CHANGE IN WORKING DIRECTORY</b>";
      en([bAdd]);
    };
    reset();
    on(bAdd, "click", async () => {
      en([]);
      await to(347, 85);
      if (dead) return;
      flash(boxes.B);
      st.innerHTML = "STATE — <b>CHANGE IN INDEX</b> (STAGING AREA)";
      en([bCom]);
    });
    on(bCom, "click", async () => {
      en([]);
      await to(584, 85);
      if (dead) return;
      flash(boxes.C);
      sha.classList.add("on");
      st.innerHTML = "STATE — <b>COMMIT 7be04d2</b> IN LOCAL REPO";
      en([bPush]);
    });
    on(bPush, "click", async () => {
      en([]);
      await to(821, 85);
      if (dead) return;
      flash($("bxD"));
      st.innerHTML = "STATE — <b>COMMIT ON ORIGIN</b> — GITHUB HAS THE CHANGE";
      en([bPull]);
    });
    on(bPull, "click", async () => {
      en([]);
      await tween(1200, (t) => {
        const p = pullPath.getPointAtLength(plen * ease(t));
        tx = p.x;
        ty = p.y;
        set();
      });
      if (dead) return;
      tx = 110;
      ty = 121;
      set();
      flash(boxes.C);
      st.innerHTML = "STATE — <b>COMMITS FROM REMOTE</b> MERGED INTO LOCAL";
      await to(110, 85, 350);
      if (dead) return;
      en([bPull]);
    });
    on(bRes, "click", reset);
  }

  /* ============ FIG. 03 — CI PIPELINE RUNNER ============ */
  let tok3 = 0;
  let iv3: number | undefined;
  {
    const stages = [...root.querySelectorAll<HTMLElement>(".pipe .stage")];
    const stats = [...root.querySelectorAll<HTMLElement>(".pipe .stage .st")];
    const cons = $("cons3");
    const log = mkLog(cons);
    const runB = $<HTMLButtonElement>("run3");
    const resetB = $<HTMLButtonElement>("reset3");
    const fault = $<HTMLInputElement>("fault3");
    const el = $("el3");
    const info = $("runinfo");
    const stamp = $("stamp3");
    let busy = false;
    let runId = 0;
    const initLines = () => {
      log("TD-047 · CI RUNNER READY — 6 STAGES LOADED.", "res");
      log("PRESS [RUN PIPELINE] TO START. TIP: SET FAULT INJECTION TO TEST THE FAILURE PATH.", "res");
    };
    const resetStages = () => {
      stages.forEach((s) => s.classList.remove("run", "pass", "fail", "pulse"));
      stats.forEach((s) => (s.textContent = "IDLE"));
    };
    cons.innerHTML = "";
    initLines();

    on(resetB, "click", () => {
      tok3++;
      busy = false;
      window.clearInterval(iv3);
      resetStages();
      stamp.classList.remove("on");
      el.textContent = "0.0";
      info.textContent = "PIPELINE IDLE — LAST TRIGGER: PUSH TO main";
      runB.textContent = "RUN PIPELINE";
      cons.innerHTML = "";
      initLines();
    });

    on(runB, "click", async () => {
      if (busy) return;
      busy = true;
      const t = tok3;
      runId++;
      resetStages();
      stamp.classList.remove("on");
      cons.innerHTML = "";
      info.textContent = `PIPELINE #${1041 + runId} — TRIGGER: PUSH TO main`;
      const t0 = performance.now();
      window.clearInterval(iv3);
      iv3 = window.setInterval(() => {
        if (t !== tok3) {
          window.clearInterval(iv3);
          return;
        }
        el.textContent = ((performance.now() - t0) / 1000).toFixed(1);
      }, 90);
      log(`PIPELINE #${1041 + runId} TRIGGERED — PUSH TO main — COMMIT a3f92c1`, "res");
      const S = [
        { c: "S1", n: "SOURCE", go: "FETCH REPOSITORY", ok: "FETCH OK — 2,431 OBJECTS" },
        { c: "S2", n: "BUILD", go: "COMPILE 148 FILES", ok: "BUILD OK — 0 ERRORS, 0 WARNINGS" },
        { c: "S3", n: "TEST", go: "RUN 41 TESTS", ok: "TESTS 41/41 OK" },
        { c: "S4", n: "PACKAGE", go: "MAKE ARTIFACT app-2.4.1.tar", ok: "ARTIFACT MADE — 18.2 MB" },
        { c: "S5", n: "STAGING", go: "DEPLOY BUILD TO STAGING", ok: "STAGING LIVE — SMOKE TESTS PASS" },
        { c: "S6", n: "PRODUCTION", go: "DEPLOY BUILD TO PRODUCTION", ok: "RELEASE v2.4.1 LIVE" },
      ];
      const D = [500, 1200, 1500, 850, 800, 800];
      let total = 0;
      let okAll = true;
      for (let i = 0; i < 6; i++) {
        const stg = stages[i];
        stg.classList.add("run");
        stats[i].textContent = "RUNNING";
        log(`${S[i].c} ${S[i].n} — ${S[i].go}…`, "res");
        await sleep(D[i]);
        if (t !== tok3) return;
        total += D[i];
        stg.classList.remove("run");
        const pass = !(i === 2 && fault.checked);
        if (pass) {
          stg.classList.add("pass");
          stats[i].textContent = `PASS · ${(D[i] / 1000).toFixed(1)}S`;
          log(`${S[i].c} ${S[i].n} — ${S[i].ok} (${(D[i] / 1000).toFixed(1)}S)`, "ok");
          const nx = stages[i + 1];
          if (nx) {
            nx.classList.add("pulse");
            timers.push(window.setTimeout(() => nx.classList.remove("pulse"), 550));
          }
        } else {
          stg.classList.add("fail");
          stats[i].textContent = "FAIL · 2 TESTS";
          log("S3 TEST — 39/41 OK · 2 FAILED", "bad");
          log("<b>PIPELINE ABORTED — main STAYS ON THE LAST GOOD VERSION</b>", "bad");
          okAll = false;
          break;
        }
      }
      window.clearInterval(iv3);
      if (t !== tok3) return;
      el.textContent = (total / 1000).toFixed(1);
      if (okAll) {
        log(`<b>PIPELINE SUCCESS — TOTAL ${(total / 1000).toFixed(1)}S — ARTIFACT PROMOTED</b>`, "ok");
        stamp.classList.add("on");
        runB.textContent = "RUN PIPELINE AGAIN";
      }
      busy = false;
    });
  }

  /* ============ FIG. 05 — COMPLETE PROCEDURE SIMULATION ============ */
  let tok5 = 0;
  {
    const cons = $("cons5");
    const log = mkLog(cons);
    const brPath = $<SVGPathElement>("brPath");
    const mgPath = $<SVGPathElement>("mgPath");
    const depLine = $<SVGPathElement>("depLine");
    const brLblG = $("brLblG");
    const prG = $("prG");
    const mgG = $("mgG");
    const depG = $("depG");
    const rip = $("rip5");
    const stamp = $("stamp5");
    const cb1 = $("cb1");
    const cb2 = $("cb2");
    const cbf = $("cbf");
    const cbr = $("cbr");
    const tmG = $("tmG");
    const cfG = $("cfG");
    const syncPath = $<SVGPathElement>("syncPath");
    const lamps: Record<string, Element> = { BUILD: $("lB"), TEST: $("lT"), LINT: $("lL") };
    const fault = $<HTMLInputElement>("fault5");
    const conflict = $<HTMLInputElement>("conflict5");
    /** true once the branch contains the teammate's change, so the merge can go through */
    let resolved = false;
    const b51 = $<HTMLButtonElement>("b51");
    const b52 = $<HTMLButtonElement>("b52");
    const b53 = $<HTMLButtonElement>("b53");
    const b54 = $<HTMLButtonElement>("b54");
    const b55 = $<HTMLButtonElement>("b55");
    const bfix = $<HTMLButtonElement>("b5fix");
    const bcf = $<HTMLButtonElement>("b5cf");
    const b56 = $<HTMLButtonElement>("b56");
    const b57 = $<HTMLButtonElement>("b57");
    const br = $<HTMLButtonElement>("b5r");
    const btns = [b51, b52, b53, b54, b55, bfix, bcf, b56, b57];
    const pL = new Map<SVGPathElement, number>();
    [brPath, mgPath, depLine, syncPath].forEach((p) => pL.set(p, p.getTotalLength()));
    const drawPath = (p: SVGPathElement) => {
      const L = pL.get(p)!;
      p.style.transition = "none";
      p.style.strokeDashoffset = String(L);
      p.getBoundingClientRect();
      p.style.transition = "stroke-dashoffset .85s ease";
      p.style.strokeDashoffset = "0";
    };
    const resetPaths = () =>
      pL.forEach((L, p) => {
        p.style.transition = "none";
        p.style.strokeDasharray = String(L);
        p.style.strokeDashoffset = String(L);
      });
    const disAll = () => btns.forEach((b) => (b.disabled = true));
    const en = (b: HTMLButtonElement) => {
      disAll();
      b.disabled = false;
    };
    const initLines = () => {
      log("TD-047 SIMULATION READY — REPOSITORY cd-demo CLONED.", "res");
      log("PRESS [01] CREATE BRANCH TO START THE PROCEDURE.", "res");
    };
    const reset = () => {
      tok5++;
      resetPaths();
      [brLblG, prG, mgG, depG, tmG, cfG].forEach((g) => g.classList.remove("on"));
      [cb1, cb2, cbf, cbr].forEach((d) => d.classList.remove("on"));
      resolved = false;
      bcf.classList.add("hide");
      Object.values(lamps).forEach((l) => l.classList.remove("run", "on", "bad"));
      stamp.classList.remove("on");
      bfix.classList.add("hide");
      cons.innerHTML = "";
      initLines();
      en(b51);
    };
    reset();

    /** CI on the pull request; TEST fails when fault injection is on, except on the re-run after a fix */
    async function ci(t: number, force: boolean): Promise<boolean | null> {
      const seq: [string, number][] = [
        ["BUILD", 600],
        ["TEST", 750],
        ["LINT", 500],
      ];
      for (const [name, ms] of seq) {
        const l = lamps[name];
        l.classList.remove("on", "bad"); // a re-run starts each lamp clean
        l.classList.add("run");
        log(`CI ${name} — RUN…`, "res");
        await sleep(ms);
        if (t !== tok5) return null;
        l.classList.remove("run");
        if (name === "TEST" && !force && fault.checked) {
          l.classList.add("bad");
          log("TEST FAIL — 2 OF 28 TESTS FAILED", "bad");
          return false;
        }
        l.classList.add("on");
        log(`${name} PASS (${(ms / 1000).toFixed(1)}S)`, "ok");
      }
      log("CI RESULT — BUILD PASS · TEST PASS · ANALYSIS PASS", "ok");
      return true;
    }

    on(b51, "click", async () => {
      const t = tok5;
      disAll();
      drawPath(brPath);
      brLblG.classList.add("on");
      log(cmd("git checkout -b fix/login-error"));
      await sleep(350);
      if (t !== tok5) return;
      log("BRANCH fix/login-error CREATED — START COMMIT 9c3d71f", "res");
      await sleep(550);
      if (t !== tok5) return;
      en(b52);
    });
    on(b52, "click", async () => {
      const t = tok5;
      disAll();
      cb1.classList.add("on");
      log(cmd('git commit -m "FIX LOGIN ERROR VALIDATION"'));
      await sleep(300);
      if (t !== tok5) return;
      log("COMMIT 7be04d2 RECORDED — 2 FILES CHANGED", "res");
      await sleep(400);
      if (t !== tok5) return;
      en(b53);
    });
    on(b53, "click", async () => {
      const t = tok5;
      disAll();
      cb2.classList.add("on");
      log(cmd('git commit -m "ADD TEST FOR LOGIN ERROR"'));
      await sleep(300);
      if (t !== tok5) return;
      log("COMMIT 2c9f1b3 RECORDED — 1 FILE CHANGED", "res");
      await sleep(400);
      if (t !== tok5) return;
      en(b54);
    });
    on(b54, "click", async () => {
      const t = tok5;
      disAll();
      prG.classList.add("on");
      log(cmd("git push -u origin fix/login-error"));
      await sleep(400);
      if (t !== tok5) return;
      log("PUSH OK — ORIGIN/fix/login-error UP TO DATE", "res");
      await sleep(450);
      if (t !== tok5) return;
      log("PULL REQUEST #47 OPENED — fix/login-error → main", "ok");
      await sleep(500);
      if (t !== tok5) return;
      en(b55);
    });
    on(b55, "click", async () => {
      const t = tok5;
      disAll();
      const ok = await ci(t, false);
      if (t !== tok5 || ok === null) return;
      if (ok) en(b56);
      else {
        bfix.classList.remove("hide");
        en(bfix); // the original left it disabled, so the fix path could not continue
      }
    });
    on(bfix, "click", async () => {
      const t = tok5;
      disAll();
      bfix.classList.add("hide");
      cbf.classList.add("on");
      log(cmd('git commit -m "FIX TEST DATA" &amp;&amp; git push'));
      await sleep(350);
      if (t !== tok5) return;
      log("COMMIT c41d9e7 RECORDED — PUSH OK", "res");
      await sleep(450);
      if (t !== tok5) return;
      const ok = await ci(t, true);
      if (t !== tok5 || ok === null) return;
      if (ok) en(b56);
    });
    on(b56, "click", async () => {
      const t = tok5;
      disAll();
      if (conflict.checked && !resolved) {
        // 3.3: main moved while the pull request was open, and both sides changed src/login.ts
        tmG.classList.add("on");
        log("PULL REQUEST #46 MERGED BY A TEAMMATE — main NOW HAS COMMIT d81e0a4", "res");
        await sleep(600);
        if (t !== tok5) return;
        cfG.classList.add("on");
        // the checks passed on the old commit; they must run again on the resolved one
        Object.values(lamps).forEach((l) => l.classList.remove("on", "bad"));
        log("PULL REQUEST #47 — THIS BRANCH HAS CONFLICTS THAT MUST BE RESOLVED", "bad");
        log("<b>MERGE BLOCKED — BOTH BRANCHES CHANGE src/login.ts, LINE 3</b>", "bad");
        await sleep(300);
        if (t !== tok5) return;
        bcf.classList.remove("hide");
        en(bcf);
        return;
      }
      drawPath(mgPath);
      log(cmd("git checkout main &amp;&amp; git merge --no-ff fix/login-error"));
      await sleep(800);
      if (t !== tok5) return;
      mgG.classList.add("on");
      log("PULL REQUEST #47 MERGED — MERGE COMMIT a3f92c1 ON main", "ok");
      await sleep(600);
      if (t !== tok5) return;
      en(b57);
    });
    on(bcf, "click", async () => {
      const t = tok5;
      disAll();
      bcf.classList.add("hide");
      log(cmd("git fetch origin &amp;&amp; git merge origin/main"));
      await sleep(450);
      if (t !== tok5) return;
      log("CONFLICT (content): Merge conflict in src/login.ts", "bad");
      await sleep(300);
      if (t !== tok5) return;
      for (const line of [
        "&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD",
        "  const MAX_ATTEMPTS = 3;",
        "=======",
        "  const MAX_ATTEMPTS = 5;",
        "&gt;&gt;&gt;&gt;&gt;&gt;&gt; origin/main",
      ]) {
        log(line, "mk");
      }
      await sleep(900);
      if (t !== tok5) return;
      log("EDIT src/login.ts — KEEP MAX_ATTEMPTS = 5 · DELETE THE THREE MARKER LINES", "res");
      await sleep(600);
      if (t !== tok5) return;
      log(cmd('git add src/login.ts &amp;&amp; git commit -m "MERGE main INTO fix/login-error"'));
      drawPath(syncPath);
      cbr.classList.add("on");
      await sleep(500);
      if (t !== tok5) return;
      log("MERGE COMMIT e7a2c90 RECORDED ON fix/login-error", "res");
      log(cmd("git push"));
      await sleep(450);
      if (t !== tok5) return;
      cfG.classList.remove("on");
      resolved = true;
      log("PUSH OK — CONFLICT RESOLVED · THE CHECKS RUN AGAIN ON THE NEW COMMIT", "ok");
      // the re-run tests the resolution, not the original fault
      const ok = await ci(t, true);
      if (t !== tok5 || ok === null) return;
      if (ok) en(b56);
    });
    on(b57, "click", async () => {
      const t = tok5;
      disAll();
      depG.classList.add("on");
      drawPath(depLine);
      rip.classList.remove("on");
      rip.getBoundingClientRect();
      rip.classList.add("on");
      log(cmd("deploy --env production app-2.4.1.tar"));
      await sleep(700);
      if (t !== tok5) return;
      log("RELEASE v2.4.1 LIVE — ROLLBACK POINT: v2.4.0", "ok");
      log("PROCEDURE COMPLETE — 7 OF 7 STEPS DONE", "res");
      stamp.classList.add("on");
    });
    on(br, "click", reset);
  }

  return () => {
    dead = true;
    tok3++; // in-flight simulations see a stale token and stop
    tok5++;
    ac.abort();
    io.disconnect();
    window.clearInterval(iv3);
    timers.forEach((id) => {
      window.clearInterval(id);
      window.clearTimeout(id);
    });
  };
}
