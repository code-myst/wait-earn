(() => {
  const api = typeof browser !== "undefined" ? browser : chrome;
  const hostName = location.hostname.replace(/^www\./, "");
  const site = SITES[hostName];
  if (!site) return;
  console.info("[AI Wait Card] active on", hostName);
  const kind = KINDS[site.kind];
  const isAd = site.kind === "ad";
  const query = site.selectors.join(",");

  const DEFAULTS = {
    enabled: true,
    message: "একটু অপেক্ষা করো, উত্তর আসছে",
    adMessage: "Ad শেষ হলেই video চলবে",
    notes: true,
    learning: true,
    stats: true,
    breaks: true,
    breakMinutes: 20
  };
  let settings = { ...DEFAULTS };

  let host = null, shadow = null, card = null;
  const els = {};
  let waiting = false, waitStart = 0, timerId = null;
  let showTimer = null, hideTimer = null, hideLoopTimer = null, scheduled = false;
  let breakShown = false, lastPick = "";

  const isGenerating = () => !!document.querySelector(query);
  const today = () => new Date().toLocaleDateString("en-CA");
  const rand = (n) => Math.floor(Math.random() * n);
  const make = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  const fmt = (sec) => (sec < 60 ? `${sec} সেকেন্ড` : `${Math.round(sec / 60)} মিনিট`);

  const CSS = `
    :host { all: initial; }
    [hidden] { display: none !important; }
    .wrap { position: fixed; left: 50%; transform: translateX(-50%); z-index: 2147483647; pointer-events: none; }
    .wrap.bottom { bottom: 120px; }
    .wrap.top { top: 72px; }
    .card {
      width: 300px; max-width: 90vw; box-sizing: border-box;
      padding: 12px 14px; border-radius: 14px;
      font: 14px/1.45 system-ui, -apple-system, "Segoe UI", sans-serif;
      color: #1f1f1f; background: #ffffff;
      border: 1px solid rgba(0,0,0,.12);
      box-shadow: 0 6px 24px rgba(0,0,0,.12);
      opacity: 0; transform: translateY(8px);
      transition: opacity .2s ease, transform .2s ease;
      pointer-events: none;
    }
    .card.in { opacity: 1; transform: translateY(0); }
    .notebtn, input, .opt { pointer-events: auto; }
    .head { display: flex; align-items: center; gap: 10px; }
    .title { font-weight: 600; flex: 1; }
    .timer { font-size: 12px; opacity: .65; font-variant-numeric: tabular-nums; }
    .msg { opacity: .75; font-size: 13px; margin-top: 4px; }
    .body { margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(128,128,128,.25); }
    .body:empty { display: none; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; opacity: .55; margin-bottom: 3px; }
    .text { font-size: 13px; }
    .word { font-weight: 600; }
    .opt {
      display: block; width: 100%; text-align: left; margin-top: 5px; padding: 6px 9px;
      border: 1px solid rgba(128,128,128,.4); border-radius: 8px;
      background: transparent; color: inherit; font: inherit; font-size: 13px; cursor: pointer;
    }
    .opt:hover:not(:disabled) { background: rgba(128,128,128,.12); }
    .opt.ok { border-color: #16a34a; background: rgba(22,163,74,.16); }
    .opt.bad { border-color: #dc2626; background: rgba(220,38,38,.16); }
    .stats { margin-top: 8px; font-size: 12px; opacity: .6; }
    .notes { margin-top: 8px; }
    .notebtn {
      border: 1px solid rgba(128,128,128,.4); border-radius: 8px; padding: 4px 10px;
      background: transparent; color: inherit; font: inherit; font-size: 12px; cursor: pointer;
    }
    .notebtn:hover { background: rgba(128,128,128,.12); }
    input {
      width: 100%; box-sizing: border-box; padding: 6px 9px; font: inherit; font-size: 13px;
      color: inherit; background: transparent;
      border: 1px solid rgba(128,128,128,.5); border-radius: 8px; outline: none;
    }
    input:focus { border-color: #6366f1; }
    .saved { font-size: 12px; color: #16a34a; min-height: 16px; margin-top: 3px; }
    .dots { display: flex; gap: 4px; }
    .dots i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: .3; animation: b 1.2s infinite ease-in-out; }
    .dots i:nth-child(2) { animation-delay: .15s; }
    .dots i:nth-child(3) { animation-delay: .3s; }
    @keyframes b { 0%,80%,100% { opacity: .3 } 40% { opacity: 1 } }
    @media (prefers-color-scheme: dark) {
      .card { color: #f0f0f0; background: #2a2a2a; border-color: rgba(255,255,255,.14); }
    }
  `;

  function applyStyles(root) {
    // Constructable stylesheet first: not blocked by a site's CSP.
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(CSS);
      root.adoptedStyleSheets = [sheet];
      return;
    } catch (e) { /* fall back below */ }
    const st = document.createElement("style");
    st.textContent = CSS;
    root.appendChild(st);
  }

  function build() {
    host = document.createElement("div");
    host.id = "ai-wait-card-host";
    shadow = host.attachShadow({ mode: "open" });
    applyStyles(shadow);

    // Built with createElement (no innerHTML) so Trusted Types / strict CSP sites can't block it.
    const wrap = make("div", "wrap " + kind.position);
    card = make("div", "card");
    const head = make("div", "head");
    const dots = make("div", "dots");
    dots.append(make("i"), make("i"), make("i"));
    els.title = make("div", "title", kind.title);
    els.timer = make("div", "timer");
    head.append(dots, els.title, els.timer);

    els.msg = make("div", "msg");
    els.body = make("div", "body");
    els.stats = make("div", "stats");

    els.notes = make("div", "notes");
    els.notebtn = make("button", "notebtn", "✎ Note");
    els.notebtn.type = "button";
    els.notebox = make("div", "notebox");
    els.notebox.hidden = true;
    els.input = document.createElement("input");
    els.input.type = "text";
    els.input.maxLength = 200;
    els.input.placeholder = "note লেখো, Enter চাপো";
    els.saved = make("div", "saved");
    els.notebox.append(els.input, els.saved);
    els.notes.append(els.notebtn, els.notebox);

    card.append(head, els.msg, els.body, els.stats, els.notes);
    wrap.append(card);
    shadow.append(wrap);

    els.notebtn.addEventListener("click", () => {
      els.notebox.hidden = false;
      els.notebtn.hidden = true;
      els.input.focus();
    });
    // keep the page's keyboard shortcuts from firing while typing a note
    for (const ev of ["keydown", "keyup", "keypress"]) {
      els.notebox.addEventListener(ev, (e) => e.stopPropagation());
    }
    els.input.addEventListener("keydown", (e) => {
      if (e.isComposing) return;
      if (e.key === "Enter") saveNote();
      else if (e.key === "Escape") { els.input.value = ""; closeNote(); els.input.blur(); }
    });
    els.input.addEventListener("blur", () => {
      if (!els.input.value.trim()) closeNote();
    });
  }

  function closeNote() {
    els.notebox.hidden = true;
    els.notebtn.hidden = false;
  }

  function saveNote() {
    const text = els.input.value.trim();
    if (!text) return;
    els.input.value = "";
    api.storage.local.get({ notes: [] }).then((r) => {
      const notes = r.notes;
      notes.push({ id: Date.now(), text, done: false });
      return api.storage.local.set({ notes });
    }).then(() => {
      els.saved.textContent = "✓ saved";
      setTimeout(() => { if (els.saved) els.saved.textContent = ""; }, 1500);
    }).catch(() => {});
  }

  function applySettingsToCard() {
    const m = settings[kind.messageKey] || "";
    els.msg.textContent = m;
    els.msg.hidden = !m;
    els.stats.hidden = !settings.stats;
    els.notes.hidden = !settings.notes;
  }

  function pickLearning() {
    const pools = isAd ? [["tip", 55], ["word", 45]] : [["tip", 40], ["word", 30], ["quiz", 30]];
    const r = rand(100);
    let acc = 0, type = pools[0][0];
    for (const [t, w] of pools) { acc += w; if (r < acc) { type = t; break; } }
    const list = { tip: TIPS, word: WORDS, quiz: QUIZZES }[type];
    let i = rand(list.length);
    if (`${type}${i}` === lastPick) i = (i + 1) % list.length;
    lastPick = `${type}${i}`;
    return { type, item: list[i] };
  }

  function renderBody(breakAcc) {
    els.body.textContent = "";
    breakShown = false;

    if (settings.breaks && breakAcc >= settings.breakMinutes * 60) {
      breakShown = true;
      els.body.append(make("div", "label", "Break time"), make("div", "text", BREAKS[rand(BREAKS.length)]));
      return;
    }
    if (!settings.learning) return;

    const { type, item } = pickLearning();
    if (type === "tip") {
      els.body.append(make("div", "label", "Web dev tip"), make("div", "text", item));
    } else if (type === "word") {
      const t = make("div", "text");
      t.append(make("span", "word", item.word), document.createTextNode(" - " + item.bn));
      els.body.append(make("div", "label", "Word"), t);
    } else {
      els.body.append(make("div", "label", "Quick quiz"), make("div", "text", item.q));
      const buttons = item.o.map((txt, idx) => {
        const b = make("button", "opt", txt);
        b.type = "button";
        b.addEventListener("click", () => {
          buttons.forEach((x, j) => {
            x.disabled = true;
            if (j === item.a) x.classList.add("ok");
          });
          if (idx !== item.a) b.classList.add("bad");
        });
        return b;
      });
      els.body.append(...buttons);
    }
  }

  function renderStats(stats) {
    const s = stats && stats.date === today() ? stats : { count: 0, seconds: 0 };
    els.stats.textContent = `আজ: ${s.count} বার · ${fmt(s.seconds)} অপেক্ষা`;
  }

  function tick() {
    els.timer.textContent = fmt(Math.floor((Date.now() - waitStart) / 1000));
  }

  function startWait() {
    if (!settings.enabled) return;
    waiting = true;
    waitStart = Date.now();
    console.info("[AI Wait Card] waiting detected, matched:", site.selectors.find((q) => document.querySelector(q)));
    if (!host) build();
    applySettingsToCard();
    if (!host.isConnected) document.documentElement.appendChild(host);
    tick();
    clearInterval(timerId);
    timerId = setInterval(tick, 1000);
    els.body.textContent = "";
    els.stats.textContent = "";
    api.storage.local.get({ stats: null, breakAcc: 0 }).then((r) => {
      if (!waiting) return;
      renderStats(r.stats);
      renderBody(r.breakAcc);
    }).catch(() => {});
    requestAnimationFrame(() => card.classList.add("in"));
  }

  function noteBusy() {
    return !!els.input && (shadow.activeElement === els.input || els.input.value.trim() !== "");
  }

  function tryHide() {
    clearTimeout(hideLoopTimer);
    if (waiting || !host) return;
    if (noteBusy()) {
      // don't make the card vanish while the user is typing a note
      hideLoopTimer = setTimeout(tryHide, 1000);
      return;
    }
    card.classList.remove("in");
    setTimeout(() => {
      if (!waiting && host && !card.classList.contains("in")) host.remove();
    }, 250);
  }

  function endWait() {
    if (!waiting) return;
    waiting = false;
    clearInterval(timerId);
    const elapsed = Math.round((Date.now() - waitStart) / 1000);
    const resetBreak = breakShown;
    breakShown = false;
    if (elapsed >= 2) {
      api.storage.local.get({ stats: null, breakAcc: 0 }).then((r) => {
        const st = r.stats && r.stats.date === today() ? r.stats : { date: today(), count: 0, seconds: 0 };
        st.count += 1;
        st.seconds += elapsed;
        const breakAcc = resetBreak ? 0 : r.breakAcc + elapsed;
        return api.storage.local.set({ stats: st, breakAcc });
      }).catch(() => {});
    }
    tryHide();
  }

  function check() {
    scheduled = false;
    if (isGenerating()) {
      clearTimeout(hideTimer);
      hideTimer = null;
      if (!waiting && !showTimer) {
        // small delay so quick flickers don't show the card
        showTimer = setTimeout(() => {
          showTimer = null;
          if (isGenerating() && !waiting) {
            try { startWait(); } catch (e) { waiting = false; console.warn("[AI Wait Card] error:", e); }
          }
        }, 300);
      }
    } else {
      clearTimeout(showTimer);
      showTimer = null;
      if (waiting && !hideTimer) {
        // small delay so the card doesn't blink between UI re-renders
        hideTimer = setTimeout(() => {
          hideTimer = null;
          if (!isGenerating()) endWait();
        }, 500);
      }
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      try { check(); } catch (e) { scheduled = false; console.warn("[AI Wait Card] error:", e); }
    });
  }

  api.storage.sync.get(DEFAULTS).then((s) => {
    settings = { ...DEFAULTS, ...s };
  }).catch(() => {});

  api.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    for (const k in changes) settings[k] = changes[k].newValue;
    if (!host || !host.isConnected) return;
    if (!settings.enabled) {
      waiting = false;
      clearInterval(timerId);
      card.classList.remove("in");
      host.remove();
      return;
    }
    applySettingsToCard();
  });

  for (const ev of ["keydown", "keyup", "keypress"]) {
    window.addEventListener(ev, (e) => {
      if (host && e.composedPath().includes(host)) e.stopPropagation();
    }, true);
  }

  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-label", "data-testid", "class"]
  });

  schedule();
})();
