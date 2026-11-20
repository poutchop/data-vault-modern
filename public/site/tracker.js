/* Carbon Clarity Learning: Ghana carbon market research tracker.
   Loaded on demand by learning.html. Uses the page's helpers: render, esc, ls, lj, sj, toast, $.
   Everything you change is saved in this browser (localStorage key cc_trk_v1). Use Backup to move it between devices. */
(function () {
  var BASE = window.CC_TRK_BASE || "https://raw.githubusercontent.com/poutchop/data-vault-modern/main/public/site/";
  var XLSX = BASE + "files/Ghana_Carbon_Market_Research_Tracker.xlsx";
  var KEY = "cc_trk_v1";
  var D = null, LIT = null, S = null;
  var STATUS = ["Not started", "In progress", "Completed", "Blocked"];
  var VER = ["Yes", "Partially", "No", "To check"];
  var GSTAT = ["Open", "In progress", "Closed"];
  var READ = ["To read", "Reading", "Read", "Not relevant"];
  var DEC = ["Consider", "Pursue", "Later", "Drop"];
  var OSTAT = ["Not started", "In progress", "Done"];
  var SSTAT = ["Not started", "Learning", "Done"];
  var PTS = { steps: 100, read: 5, core: 5, ev: 10, gaps: 20, sess: 2, lvl: 25, res: 30, refl: 15, outs: 75, ms: 50 };
  var TABS = [["tracker", "Dashboard"], ["tracker-time", "Timetable"], ["tracker-steps", "Steps"], ["tracker-evidence", "Evidence"], ["tracker-gaps", "Gaps"],
    ["tracker-lit", "Literature"], ["tracker-sites", "Sites"], ["tracker-dirs", "Directions"], ["tracker-focus", "Focus log"],
    ["tracker-reflect", "Reflection"], ["tracker-growth", "My growth"], ["tracker-backup", "Backup"]];

  /* ---------- state ---------- */
  function load() { S = lj(KEY, null) || {}; ["steps", "ev", "gaps", "lit", "sites", "dirs", "skills", "outs", "rewards", "reflect", "vids"].forEach(function (k) { S[k] = S[k] || {}; }); S.focus = S.focus || []; S.notes = S.notes || {}; S.done = S.done || {}; S.addEv = S.addEv || []; S.addGaps = S.addGaps || []; S.goal = S.goal || 10; }
  function save(msg) { S.saved = new Date().toISOString(); sj(KEY, S); if (msg) toast(msg); }
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function pd(s) { if (!s) return null; var p = String(s).slice(0, 10).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function fd(s) { var d = pd(s); return d ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""; }
  function monday(d) { d = new Date(d); var w = (d.getDay() + 6) % 7; d.setDate(d.getDate() - w); d.setHours(0, 0, 0, 0); return d; }
  function opts(list, cur) { return list.map(function (o) { return '<option' + (o === cur ? " selected" : "") + ">" + esc(o) + "</option>"; }).join(""); }
  function pill(t, warn) { return '<span class="pill' + (warn ? " warn" : "") + '">' + esc(t) + "</span>"; }

  /* ---------- derived values ---------- */
  function stepStatus(s) { return S.steps[s.n] && S.steps[s.n].status || s.status; }
  function stepFlag(s) {
    var st = stepStatus(s); if (st === "Completed") return "Done"; if (st === "Blocked") return "Blocked";
    var due = pd(s.due); if (!due) return "No date"; var dd = Math.round((due - today()) / 864e5);
    return dd < 0 ? "Overdue" : dd <= 3 ? "Due soon" : "On track";
  }
  function evAll() { return D.evidence.concat(S.addEv); }
  function evVer(e) { return S.ev[e.id] && S.ev[e.id].ver || e.ver; }
  function gapsAll() { return D.gaps.concat(S.addGaps); }
  function gapStatus(g) { return S.gaps[g.id] && S.gaps[g.id].status || g.status; }
  function litRead(i) { return S.lit[i] && S.lit[i].s || "To read"; }
  function skill(i) { var s = D.skills[i], o = S.skills[i] || {}; return { cur: +(o.cur || s.cur), start: +s.start, target: +(o.target || s.target), status: o.status || s.status }; }
  function outStatus(i) { return S.outs[i] || D.outputs[i].status; }
  function focusSorted() { return S.focus.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }); }
  function streaks() {
    var days = {}; S.focus.forEach(function (f) { days[f.date] = 1; }); var list = Object.keys(days).sort(); var best = 0, run = 0, prev = null;
    list.forEach(function (d) { var cur = pd(d); run = prev && Math.round((cur - prev) / 864e5) === 1 ? run + 1 : 1; best = Math.max(best, run); prev = cur; });
    var current = 0; if (list.length) { var last = pd(list[list.length - 1]); if (Math.round((today() - last) / 864e5) <= 1) current = run; }
    return { current: current, best: best };
  }
  function hours(from) { var m = 0; S.focus.forEach(function (f) { if (!from || pd(f.date) >= from) m += (+f.sess || 0) * 25; }); return Math.round(m / 6) / 10; }
  function stats() {
    var s = {};
    s.stepsDone = D.steps.filter(function (x) { return stepStatus(x) === "Completed"; }).length;
    s.progress = D.steps.length ? D.steps.reduce(function (a, x) { var st = stepStatus(x); return a + (st === "Completed" ? 1 : st === "In progress" ? .5 : 0); }, 0) / D.steps.length : 0;
    s.overdue = D.steps.filter(function (x) { return stepFlag(x) === "Overdue"; }).length;
    s.soon = D.steps.filter(function (x) { return stepFlag(x) === "Due soon"; }).length;
    var open = D.steps.filter(function (x) { return stepStatus(x) !== "Completed"; }).sort(function (a, b) { return a.due < b.due ? -1 : 1; });
    s.next = open[0] || null;
    s.final = D.steps.reduce(function (m, x) { return x.due > m ? x.due : m; }, "");
    var ev = evAll(); s.evN = ev.length; s.evYes = ev.filter(function (e) { return evVer(e) === "Yes"; }).length;
    s.read = 0; s.coreRead = 0; if (LIT) LIT.rows.forEach(function (r, i) { if (litRead(i) === "Read") { s.read++; if (r[0] === "C") s.coreRead++; } });
    else Object.keys(S.lit).forEach(function (i) { if (S.lit[i].s === "Read") { s.read++; if (S.lit[i].c) s.coreRead++; } });
    var gs = gapsAll(); s.gapsOpen = gs.filter(function (g) { return gapStatus(g) !== "Closed"; }).length; s.gapsClosed = gs.length - s.gapsOpen;
    s.highClosed = gs.filter(function (g) { return g.pri === "High" && gapStatus(g) === "Closed"; }).length; s.high = gs.filter(function (g) { return g.pri === "High"; }).length;
    s.sess = S.focus.reduce(function (a, f) { return a + (+f.sess || 0); }, 0);
    s.lvls = 0; s.skillsAt = 0; s.resDone = 0; D.skills.forEach(function (x, i) { var k = skill(i); s.lvls += Math.max(0, k.cur - k.start); if (k.cur >= k.target) s.skillsAt++; if (k.status === "Done") s.resDone++; });
    s.refl = Object.keys(S.reflect).filter(function (k) { return (S.reflect[k].wins || "").trim(); }).length;
    s.outsDone = D.outputs.filter(function (x, i) { return outStatus(i) === "Done"; }).length;
    s.sdone = 0; Object.keys(S.done || {}).forEach(function (k) { Object.keys(S.done[k]).forEach(function (j) { if (S.done[k][j]) s.sdone++; }); });
    s.vids = Object.keys(S.vids).filter(function (k) { return S.vids[k]; }).length;
    var st = streaks(); s.streak = st.current; s.best = st.best; s.hours = hours(); s.week = hours(monday(today()));
    s.ms = milestones(s); s.msDone = s.ms.filter(function (m) { return m.done; }).length;
    s.xpRows = [["Research steps completed", s.stepsDone, PTS.steps], ["Papers read", s.read, PTS.read], ["Core papers read (bonus)", s.coreRead, PTS.core],
      ["Evidence items fully verified", s.evYes, PTS.ev], ["Gaps closed", s.gapsClosed, PTS.gaps], ["Focus sessions (25 min)", s.sess, PTS.sess],
      ["Skill levels gained", s.lvls, PTS.lvl], ["Learning resources completed", s.resDone, PTS.res], ["Weekly reflections written", s.refl, PTS.refl],
      ["Career outputs completed", s.outsDone, PTS.outs], ["Growth videos watched", s.vids, 5], ["Sessions done (timetable)", s.sdone, 3], ["Milestones unlocked", s.msDone, PTS.ms]];
    s.xp = s.xpRows.reduce(function (a, r) { return a + r[1] * r[2]; }, 0);
    var L = D.levels, li = 0; L.forEach(function (l, i) { if (s.xp >= l[2]) li = i; });
    s.level = L[li][0]; s.title = L[li][1]; s.nextXp = L[li + 1] ? L[li + 1][2] : null;
    s.toNext = s.nextXp ? (s.xp - L[li][2]) / (s.nextXp - L[li][2]) : 1;
    return s;
  }
  function milestones(s) {
    var M = [["First research step finished", s.stepsDone, 1], ["Halfway there (5 steps)", s.stepsDone, 5], ["Research complete", s.stepsDone, 9],
      ["Reading habit started (10 papers)", s.read, 10], ["Core knowledge (25 core papers)", s.coreRead, 25], ["Well read (100 papers)", s.read, 100],
      ["Fact checker (30 verified)", s.evYes, 30], ["Gap closer (5 gaps)", s.gapsClosed, 5], ["No loose ends (all high-priority gaps)", s.highClosed, s.high],
      ["7-day focus streak", s.best, 7], ["25 hours of deep work", s.hours, 25], ["100 hours of deep work", s.hours, 100],
      ["First skill mastered", s.skillsAt, 1], ["Multi-skilled (3 skills)", s.skillsAt, 3], ["Reflective researcher (4 reflections)", s.refl, 4], ["Daily learner (20 growth videos)", s.vids, 20], ["Showing up (50 sessions done)", s.sdone, 50], ["Public voice (3 outputs)", s.outsDone, 3]];
    return M.map(function (m, i) { return { i: i, name: m[0], cur: m[1], target: m[2], done: m[2] > 0 && m[1] >= m[2] }; });
  }

  /* ---------- layout ---------- */
  var CSS = '<style id="trkcss">.ttabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 16px}.ttabs a{text-decoration:none;border:1px solid var(--line);border-radius:99px;padding:6px 12px;font-size:14px;font-weight:600;color:var(--ink);background:var(--card)}.ttabs a.on{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}' +
    '.kpis{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}.kpi{border:1px solid var(--line);border-radius:12px;padding:12px 14px;background:var(--card)}.kpi b{display:block;font-size:26px;line-height:1.15;color:var(--accent)}.kpi span{font-size:13.5px;color:var(--muted)}.kpi.alert b{color:var(--ember)}' +
    '.lvl{display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:center}.lvl .num{width:76px;height:76px;border-radius:50%;display:grid;place-items:center;background:var(--accent);color:var(--accent-ink);font-size:30px;font-weight:800}' +
    '.msg{font-size:18px;font-style:italic;font-weight:600;border-left:4px solid var(--ember);padding:6px 12px;margin:12px 0 0}' +
    '.tt{width:100%;border-collapse:collapse;font-size:14.5px}.tt th,.tt td{text-align:left;padding:8px 8px;border-bottom:1px solid var(--line);vertical-align:top}.tt th{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}' +
    '.tt select,.tt input,.tf select,.tf input,.tf textarea{font:inherit;font-size:14px;padding:5px 8px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--ink);max-width:100%}' +
    '.tf{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-top:10px}.tf label{display:grid;gap:4px;font-size:13px;color:var(--muted)}.tf .wide{grid-column:1/-1}.tf textarea{min-height:64px}' +
    '.f-Done,.f-Closed,.f-Yes,.f-Completed,.f-Read,.f-Pursue{background:var(--ok-soft);color:var(--ok)}.f-Overdue,.f-Blocked,.f-No,.f-Open{background:var(--bad-soft);color:var(--bad)}.f-Due-soon,.f-Partially,.f-In-progress,.f-Reading,.f-Learning{background:var(--ember-soft);color:var(--ember)}' +
    '.lit li{padding:10px 0;border-bottom:1px solid var(--line);list-style:none}.lit{margin:0;padding:0}.lit .m{color:var(--muted);font-size:13.5px}.lit .a{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:6px}' +
    '.prog2{height:10px;border-radius:99px;background:var(--line);overflow:hidden}.prog2 i{display:block;height:100%;background:var(--accent)}.small{font-size:13px;color:var(--muted)}' +
    '.nn{display:grid;grid-template-columns:1fr 1fr;gap:14px}.nn>div{border:1px solid var(--line);border-radius:12px;padding:12px 14px;background:var(--soft)}@media(max-width:600px){.nn{grid-template-columns:1fr}}' +
    '.vwrap{position:relative;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:#000;margin-top:10px}.vwrap iframe{position:absolute;inset:0;width:100%;height:100%;border:0}' +
    '.agenda{list-style:none;margin:12px 0 0;padding:0;display:grid;gap:6px}.agenda li{display:grid;grid-template-columns:110px 1fr;gap:10px;padding:8px 12px;border:1px solid var(--line);border-left:5px solid var(--line);border-radius:10px;background:var(--card)}.agenda .tm{font-variant-numeric:tabular-nums;font-weight:700;color:var(--muted)}.agenda li.research{border-left-color:#0F7C72}.agenda li.skill{border-left-color:#B4561D}.agenda li.video{border-left-color:#D9A441}.agenda li.learn{border-left-color:#6A3D9A}.agenda li.deep{border-left-color:#1E5AA8}.agenda li.on{outline:2px solid var(--accent);background:var(--soft)}.agenda li.past{opacity:.55}</style>';
  function tabs(cur) { return '<nav class="ttabs" aria-label="Tracker sections">' + TABS.map(function (t) { return '<a href="#' + t[0] + '" class="' + (t[0] === cur ? "on" : "") + '">' + t[1] + "</a>"; }).join("") + "</nav>"; }
  function page(cur, inner, title, sub) {
    var h = CSS + BCSS + '<div class="card"><p class="eyebrow">Ghana carbon market research</p><h1>' + esc(title) + "</h1>" + (sub ? '<p class="sub">' + sub + "</p>" : "") + "</div>" + tabs(cur) + inner;
    render(h, "tracker");
  }
  function flagPill(f) { return '<span class="pill f-' + f.replace(/ /g, "-") + '">' + esc(f) + "</span>"; }
  function bar(p) { return '<div class="prog2"><i style="width:' + Math.round(Math.max(0, Math.min(1, p)) * 100) + '%"></i></div>'; }

  /* ---------- views ---------- */
  function dashboard() {
    var s = stats(), msg = D.messages[Math.floor(today() / 864e5) % D.messages.length];
    var next = s.next ? esc(s.next.task) + " · due " + fd(s.next.due) : "All steps done";
    var h = '<div class="card"><div class="lvl"><div class="num">' + s.level + '</div><div><p class="eyebrow">Level ' + s.level + " · " + esc(s.title) + "</p><b>" + s.xp.toLocaleString() + " XP</b>" + (s.nextXp ? " · next level at " + s.nextXp.toLocaleString() : "") + bar(s.toNext) +
      '<p class="small" style="margin-top:6px">Streak ' + s.streak + " day" + (s.streak === 1 ? "" : "s") + " · " + s.week + " of " + S.goal + " focus hours this week</p></div></div><p class=\"msg\">" + esc(msg) + "</p>" +
      '<div class="row"><a class="btn pri" href="#tracker-focus">Log today\'s focus</a><a class="btn" href="#tracker-reflect">Weekly reflection</a><a class="btn" href="' + XLSX + '">Download Excel version</a></div></div>';
    h += '<div class="card"><p class="eyebrow">Your day · <a href="#tracker-time">full timetable</a></p>' + nnHtml() + "</div>" + digest(today()) + videoCard(today(), true);
    h += '<div class="card"><h2>Research progress</h2><div class="kpis" style="margin-top:12px">' +
      kpi(Math.round(s.progress * 100) + "%", "overall progress") + kpi(s.stepsDone + " of " + D.steps.length, "steps completed") +
      kpi(s.overdue, "overdue steps", s.overdue > 0) + kpi(s.soon, "due in next 3 days", s.soon > 0) +
      kpi(Math.max(0, Math.round((pd(s.final) - today()) / 864e5)), "days to final deadline (" + fd(s.final) + ")") +
      kpi(s.evN ? Math.round(s.evYes / s.evN * 100) + "%" : "0%", "evidence fully verified (" + s.evYes + "/" + s.evN + ")") +
      kpi(s.read, "papers read of " + (LIT ? LIT.rows.length.toLocaleString() : "1,499")) + kpi(s.gapsOpen, "gaps still open", s.gapsOpen > 0) +
      '</div><p style="margin-top:14px"><b>Next:</b> ' + next + "</p></div>";
    h += '<div class="card"><h2>Steps</h2><table class="tt"><tr><th>#</th><th>Task</th><th>Due</th><th>Status</th><th>Flag</th></tr>' +
      D.steps.map(function (x) { return "<tr><td>" + x.n + "</td><td>" + esc(x.task) + "</td><td>" + fd(x.due) + "</td><td>" + esc(stepStatus(x)) + "</td><td>" + flagPill(stepFlag(x)) + "</td></tr>"; }).join("") + "</table></div>";
    h += '<div class="card"><h2>Milestones</h2><p class="hint">' + s.msDone + " of " + s.ms.length + ' unlocked. Set your rewards in <a href="#tracker-growth">My growth</a>.</p><div class="badges" style="margin-top:10px">' +
      s.ms.map(function (m) { return '<div class="badge' + (m.done ? " got" : "") + '" title="' + esc(m.cur + " / " + m.target) + '">' + (m.done ? "🏆" : "🔒") + '<div class="small">' + esc(m.name) + "</div></div>"; }).join("") + "</div></div>";
    page("tracker", h, "Research tracker", "Your live tracker for the Ghana carbon market research and your growth. Everything updates as you work and is saved in this browser.");
    wireVid(document, dashboard); wireDigest(document, dashboard);
  }
  function kpi(v, l, alert) { return '<div class="kpi' + (alert ? " alert" : "") + '"><b>' + v + "</b><span>" + esc(l) + "</span></div>"; }

  function steps() {
    var h = '<div class="card tw"><table class="tt"><tr><th>#</th><th>Task and deliverable</th><th>Due</th><th>Status</th><th>Flag</th><th>Notes</th></tr>' +
      D.steps.map(function (x) {
        var n = (S.steps[x.n] && S.steps[x.n].notes) != null ? S.steps[x.n].notes : (x.notes || "");
        return "<tr><td>" + x.n + "</td><td><b>" + esc(x.task) + '</b><div class="small">' + esc(x.deliv || "") + " · " + esc(x.week || "") + '</div></td><td>' + fd(x.due) +
          '</td><td><select data-step="' + x.n + '">' + opts(STATUS, stepStatus(x)) + "</select></td><td>" + flagPill(stepFlag(x)) + '</td><td><input data-stepnote="' + x.n + '" value="' + esc(n) + '" placeholder="Add a note"></td></tr>';
      }).join("") + "</table></div>";
    page("tracker-steps", h, "Research steps", "Change a status and the dashboard, flags and XP update straight away.");
    each("[data-step]", "change", function (el) { var k = el.dataset.step; S.steps[k] = S.steps[k] || {}; S.steps[k].status = el.value; save("Step " + k + " saved"); steps(); });
    each("[data-stepnote]", "change", function (el) { var k = el.dataset.stepnote; S.steps[k] = S.steps[k] || {}; S.steps[k].notes = el.value; save("Note saved"); });
  }

  function evidence(cat) {
    cat = cat || "";
    var all = evAll(), cats = []; all.forEach(function (e) { if (cats.indexOf(e.cat) < 0) cats.push(e.cat); });
    var list = all.filter(function (e) { return !cat || e.cat === cat; });
    var h = '<div class="card"><div class="row" style="margin-top:0"><label class="small">Category <select id="evcat"><option value="">All</option>' + opts(cats, cat) + "</select></label><span class=\"small\">" + list.length + " items</span></div>" +
      '<div class="tw"><table class="tt"><tr><th>ID</th><th>Claim / finding</th><th>Key figure</th><th>Source</th><th>Verified?</th><th>Still to check</th></tr>' +
      list.map(function (e) {
        return "<tr><td>" + esc(e.id) + "</td><td>" + esc(e.claim) + '<div class="small">' + esc(e.cat) + "</div></td><td>" + esc(e.fig || "") + "</td><td>" + (e.link ? '<a href="' + esc(e.link) + '" target="_blank" rel="noopener">' + esc(e.src) + " ↗</a>" : esc(e.src || "")) +
          '</td><td><select data-ev="' + esc(e.id) + '">' + opts(VER, evVer(e)) + "</select></td><td>" + esc(e.check || "") + "</td></tr>";
      }).join("") + "</table></div></div>";
    h += '<div class="card"><h2>Add evidence</h2><div class="tf"><label class="wide">Claim or finding<input id="nclaim"></label><label>Key figure<input id="nfig"></label><label>Category<select id="ncat">' + opts(cats.concat(["Other"]), "Other") + '</select></label><label>Step<input id="nstep" type="number" min="1" max="9" value="5"></label><label>Source<input id="nsrc"></label><label>Link<input id="nlink" placeholder="https://"></label><label>Verified?<select id="nver">' + opts(VER, "To check") + '</select></label><label class="wide">Still to check<input id="ncheck"></label></div><div class="row"><button class="btn pri" id="nadd">Add to evidence log</button></div></div>';
    page("tracker-evidence", h, "Evidence log", "One row per fact. Mark each one Yes only when you have checked it against a primary source.");
    $("evcat").onchange = function () { evidence(this.value); };
    each("[data-ev]", "change", function (el) { S.ev[el.dataset.ev] = { ver: el.value }; save("Evidence " + el.dataset.ev + " saved"); });
    $("nadd").onclick = function () {
      var c = $("nclaim").value.trim(); if (!c) { toast("Write the claim first"); return; }
      var id = "E" + String(D.evidence.length + S.addEv.length + 1).padStart(3, "0");
      S.addEv.push({ id: id, step: +$("nstep").value, cat: $("ncat").value, claim: c, fig: $("nfig").value, src: $("nsrc").value, link: $("nlink").value, ver: $("nver").value, check: $("ncheck").value });
      save("Added " + id); evidence(cat);
    };
  }

  function gaps() {
    var h = '<div class="card tw"><table class="tt"><tr><th>ID</th><th>Gap</th><th>How to fill it</th><th>Step</th><th>Priority</th><th>Status</th></tr>' +
      gapsAll().map(function (g) {
        return "<tr><td>" + esc(g.id) + '</td><td><b>' + esc(g.gap) + '</b><div class="small">' + esc(g.type) + " · " + esc(g.why || "") + "</div></td><td>" + esc(g.how || "") + '<div class="small">' + esc(g.where || "") + "</div></td><td>" + (g.step || "") + "</td><td>" + pill(g.pri, g.pri === "High") + '</td><td><select data-gap="' + esc(g.id) + '">' + opts(GSTAT, gapStatus(g)) + "</select></td></tr>";
      }).join("") + "</table></div>";
    h += '<div class="card"><h2>Add a gap</h2><div class="tf"><label class="wide">Gap<input id="ggap"></label><label>Type<select id="gtype">' + opts(["Information", "Research"], "Information") + '</select></label><label>Priority<select id="gpri">' + opts(["High", "Medium", "Low"], "Medium") + '</select></label><label>Step<input id="gstep" type="number" min="1" max="9" value="5"></label><label class="wide">How to fill it<input id="ghow"></label></div><div class="row"><button class="btn pri" id="gadd">Add gap</button></div></div>';
    page("tracker-gaps", h, "Gaps to fill", "Close a gap and you earn 20 XP.");
    each("[data-gap]", "change", function (el) { S.gaps[el.dataset.gap] = { status: el.value }; save(el.value === "Closed" ? "Gap closed: +20 XP" : "Saved"); });
    $("gadd").onclick = function () {
      var g = $("ggap").value.trim(); if (!g) { toast("Describe the gap first"); return; }
      var id = "G" + String(D.gaps.length + S.addGaps.length + 1).padStart(2, "0");
      S.addGaps.push({ id: id, type: $("gtype").value, gap: g, how: $("ghow").value, step: +$("gstep").value, pri: $("gpri").value, status: "Open" }); save("Added " + id); gaps();
    };
  }

  var LF = { q: "", tier: "", theme: "", focus: "", year: "", read: "", page: 0 };
  function lit() {
    if (!LIT) { page("tracker-lit", '<div class="card"><p>Loading 1,499 papers…</p></div>', "Literature 2024–2026"); fetch(BASE + "data/literature.json").then(function (r) { return r.json(); }).then(function (j) { LIT = j; lit(); }).catch(function () { toast("Could not load the literature list"); }); return; }
    var R = LIT.rows, themes = [], tierName = { C: "Core", H: "High", S: "Supporting" }, focusName = { G: "Ghana", A: "Africa", G2: "Global" };
    R.forEach(function (r) { if (themes.indexOf(r[1]) < 0) themes.push(r[1]); }); themes.sort();
    var q = LF.q.toLowerCase();
    var idx = []; R.forEach(function (r, i) {
      if (LF.tier && r[0] !== LF.tier) return; if (LF.theme && r[1] !== LF.theme) return; if (LF.focus && r[2] !== LF.focus) return; if (LF.year && String(r[3]) !== LF.year) return;
      if (LF.read && litRead(i) !== LF.read) return; if (q && (r[4] + " " + r[5] + " " + r[6]).toLowerCase().indexOf(q) < 0) return; idx.push(i);
    });
    var per = 40, pages = Math.max(1, Math.ceil(idx.length / per)); LF.page = Math.min(LF.page, pages - 1);
    var shown = idx.slice(LF.page * per, LF.page * per + per);
    var h = '<div class="card"><div class="tf"><label class="wide">Search title, author or journal<input id="lq" value="' + esc(LF.q) + '" placeholder="e.g. cookstove, REDD+, Article 6"></label>' +
      '<label>Relevance<select id="ltier"><option value="">All</option><option value="C"' + (LF.tier === "C" ? " selected" : "") + '>Core</option><option value="H"' + (LF.tier === "H" ? " selected" : "") + '>High</option><option value="S"' + (LF.tier === "S" ? " selected" : "") + ">Supporting</option></select></label>" +
      '<label>Theme<select id="ltheme"><option value="">All</option>' + opts(themes, LF.theme) + "</select></label>" +
      '<label>Focus<select id="lfocus"><option value="">All</option><option value="G"' + (LF.focus === "G" ? " selected" : "") + '>Ghana</option><option value="A"' + (LF.focus === "A" ? " selected" : "") + '>Africa</option></select></label>' +
      '<label>Year<select id="lyear"><option value="">All</option>' + opts(["2024", "2025", "2026"], LF.year) + "</select></label>" +
      '<label>My reading<select id="lread"><option value="">All</option>' + opts(READ, LF.read) + "</select></label></div>" +
      '<p class="small" style="margin-top:10px">' + idx.length.toLocaleString() + " papers match · page " + (LF.page + 1) + " of " + pages + "</p></div>";
    h += '<div class="card"><ul class="lit">' + shown.map(function (i) {
      var r = R[i], st = litRead(i), url = r[10] || r[9];
      return '<li><a href="' + esc(url) + '" target="_blank" rel="noopener"><b>' + esc(r[4]) + '</b></a><div class="m">' + esc(r[5]) + " · " + r[3] + (r[6] ? " · " + esc(r[6]) : "") + " · " + r[7] + " citations" +
        '</div><div class="a">' + pill(tierName[r[0]] || r[0], r[0] === "C") + pill(r[1]) + (r[2] === "G" ? pill("Ghana", true) : r[2] === "A" ? pill("Africa") : "") + (r[8] ? (r[9] ? '<a class="pill" href="' + esc(r[9]) + '" target="_blank" rel="noopener">Free full text ↗</a>' : pill("Open access")) : "") +
        '<select data-lit="' + i + '" class="f-' + st.replace(/ /g, "-") + '">' + opts(READ, st) + '</select><input data-litn="' + i + '" placeholder="My note" value="' + esc(S.lit[i] && S.lit[i].n || "") + '" style="flex:1;min-width:160px"></div></li>';
    }).join("") + '</ul><div class="row"><button class="btn" id="lprev"' + (LF.page ? "" : " disabled") + '>← Previous</button><button class="btn" id="lnext"' + (LF.page < pages - 1 ? "" : " disabled") + ">Next →</button></div></div>";
    page("tracker-lit", h, "Literature 2024–2026", "1,499 papers from OpenAlex, scored for relevance. Mark what you read: every paper read earns XP.");
    var t; $("lq").oninput = function () { var v = this.value; clearTimeout(t); t = setTimeout(function () { LF.q = v; LF.page = 0; lit(); var e = $("lq"); e.focus(); e.setSelectionRange(v.length, v.length); }, 350); };
    [["ltier", "tier"], ["ltheme", "theme"], ["lfocus", "focus"], ["lyear", "year"], ["lread", "read"]].forEach(function (p) { $(p[0]).onchange = function () { LF[p[1]] = this.value; LF.page = 0; lit(); }; });
    $("lprev").onclick = function () { LF.page--; lit(); }; $("lnext").onclick = function () { LF.page++; lit(); };
    each("[data-lit]", "change", function (el) { var i = el.dataset.lit; S.lit[i] = S.lit[i] || {}; S.lit[i].s = el.value; S.lit[i].c = R[i][0] === "C" ? 1 : 0; save(el.value === "Read" ? "Paper read: +" + (PTS.read + (R[i][0] === "C" ? PTS.core : 0)) + " XP" : "Saved"); el.className = "f-" + el.value.replace(/ /g, "-"); });
    each("[data-litn]", "change", function (el) { var i = el.dataset.litn; S.lit[i] = S.lit[i] || {}; S.lit[i].n = el.value; save("Note saved"); });
  }

  function sites(cat) {
    cat = cat || ""; var cats = []; D.sites.forEach(function (x) { if (cats.indexOf(x.cat) < 0) cats.push(x.cat); });
    var h = '<div class="card"><div class="row" style="margin-top:0"><label class="small">Category <select id="scat"><option value="">All</option>' + opts(cats, cat) + "</select></label></div></div>" +
      '<div class="tgrid">' + D.sites.map(function (x, i) {
        if (cat && x.cat !== cat) return ""; var used = !!S.sites[i];
        return '<div class="tool"><a href="' + esc(x.u) + '" target="_blank" rel="noopener"><b>' + esc(x.n) + " ↗</b></a><span class=\"small\">" + esc(x.cat) + " · " + esc(x.acc || "") + (x.pri === "Essential" ? " · Essential" : "") + "</span><span>" + esc(x.why) + '</span><span class="small"><b>How:</b> ' + esc(x.how) + '</span><label class="small"><input type="checkbox" data-site="' + i + '"' + (used ? " checked" : "") + "> Used it</label></div>";
      }).join("") + "</div>";
    h += '<div class="card" style="margin-top:18px"><h2>Search strings</h2><p class="hint">Copy into Scopus, Web of Science or Google Scholar.</p>' + D.strings.map(function (s) { return '<p style="margin-top:10px"><b>' + esc(s[0]) + '</b><br><code style="font-size:13px">' + esc(s[1]) + "</code></p>"; }).join("") + "</div>";
    page("tracker-sites", h, "Research sites", "50 databases and websites, each checked on 20 November 2026.");
    $("scat").onchange = function () { sites(this.value); };
    each("[data-site]", "change", function (el) { S.sites[el.dataset.site] = el.checked ? 1 : 0; save("Saved"); });
  }

  function dirs() {
    var h = '<div class="grid">' + D.dirs.map(function (x, i) {
      var dcs = S.dirs[i] || "Consider";
      return '<div class="card" style="margin:0"><h3>' + esc(x.t) + '</h3><p style="margin:6px 0">' + esc(x.q) + '</p><p class="small"><b>Why:</b> ' + esc(x.why) + '</p><p class="small"><b>Methods:</b> ' + esc(x.m) + '</p><p class="small"><b>Start with:</b> ' + esc(x.lit) + '</p><div class="row">' + pill("Feasibility: " + x.feas) + pill("Fit: " + x.fit, x.fit === "High") + '<select data-dir="' + i + '" class="f-' + dcs + '">' + opts(DEC, dcs) + "</select></div></div>";
    }).join("") + "</div>";
    page("tracker-dirs", h, "Research directions", "Mark the questions you want to pursue.");
    each("[data-dir]", "change", function (el) { S.dirs[el.dataset.dir] = el.value; save("Saved"); el.className = "f-" + el.value; });
  }

  function focus() {
    var s = stats(), list = focusSorted().reverse();
    var h = '<div class="card"><div class="kpis">' + kpi(s.streak, "day streak") + kpi(s.best, "best streak") + kpi(s.week + " / " + S.goal, "hours this week") + kpi(s.hours, "total focus hours") + "</div>" +
      '<div style="margin-top:12px">' + bar(s.week / S.goal) + '</div><div class="row"><label class="small">Weekly goal (hours) <input id="fgoal" type="number" min="1" max="60" value="' + S.goal + '" style="width:70px"></label></div></div>';
    h += '<div class="card"><h2>Log a work day</h2><p class="hint">One focus session = 25 minutes with your phone in another room.</p><div class="tf"><label>Date<input id="fdate" type="date" value="' + iso(today()) + '"></label><label class="wide">Main focus<input id="ftask" placeholder="What did you work on?"></label><label>Linked step<input id="fstep" type="number" min="1" max="9"></label><label>Focus sessions<input id="fsess" type="number" min="0" max="20" value="1"></label><label>Distractions (count)<input id="fdis" type="number" min="0" value="0"></label><label>Energy (1–5)<select id="fen">' + opts(["1", "2", "3", "4", "5"], "3") + '</select></label><label class="wide">What distracted me / my plan<input id="fwhat"></label><label class="wide">Win of the day<input id="fwin"></label></div><div class="row"><button class="btn pri" id="fadd">Save day</button></div></div>';
    h += '<div class="card tw"><h2>History</h2>' + (list.length ? '<table class="tt"><tr><th>Date</th><th>Focus</th><th>Sessions</th><th>Win</th><th></th></tr>' + list.map(function (f) { return "<tr><td>" + fd(f.date) + "</td><td>" + esc(f.task) + (f.step ? ' <span class="small">(Step ' + f.step + ")</span>" : "") + "</td><td>" + f.sess + " (" + f.sess * 25 + " min)</td><td>" + esc(f.win || "") + '</td><td><button class="btn" data-fdel="' + f.id + '">Delete</button></td></tr>'; }).join("") + "</table>" : '<p class="empty">No days logged yet. Log today to start your streak.</p>') + "</div>";
    page("tracker-focus", h, "Focus log", "Log each work day. Your streak and hours update automatically.");
    $("fgoal").onchange = function () { S.goal = Math.max(1, +this.value || 10); save("Goal saved"); focus(); };
    $("fadd").onclick = function () {
      var t = $("ftask").value.trim(); if (!t) { toast("Write your main focus first"); return; }
      S.focus.push({ id: Date.now(), date: $("fdate").value || iso(today()), task: t, step: $("fstep").value, sess: +$("fsess").value || 0, dis: +$("fdis").value || 0, energy: $("fen").value, what: $("fwhat").value, win: $("fwin").value });
      save("Day logged: +" + (+$("fsess").value || 0) * PTS.sess + " XP"); focus();
    };
    each("[data-fdel]", "click", function (el) { S.focus = S.focus.filter(function (f) { return String(f.id) !== el.dataset.fdel; }); save("Deleted"); focus(); });
  }

  function reflect() {
    var wk = iso(monday(today())), r = S.reflect[wk] || {};
    var F = [["wins", "Wins this week"], ["hard", "What was hard"], ["learned", "What I learned"], ["skill", "Skill I practised"], ["dist", "Distractions and my plan to beat them"], ["next", "Top 3 priorities next week"]];
    var h = '<div class="card"><h2>Week starting ' + fd(wk) + '</h2><p class="hint">Saved as you type. Focus hours this week: ' + hours(monday(today())) + '</p><div class="tf">' + F.map(function (f) { return '<label class="wide">' + f[1] + '<textarea data-rf="' + f[0] + '">' + esc(r[f[0]] || "") + "</textarea></label>"; }).join("") + '<label>Mood (1–5)<select data-rf="mood">' + opts(["", "1", "2", "3", "4", "5"], r.mood || "") + "</select></label></div></div>";
    var past = Object.keys(S.reflect).filter(function (k) { return k !== wk; }).sort().reverse();
    h += '<div class="card"><h2>Past weeks</h2>' + (past.length ? past.map(function (k) { var x = S.reflect[k]; return '<div class="note-item"><strong>Week of ' + fd(k) + "</strong>" + F.map(function (f) { return x[f[0]] ? "<p><em>" + f[1] + ":</em> " + esc(x[f[0]]) + "</p>" : ""; }).join("") + "</div>"; }).join("") : '<p class="empty">Your past reflections will appear here.</p>') + "</div>";
    page("tracker-reflect", h, "Weekly reflection", "Every Friday, 10 minutes. Reflection turns busy weeks into growth (+15 XP).");
    var tm; each("[data-rf]", "input", function (el) { S.reflect[wk] = S.reflect[wk] || {}; S.reflect[wk][el.dataset.rf] = el.value; clearTimeout(tm); tm = setTimeout(function () { save("Reflection saved"); }, 600); });
    each("select[data-rf]", "change", function (el) { S.reflect[wk] = S.reflect[wk] || {}; S.reflect[wk].mood = el.value; save("Saved"); });
  }

  function growth() {
    var s = stats();
    var h = '<div class="card"><div class="lvl"><div class="num">' + s.level + '</div><div><p class="eyebrow">' + esc(s.title) + "</p><b>" + s.xp.toLocaleString() + " XP</b>" + (s.nextXp ? " · " + (s.nextXp - s.xp).toLocaleString() + " XP to level " + (s.level + 1) : "") + bar(s.toNext) + '</div></div><div class="tw" style="margin-top:14px"><table class="tt"><tr><th>What you did</th><th>Count</th><th>Points</th><th>XP</th></tr>' + s.xpRows.map(function (r) { return "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td><td>" + r[2] + "</td><td><b>" + r[1] * r[2] + "</b></td></tr>"; }).join("") + "</table></div>" +
      '<p class="small" style="margin-top:8px">Levels: ' + D.levels.map(function (l) { return l[0] + " " + l[1] + " (" + l[2] + ")"; }).join(" · ") + "</p></div>";
    h += '<div class="card tw"><h2>Skills plan</h2><p class="hint">Rate yourself from 1 (new) to 5 (could teach it). Every level gained = 25 XP. Evening sessions are in your Google Calendar.</p><table class="tt"><tr><th>Skill</th><th>Now</th><th>Target</th><th>Progress</th><th>Status</th><th>Free resource and next action</th></tr>' +
      D.skills.map(function (x, i) { var k = skill(i), p = k.target - k.start <= 0 ? 1 : (k.cur - k.start) / (k.target - k.start); return "<tr><td><b>" + esc(x.s) + '</b><div class="small">' + esc(x.why) + '</div></td><td><select data-sk="' + i + '" data-f="cur">' + opts(["1", "2", "3", "4", "5"], String(k.cur)) + '</select></td><td><select data-sk="' + i + '" data-f="target">' + opts(["1", "2", "3", "4", "5"], String(k.target)) + "</select></td><td style=\"min-width:90px\">" + bar(p) + '</td><td><select data-sk="' + i + '" data-f="status">' + opts(SSTAT, k.status) + '</select></td><td><a href="' + esc(x.u) + '" target="_blank" rel="noopener">' + esc(x.res) + ' ↗</a><div class="small">' + esc(x.act) + "</div></td></tr>"; }).join("") + "</table></div>";
    h += '<div class="card tw"><h2>Milestones and rewards</h2><table class="tt"><tr><th>Milestone</th><th>Progress</th><th>Status</th><th>My reward</th></tr>' + s.ms.map(function (m) { return "<tr><td>" + esc(m.name) + "</td><td style=\"min-width:110px\">" + bar(m.target ? m.cur / m.target : 0) + '<span class="small">' + m.cur + " / " + m.target + "</span></td><td>" + (m.done ? pill("🏆 Unlocked") : pill("Locked")) + '</td><td><input data-rw="' + m.i + '" value="' + esc(S.rewards[m.i] || (m.i === 0 ? "A favourite meal" : "")) + '" placeholder="Choose a reward"></td></tr>'; }).join("") + "</table></div>";
    h += '<div class="card tw"><h2>Career and portfolio goals</h2><table class="tt"><tr><th>Output</th><th>Target date</th><th>Status</th></tr>' + D.outputs.map(function (o, i) { var st = outStatus(i), late = st !== "Done" && pd(o.due) < today(); return "<tr><td><b>" + esc(o.o) + '</b><div class="small">' + esc(o.why) + "</div></td><td>" + fd(o.due) + (late ? " " + pill("Overdue", true) : "") + '</td><td><select data-out="' + i + '">' + opts(OSTAT, st) + "</select></td></tr>"; }).join("") + "</table></div>";
    page("tracker-growth", h, "My growth", "Level up while you research: XP, skills, milestones and career goals.");
    each("[data-sk]", "change", function (el) { var i = el.dataset.sk; S.skills[i] = S.skills[i] || {}; S.skills[i][el.dataset.f] = el.value; save("Skill saved"); growth(); });
    each("[data-rw]", "change", function (el) { S.rewards[el.dataset.rw] = el.value; save("Reward saved"); });
    each("[data-out]", "change", function (el) { S.outs[el.dataset.out] = el.value; save(el.value === "Done" ? "Output done: +75 XP" : "Saved"); growth(); });
  }

  function backup() {
    var h = '<div class="card"><h2>Your data</h2><p>Your tracker is saved in this browser' + (S.saved ? " (last saved " + new Date(S.saved).toLocaleString("en-GB") + ")" : "") + '. To use it on another phone or computer, download a backup here and restore it there.</p><div class="row"><button class="btn pri" id="bdl">Download backup (.json)</button><label class="btn">Restore from backup<input id="bup" type="file" accept=".json,application/json" hidden></label><button class="btn" id="bcsv">Download focus log (.csv)</button><a class="btn" href="' + XLSX + '">Download Excel tracker</a></div></div>' +
      '<div class="card"><h2>Start over</h2><p class="hint">Clears your tracker changes in this browser only. Download a backup first.</p><div class="row"><button class="btn" id="breset">Reset tracker</button></div></div>';
    page("tracker-backup", h, "Backup and export", "Keep a copy of your progress.");
    function dl(name, text, type) { var b = new Blob([text], { type: type }), u = URL.createObjectURL(b), a = document.createElement("a"); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
    $("bdl").onclick = function () { dl("carbon-clarity-research-tracker-" + iso(today()) + ".json", JSON.stringify(S, null, 1), "application/json"); };
    $("bup").onchange = function () { var f = this.files[0]; if (!f) return; var rd = new FileReader(); rd.onload = function () { try { var o = JSON.parse(rd.result); if (typeof o !== "object" || !o) throw 0; sj(KEY, o); load(); toast("Backup restored"); dashboard(); } catch (e) { toast("That file is not a tracker backup"); } }; rd.readAsText(f); };
    $("bcsv").onclick = function () { var rows = [["date", "focus", "step", "sessions", "minutes", "distractions", "energy", "what distracted me", "win"]].concat(focusSorted().map(function (f) { return [f.date, f.task, f.step, f.sess, f.sess * 25, f.dis, f.energy, f.what, f.win]; })); dl("focus-log.csv", rows.map(function (r) { return r.map(function (c) { return '"' + String(c == null ? "" : c).replace(/"/g, '""') + '"'; }).join(","); }).join("\n"), "text/csv"); };
    $("breset").onclick = function () { if (window.confirm && !window.confirm("Reset your tracker changes in this browser?")) return; sj(KEY, {}); load(); toast("Tracker reset"); dashboard(); };
  }

  function each(sel, ev, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { el.addEventListener(ev, function () { fn(el); }); }); }



  /* ---------- Timetable and daily growth videos (mirrors Google Calendar) ---------- */
  var PLAN_START = new Date(2026, 10, 23), RES_END = new Date(2027, 0, 14), SKILL_END = new Date(2027, 4, 7);
  var MORNING = { 1: "Carbon markets & MRV", 2: "Research methods & data", 3: "Stove technology & measurement", 4: "Funding & running the venture", 5: "Carbon markets & policy" };
  var SKILLDAY = { 1: ["📊", "Skill: Data analysis"], 2: ["💰", "Skill: Financial analysis"], 3: ["📈", "Skill: Financial modelling"], 4: ["🧩", "Skill: Business analysis"], 5: ["🎤", "Skill: Public speaking & communication"] };
  function V(id, t, ch, st) { return { id: id, t: t, ch: ch, st: st || 0 }; }
  var VID = {
    1: [[V("Jx89DRlKe7E", "How to create Excel pivot tables and pivot charts", "Teacher's Tech"), V("PdJzy956wo4", "How to create a pivot table in Excel", "Kevin Stratvert"), V("81qvxqG0CuA", "Excel pivot tables: 5 easy steps", "GoSkills"), V("a_yrUypZP7U", "PivotTables for beginners", "Computergaga")],
        [V("c7LrqSxjJQQ", "From zero to your first dashboard", "Leila Gharani"), V("Jx89DRlKe7E", "Pivot charts for dashboards", "Teacher's Tech")],
        [V("zpAGbu9mSL4", "SQL for data analysts (first 20 minutes)", "Absent Data"), V("7S_tz1z_5bA", "SQL course for beginners (part 1)", "Programming with Mosh"), V("7S_tz1z_5bA", "SQL course for beginners (part 2)", "Programming with Mosh", 1200)],
        [V("aPyKAve54hw", "Pandas for beginners in 10 minutes", "The Data Mentor"), V("nvitKcp_AVg", "Analyse data using Python: a pandas project", "Data Geek is my name"), V("gtjxAH8uaP0", "Pandas and Python for data analysis (part 1)", "freeCodeCamp")],
        [V("c7LrqSxjJQQ", "Power BI: first dashboard in 20 minutes", "Leila Gharani"), V("wM0Vpq5Vu_I", "Power BI Desktop in 4 steps", "Teacher's Tech"), V("AuYzsfXKkbM", "Power BI basics and beyond", "Technocraft")],
        [V("c7LrqSxjJQQ", "Rewatch: build your portfolio dashboard", "Leila Gharani"), V("nvitKcp_AVg", "Rewatch: a full analysis project", "Data Geek is my name")]],
    2: [[V("CE9HnV3b_jY", "The 3 financial statements: how they connect", "Ryan O'Connell, CFA"), V("c9bIcAeZBsE", "How financial statements work together", "Accounting with Professor Lamptey"), V("OGJBapKV1oE", "Connecting income statement, balance sheet and cash flow", "Bull Investor")],
        [V("3W_LwpeG8c8", "Financial ratios: how to analyse statements", "Accounting Stuff"), V("qDQGc-bj5As", "Five categories of financial ratios", "Management Study Guide"), V("XdZugHc9qH8", "Financial ratio analysis", "Learn Finance Institute")],
        [V("OGJBapKV1oE", "Cash flow: connecting the statements", "Bull Investor"), V("c9bIcAeZBsE", "Statements and cash flows together", "Accounting with Professor Lamptey")],
        [V("Fw5-wccViOM", "NPV and IRR explained", "The Finance Storyteller"), V("3N6Anu3WXoA", "NPV and IRR explained", "Kountin Koins"), V("56pjqu470Vo", "Net present value and internal rate of return", "Sunny Sensei")],
        [V("Fw5-wccViOM", "Appraising projects with NPV and IRR", "The Finance Storyteller"), V("3W_LwpeG8c8", "Ratios for judging a business", "Accounting Stuff")],
        [V("3W_LwpeG8c8", "Rewatch: analysing a real company", "Accounting Stuff"), V("CE9HnV3b_jY", "Rewatch: the three statements", "Ryan O'Connell, CFA")]],
    3: [[V("gVfvWQ-dvOk", "Introduction to financial modelling", "The Excel Pro"), V("4CW0eE85woI", "How to build a financial model step by step", "Yash Chandorkar")],
        [V("1KvrQOQPCDI", "Build a 3-statement financial model", "Kenji Explains"), V("2VWaLP8-XJo", "Build a 3-statement model in Excel", "Finally Learn")],
        [V("4CW0eE85woI", "Revenue and cost drivers in a model", "Yash Chandorkar"), V("gVfvWQ-dvOk", "Modelling structure revisited", "The Excel Pro")],
        [V("W6pNN5YQ8WI", "How carbon markets work", "Carbon Credit Capital"), V("Fw5-wccViOM", "NPV and IRR for your carbon model", "The Finance Storyteller"), V("91Ss1ZhS7zE", "What carbon credits are and are not", "Pearce Sustainability Consulting")],
        [V("1KvrQOQPCDI", "Scenarios and checks in a full model", "Kenji Explains")],
        [V("2VWaLP8-XJo", "Rewatch: complete model walkthrough", "Finally Learn")]],
    4: [[V("xFsrdEtOqzg", "What is business analysis?", "Mike Clayton"), V("j-5jnrNKoqc", "What is a business analyst? Simple explanation", "TheBATutor"), V("Dg3lPLGAxVs", "What does a business analyst do?", "The Career Force")],
        [V("e76DUmWu5rw", "Introduction to stakeholder analysis", "JanBask Training"), V("xFsrdEtOqzg", "Business analysis and stakeholders", "Mike Clayton")],
        [V("ancKD_YFYwU", "Introduction to business process modelling", "ABC Consult"), V("BFeHAONDDtw", "BPMN process map tutorial and example", "The Business Analysis Doctor"), V("7_OWoVRUXXo", "BPMN 2.0 in a nutshell", "ProcessMaker")],
        [V("q26147zlcMU", "User stories and acceptance criteria example", "The Business Analysis Doctor"), V("NLkcduSPHoI", "User stories and acceptance criteria explained", "Management Bliss")],
        [V("xFsrdEtOqzg", "From analysis to a business case", "Mike Clayton"), V("ancKD_YFYwU", "Process thinking for your business case", "ABC Consult")],
        [V("Dg3lPLGAxVs", "Rewatch: the business analyst's role", "The Career Force")]],
    5: [[V("eIho2S0ZahI", "How to speak so that people want to listen", "TED · Julian Treasure"), V("Unzc731iCUY", "How to Speak (part 1)", "MIT OpenCourseWare · Patrick Winston")],
        [V("1nYFpuc2Umk", "The common structure of great talks", "TEDx · Nancy Duarte"), V("Unzc731iCUY", "How to Speak (part 2)", "MIT OpenCourseWare · Patrick Winston", 1200)],
        [V("Unzc731iCUY", "How to Speak: slides and props (part 3)", "MIT OpenCourseWare · Patrick Winston", 2400), V("c7LrqSxjJQQ", "Presenting data clearly", "Leila Gharani")],
        [V("eIho2S0ZahI", "Rewatch: voice and presence", "TED · Julian Treasure"), V("Unzc731iCUY", "How to Speak (part 1, rewatch)", "MIT OpenCourseWare")],
        [V("1nYFpuc2Umk", "Persuasion: the structure of great talks", "TEDx · Nancy Duarte")],
        [V("eIho2S0ZahI", "Before your 10-minute talk", "TED · Julian Treasure")]],
    6: [[V("eIho2S0ZahI", "How to speak so that people want to listen", "TED · Julian Treasure"), V("1nYFpuc2Umk", "The common structure of great talks", "TEDx · Nancy Duarte"), V("Unzc731iCUY", "How to Speak (part 1)", "MIT OpenCourseWare")]],
    0: [[V("Yp_G-5T86SA", "Article 6 of the Paris Agreement explained", "myclimate"), V("W6pNN5YQ8WI", "How carbon markets work", "Carbon Credit Capital"), V("RdxDcI6P24Q", "Demystifying the Article 6 deal: five experts", "Carbon Market Watch"), V("91Ss1ZhS7zE", "What carbon credits are and are not", "Pearce Sustainability Consulting"), V("zlGsFpsZvT0", "Carbon credits and markets explained", "Tasneem Bakri")]]
  };
  function weekIdx(d) { return Math.max(0, Math.floor((monday(d) - PLAN_START) / 6048e5)); }
  function videoFor(d) {
    var dow = d.getDay(), sets = VID[dow]; if (!sets) return null;
    var w = weekIdx(d), ph = Math.min(sets.length - 1, Math.floor(w / 4)), list = sets[ph];
    return list[w % list.length];
  }
  function ymdKey(d) { return iso(d); }
  function plan(d) {
    var dow = d.getDay(), b = [], t0 = new Date(d); t0.setHours(0, 0, 0, 0);
    function add(s, e, t, k, id) { b.push({ s: s, e: e, t: t, k: k || "", id: id || k || "" }); }
    var skills = t0 >= PLAN_START && t0 <= SKILL_END && !(t0.getMonth() === 11 && t0.getDate() === 25) && !(t0.getMonth() === 0 && t0.getDate() === 1);
    var research = t0 <= RES_END && t0 >= new Date(2026, 10, 24);
    add("06:00", "06:30", "🙏 Morning prayer", "", "prayer");
    if (dow >= 1 && dow <= 5) {
      add("07:00", "07:45", "📚 Learn: " + MORNING[dow], "learn");
      if (dow === 1) add("08:00", "08:30", "Weekly planning: check the Carbon Clarity work plan", "", "plan");
      if ((dow === 2 || dow === 4) && research) add("08:30", "10:30", "🌍 Ghana carbon market research (deep work)", "research");
      else add("08:30", "10:30", "Deep work: Carbon Clarity research and writing", "deep");
      add("10:30", "12:30", "Project tasks, emails and meetings", "", "tasks");
      add("12:30", "13:30", "Lunch break", "", "lunch");
      add("13:30", "16:30", "Fieldwork, pilot and admin", "", "field");
      if (dow === 2) add("16:15", "16:45", "📚 Learn (afternoon): Stove design & development", "learn", "learn-pm");
      if (dow === 4) add("16:15", "16:45", "📚 Learn (afternoon): Sensors, IoT & data", "learn", "learn-pm");
      add("16:30", "17:00", dow === 5 ? "Weekly review: what moved, what's next" : "Wrap up the day: update the work plan", "", dow === 5 ? "review" : "wrap");
      if (skills) { add("18:45", "19:00", "🎬 Growth video", "video"); add("19:00", "19:45", SKILLDAY[dow][0] + " " + SKILLDAY[dow][1], "skill"); }
    } else if (dow === 6) {
      add("08:45", "09:00", "🎬 Growth video", "video");
      add("09:00", "10:00", "🎤 Practice: explain this week's learning out loud", "skill");
    } else {
      add("09:00", "12:00", "⛪ Church", "", "church"); add("16:45", "17:00", "🎬 Growth video (light)", "video"); add("17:00", "17:30", "🌱 Learn: Leadership & reflection (light)", "learn", "learn-sun");
    }
    add("21:30", "22:00", "🙏 Evening prayer", "", "prayer");
    b.sort(function (x, y) { return x.s < y.s ? -1 : 1; });
    return b;
  }
  function mins(hm) { var p = hm.split(":"); return +p[0] * 60 + +p[1]; }
  function nowNext() {
    var n = new Date(), m = n.getHours() * 60 + n.getMinutes(), b = plan(n), now = b.filter(function (x) { return mins(x.s) <= m && m < mins(x.e); }), next = b.filter(function (x) { return mins(x.s) > m; })[0];
    return { now: now, next: next, m: m };
  }
  function nnHtml() {
    var x = nowNext(), cur = x.now.length ? x.now.map(function (b) { return "<b>" + esc(b.t) + '</b> <span class="small">until ' + b.e + "</span>"; }).join("<br>") : '<b>Free time</b> <span class="small">rest, family or catch-up</span>';
    var nx = x.next ? esc(x.next.t) + " at " + x.next.s + ' <span class="small">(in ' + (mins(x.next.s) - x.m) + " min)</span>" : "Nothing else today. Rest well.";
    var d0 = today(), nb = x.now.filter(function (b) { return majorIds().indexOf(b.id) >= 0; })[0], xb = nb ? brief(nb, d0) : null, nxb = x.next ? brief(x.next, d0) : null;
    if (xb) cur += '<div class="nnb"><b>You need:</b> ' + esc(xb.goal) + (xb.out ? " <b>Output:</b> " + esc(xb.out) : "") + '<div class="row" style="margin-top:6px"><a class="btn small" href="#tracker-time" data-open="' + xb.id + '">Open session brief</a><a class="btn pri small" target="_blank" rel="noopener" href="' + claudeUrl(askPrompt(xb, d0)) + '">✨ Ask AI</a></div></div>';
    if (nxb && nxb.goal) nx += '<div class="nnb"><b>Prepare:</b> ' + esc(nxb.goal) + "</div>";
    return '<div class="nn"><div><p class="eyebrow">Now</p>' + cur + '</div><div><p class="eyebrow">Next</p>' + nx + "</div></div>";
  }
  function videoCard(d, compact) {
    var v = videoFor(d); if (!v) return "";
    var k = ymdKey(d), seen = !!S.vids[k], slot = plan(d).filter(function (b) { return b.k === "video"; })[0];
    return '<div class="card"><p class="eyebrow">Today\'s growth video' + (slot ? " · " + slot.s + "–" + slot.e : "") + "</p><h2>" + esc(v.t) + '</h2><p class="small">' + esc(v.ch) + (v.st ? " · starts at " + Math.round(v.st / 60) + " min" : "") + "</p>" +
      (compact ? "" : '<div class="vwrap"><iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/' + v.id + "?rel=0" + (v.st ? "&start=" + v.st : "") + '" title="' + esc(v.t) + '" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>') +
      '<div class="row"><a class="btn" href="https://www.youtube.com/watch?v=' + v.id + (v.st ? "&t=" + v.st + "s" : "") + '" target="_blank" rel="noopener">Open on YouTube ↗</a><label class="btn' + (seen ? " pri" : "") + '"><input type="checkbox" data-vid="' + k + '"' + (seen ? " checked" : "") + ' hidden>' + (seen ? "✓ Watched" : "Mark watched (+5 XP)") + "</label>" + (compact ? '<a class="btn" href="#tracker-time">Watch here</a>' : "") + "</div></div>";
  }
  function wireVid(root, again) { Array.prototype.forEach.call((root || document).querySelectorAll("[data-vid]"), function (el) { el.onchange = function () { S.vids[el.dataset.vid] = el.checked ? 1 : 0; save(el.checked ? "Video watched: +5 XP" : "Saved"); again(); }; }); }
  var TT_TIMER = null;
  function timetable(dayOff) {
    dayOff = dayOff || 0; var d = today(); d.setDate(d.getDate() + dayOff);
    var names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], wk = monday(today());
    var pick = '<div class="weekpick">' + [0, 1, 2, 3, 4, 5, 6].map(function (i) { var x = new Date(wk); x.setDate(x.getDate() + i); var off = Math.round((x - today()) / 864e5); return '<button class="btn' + (off === dayOff ? " pri" : "") + '" data-day="' + off + '">' + names[x.getDay()] + " " + x.getDate() + "</button>"; }).join("") + "</div>";
    var cur = dayOff === 0 ? nowNext() : null, blocks = plan(d);
    var h = (dayOff === 0 ? '<div class="card">' + nnHtml() + "</div>" : "") + digest(d, { full: true }) + videoCard(d) +
      '<div class="card"><h2>' + d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) + "</h2>" + pick +
      '<ul class="agenda">' + blocks.map(function (b) { var on = cur && cur.now.some(function (n) { return n.s === b.s && n.t === b.t; }), past = dayOff < 0 || (cur && mins(b.e) <= cur.m), x = brief(b, d), op = OPEN ? OPEN === b.id : on && majorIds().indexOf(b.id) >= 0; return '<li class="blk ' + b.k + (on ? " on" : "") + (past ? " past" : "") + (isDone(d, b.id) ? " dn" : "") + '" id="blk-' + b.id + '"><details' + (op ? " open" : "") + '><summary><span class="tm">' + b.s + "–" + b.e + "</span><span>" + esc(x.title) + "</span></summary>" + briefHtml(x, d) + "</details></li>"; }).join("") + "</ul>" +
      '<p class="hint" style="margin-top:12px">This timetable matches your Google Calendar, which sends a reminder 10 minutes before each block.</p></div>';
    var wkv = '<div class="card tw"><h2>This week\'s videos</h2><table class="tt"><tr><th>Day</th><th>Time</th><th>Video</th><th>Watched</th></tr>' + [1, 2, 3, 4, 5, 6, 0].map(function (i) { var x = new Date(wk); x.setDate(x.getDate() + ((i + 6) % 7)); var v = videoFor(x), sl = plan(x).filter(function (b) { return b.k === "video"; })[0]; if (!v || !sl) return ""; return "<tr><td>" + names[x.getDay()] + " " + x.getDate() + "</td><td>" + sl.s + '</td><td><a href="https://www.youtube.com/watch?v=' + v.id + (v.st ? "&t=" + v.st + "s" : "") + '" target="_blank" rel="noopener">' + esc(v.t) + '</a><div class="small">' + esc(v.ch) + "</div></td><td>" + (S.vids[ymdKey(x)] ? pill("✓") : "") + "</td></tr>"; }).join("") + "</table></div>";
    page("tracker-time", h + summaryCard(d) + wkv, "Timetable", "Your day, in time. Tap any block for its session brief: what you need to know, what to do, the output, and an AI briefing.");
    wireDigest(document, function () { timetable(dayOff); });
    each("[data-open]", "click", function (el) { var t = document.getElementById("blk-" + el.dataset.open); if (t) { var dt = t.querySelector("details"); if (dt) dt.open = true; setTimeout(function () { t.scrollIntoView({ behavior: "smooth", block: "start" }); }, 30); } });
    if (OPEN) { var tg = document.getElementById("blk-" + OPEN); OPEN = null; if (tg) setTimeout(function () { tg.scrollIntoView({ block: "start" }); }, 60); }
    each("[data-day]", "click", function (el) { timetable(+el.dataset.day); });
    wireVid(document, function () { timetable(dayOff); });
    clearInterval(TT_TIMER); TT_TIMER = setInterval(function () { if (location.hash !== "#tracker-time") { clearInterval(TT_TIMER); return; } var n = document.querySelector(".nn"); if (n && dayOff === 0 && !document.activeElement.matches("textarea")) { n.outerHTML = nnHtml(); } }, 30000);
  }
  /* ---------- Session briefs: what you need for every block, plus AI help ---------- */
  var TUTOR = "https://claude.ai/artifact/L6hXAapMaaRZC6KDfowS39";
  var NOTES_DOC = "https://docs.google.com/document/d/1vxnDlsg9PAJlUZEmL7xdZ3aes5q9xmBcQpJiPLOS2Sc/edit";
  var LSTART = new Date(2026, 10, 9), DAYN = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var LESSON = { "mon-1": "What a carbon credit is", "mon-2": "Gold Standard metered & measured method", "mon-3": "Verra VM0050", "mon-4": "CLEAR, the newest approach",
    "tue-1": "Designing a good survey", "tue-2": "Thematic analysis of interviews", "tue-3": "Basic statistics in R", "tue-4": "Writing for peer review",
    "wed-1": "How fire and smoke work", "wed-2": "Testing stoves to a standard", "wed-3": "Measuring smoke exposure", "wed-4": "Sensors, IoT and audit-ready data",
    "thu-1": "Writing a winning grant", "thu-2": "A simple financial model", "thu-3": "Pitching", "thu-4": "Partnerships & agreements",
    "fri-1": "What makes a credit high quality", "fri-2": "The over-crediting critique", "fri-3": "Article 6 and Ghana's carbon market", "fri-4": "Ghana's clean cooking policy & L.I. 2454",
    "stv-1": "Heat, airflow and design principles", "stv-2": "Fish smokers compared: Chorkor, Ahotor, FTT", "stv-3": "Designing with processors", "stv-4": "Prototyping and fair testing",
    "sen-1": "What to measure, and how sensors work", "sen-2": "Monitoring stove use", "sen-3": "Building an IoT monitoring kit", "sen-4": "Trustworthy data: the Data Vault and digital MRV" };
  function P(t, pts, todo, out) { return { t: t, pts: pts, todo: todo, out: out }; }
  var SK = {
    1: { name: "Data analysis", q: "What one decision could this analysis change?", ph: [
      P("Excel foundations and pivot tables", ["Keep data tidy: one row per record, one column per field, no merged cells.", "A pivot table summarises thousands of rows in seconds; drag fields, don't type totals.", "SUMIFS, COUNTIFS and XLOOKUP give exact answers you can check."], ["Turn one real dataset (literature list or pilot log) into an Excel Table.", "Build one pivot that answers a real question, e.g. papers per theme per year."], "One pivot table and one sentence saying what it shows."),
      P("Charts and dashboards", ["One chart, one message: bars compare, lines show trends.", "Title each chart with the takeaway, not the variable name.", "A good dashboard shows 3 to 5 numbers that drive decisions."], ["Build a one-page dashboard from your research tracker or wood-use data.", "Ask: could a funder read it in 30 seconds?"], "A one-page dashboard with headline titles."),
      P("SQL basics", ["SELECT, WHERE, ORDER BY pick and filter rows.", "GROUP BY with COUNT, SUM and AVG summarises.", "JOIN links tables through a shared key (e.g. processor ID)."], ["Open a free SQL sandbox and load a sample table.", "Write 5 queries that each answer a plain-English question."], "Five saved queries with their answers."),
      P("Python and pandas", ["read_csv, filtering and groupby do most of the work.", "merge joins tables; plot gives a quick chart.", "Google Colab runs Python free in your browser."], ["Load the literature list in Colab and count papers by theme and year.", "Make one chart and write what it tells you."], "A notebook with three findings."),
      P("Power BI", ["Import, model (relationships), then visualise.", "Measures (simple DAX like SUM and DIVIDE) keep numbers consistent.", "Slicers let the viewer filter by site, month or stove type."], ["Rebuild your Excel dashboard in Power BI.", "Add one slicer and one card showing a key number."], "One interactive Power BI report."),
      P("Portfolio project", ["Question, data, clean, analyse, tell the story.", "State limits honestly: sample size, missing data, bias.", "Finish with a recommendation someone can act on."], ["Pick one Carbon Clarity question, e.g. wood used per kg of fish, Chorkor vs Ahotor.", "Write a one-page findings brief with one chart."], "A portfolio piece you can show funders and employers.")] },
    2: { name: "Financial analysis", q: "What does this number tell a funder that words cannot?", ph: [
      P("The three financial statements", ["Income statement: did we make a profit?", "Balance sheet: what we own, what we owe, what's left for owners.", "Cash flow statement: where cash actually came from and went."], ["Take one annual report (e.g. a company listed on the Ghana Stock Exchange).", "Trace net income from the income statement into the cash flow statement and equity."], "A one-page map of how the three statements link."),
      P("Ratio analysis", ["Profitability: gross and net margin.", "Liquidity: current ratio. Leverage: debt to equity.", "Efficiency: asset turnover. Always compare across years or peers."], ["Calculate six ratios for one company over two years.", "Note what changed and suggest why."], "A ratio table with three observations."),
      P("Cash flow and working capital", ["Profit is not cash: sales on credit, stock and bills timing all matter.", "Small businesses usually fail from running out of cash, not from losses.", "Receivables, payables and inventory are working capital."], ["Sketch a 12-month cash flow for a fish processor or for the pilot budget.", "Mark the month cash is tightest."], "A monthly cash flow sheet."),
      P("NPV and IRR", ["Money today is worth more than money later; the discount rate captures that.", "NPV above zero means the project creates value at that rate.", "IRR is the rate where NPV is zero; compare it to your hurdle rate. Payback is simple but ignores later years."], ["Estimate the NPV and payback of an Ahotor oven for one processor (cost versus wood saved).", "List every assumption next to its source."], "An NPV/IRR calculation with assumptions listed."),
      P("Project appraisal", ["Test sensitivity: which input changes the answer most?", "Use low, base and high scenarios.", "Treat carbon revenue as upside, not the base case, until credits are issued."], ["Re-run the oven NPV with low, base and high wood and carbon prices.", "Write the decision rule: when is it worth it?"], "A sensitivity table and a one-line verdict."),
      P("Real-company analysis", ["Cover performance, financial position, cash and risks.", "End with a clear verdict and the evidence for it.", "Write for a busy reader: numbers first, then meaning."], ["Write a one-page analysis of a listed company or of Carbon Clarity's budget.", "Ask a friend to read it and tell you the main point."], "A one-page financial analysis memo.")] },
    3: { name: "Financial modelling", q: "Which single assumption moves the result most, and how sure am I of it?", ph: [
      P("Model structure", ["Inputs, then calculations, then outputs, on separate sheets.", "Colour code: inputs blue, formulas black. Never type a number inside a formula.", "One row, one formula, copied across time."], ["Set up the skeleton of a Carbon Clarity model with an Inputs sheet.", "Add a timeline across the top (years or months)."], "A clean model skeleton."),
      P("Three-statement model", ["Revenue drives the income statement; it flows to the balance sheet and cash flow.", "The balance sheet must balance: build a check cell.", "Cash is the plug that links everything."], ["Follow one three-statement build video and replicate year one.", "Make the balance check show zero."], "One balancing three-statement year."),
      P("Drivers and assumptions", ["Revenue = units x price; costs split into fixed and variable.", "Keep every assumption in one place with its source.", "Simple drivers beat complicated guesses."], ["Model ovens installed, wood saved per oven and price per oven.", "Link costs to the number of ovens."], "A driver-based revenue and cost build."),
      P("Carbon project model", ["Credits per oven per year depend on wood saved, emission factors and fNRB.", "Include verification costs, buffer, issuance delays and the women's benefit share.", "Credit price is uncertain: model it as an input, not a fact."], ["Build a credit schedule for 100 ovens over 7 years.", "Calculate net carbon revenue and NPV."], "A carbon revenue schedule with NPV."),
      P("Scenarios and checks", ["A scenario switch flips low, base and high inputs at once.", "Data tables show how results change with one or two inputs.", "Error checks catch broken links before a funder does."], ["Add a scenario switch and three checks.", "Test sensitivity to fNRB and credit price."], "A scenario-ready model."),
      P("Complete and present", ["A summary sheet shows the 3 numbers that matter.", "Document assumptions so someone else can audit the model.", "Explain the model in two minutes without opening every sheet."], ["Finish the summary sheet.", "Present the three key numbers out loud in two minutes."], "A finished model with a one-page summary.")] },
    4: { name: "Business analysis", q: "Whose need did I understand better today?", ph: [
      P("The business analyst's role", ["Understand the problem before choosing a solution.", "Requirements describe what is needed, not how to build it.", "Good BAs ask why five times."], ["Write a problem statement for one Carbon Clarity challenge, e.g. getting accurate wood-use data.", "List who feels the problem and how you know."], "A one-paragraph problem statement."),
      P("Stakeholder analysis", ["Identify everyone affected or with influence.", "A power/interest grid shows who to manage closely.", "RACI makes clear who decides and who is informed."], ["Map Carbon Clarity stakeholders: processors, CSIR-FRI, EPA and the Carbon Markets Office, buyers, funders, community leaders.", "Write one engagement action for each high-power group."], "A stakeholder map with an engagement plan."),
      P("Process mapping", ["Map the as-is process first, then the to-be.", "Swimlanes show who does each step.", "Pain points and delays are where value hides."], ["Map today's fish smoking and data-recording process.", "Mark three pain points and draw the improved process."], "As-is and to-be process maps."),
      P("Requirements and user stories", ["Format: As a [user], I want [goal], so that [benefit].", "Acceptance criteria say when a story is done.", "MoSCoW: must, should, could, won't (for now)."], ["Write 8 user stories for the Data Vault app.", "Prioritise them with MoSCoW."], "A prioritised backlog."),
      P("Business case", ["Problem, options, costs and benefits, risks, recommendation.", "Always include a do-nothing option.", "Quantify benefits where you can, and say where you can't."], ["Draft a business case for scaling improved ovens in James Town.", "Compare at least two options."], "A two-page business case."),
      P("Capstone", ["Bring it together: problem, stakeholders, process, requirements, case.", "Keep it short and visual.", "This is a portfolio piece."], ["Assemble a short BA pack for one feature or programme.", "Share it with one colleague for feedback."], "A BA portfolio pack.")] },
    5: { name: "Public speaking and communication", q: "What did my listener remember?", ph: [
      P("Voice and presence", ["Pace, pause, pitch and volume carry meaning.", "Breathe low and slow before you start.", "Look at people, not at the slides."], ["Record a 2-minute explanation of Carbon Clarity on your phone.", "Watch it once and note two fixes."], "A recording and two fixes."),
      P("Structure", ["Hook, one big idea, three points, a clear ask.", "Contrast what is with what could be.", "If you can't say it in one sentence, it isn't ready."], ["Outline a 5-minute talk on your Ghana carbon market research.", "Write the one-sentence big idea first."], "A one-page talk outline."),
      P("Slides and data", ["One idea per slide, big text, few words.", "Charts need a headline that says the point.", "You are the presentation; slides support you."], ["Make 5 slides for your research update.", "Cut every slide's text by half."], "Five clean slides."),
      P("Delivery practice", ["Rehearse out loud, not in your head.", "Nerves are energy: slow down and pause.", "Time yourself and cut to fit."], ["Deliver your 5-minute talk to one person or the camera.", "Ask for one specific piece of feedback."], "A delivered talk and feedback."),
      P("Persuasion and Q&A", ["Start from the audience's goal, not yours.", "Evidence plus a story persuades better than either alone.", "Answer, bridge back to your message, stop."], ["Write answers to the 5 hardest questions a funder could ask.", "Practise each answer in under 45 seconds."], "A Q&A sheet."),
      P("The ten-minute talk", ["Put everything together: structure, voice, slides, Q&A.", "Record, review, refine.", "End with a clear ask."], ["Give a 10-minute talk to your team, a group or the camera.", "Review it and note one strength and one fix."], "A final 10-minute talk recording.")] }
  };
  var STEPSTR = { 1: 0, 2: 0, 3: 1, 4: 0, 5: 4, 6: 5, 7: 4, 8: 0, 9: 5 };
  function lessonId(d, pre) { var w = Math.floor((monday(d) - monday(LSTART)) / 6048e5); w = ((w % 4) + 4) % 4 + 1; return (pre || DAYN[d.getDay()]) + "-" + w; }
  function phase(d) { return Math.max(0, Math.min(5, Math.floor(weekIdx(d) / 4))); }
  function curStep(d) {
    var open = D.steps.filter(function (x) { return stepStatus(x) !== "Completed"; }).sort(function (a, b) { return a.due < b.due ? -1 : 1; });
    return open[0] || null;
  }
  function minsOf(b) { return mins(b.e) - mins(b.s); }
  function brief(b, d) {
    var dow = d.getDay(), x = { id: b.id, k: b.k, title: b.t, time: b.s + "–" + b.e, goal: "", pts: [], todo: [], out: "", q: "", links: [] };
    switch (b.id) {
      case "skill": {
        if (dow === 6) { x.goal = "Explain this week's learning out loud, as if to a funder or a processor."; x.pts = ["Pick the 3 ideas from this week you'd most want someone to remember.", "Say each in under a minute, with a James Town example.", "Record yourself: hearing it back is the fastest way to improve."]; x.todo = ["Pick 3 ideas from this week's lessons and skill sessions.", "Record a 3-minute voice note explaining them.", "Write down the one question you couldn't answer well."]; x.out = "A 3-minute recording and one question to follow up."; x.q = "Which idea was hardest to explain simply, and why?"; x.links = [["Saturday practice", "#sat"]]; break; }
        var sk = SK[dow], ph = sk.ph[phase(d)], wk = weekIdx(d) % 4 + 1;
        x.title = SKILLDAY[dow][0] + " " + sk.name + ": " + ph.t; x.goal = "Phase " + (phase(d) + 1) + " of 6, week " + wk + " of 4: " + ph.t + ".";
        x.pts = ph.pts; x.todo = ["5 min: recall last session in 3 bullet points.", "25 min: " + ph.todo[0], "10 min: " + ph.todo[1], "5 min: write 3 sentences on what you learned."]; x.out = ph.out; x.q = sk.q;
        var v = videoFor(d); if (v) x.links.push(["Tonight's video: " + v.t, "https://www.youtube.com/watch?v=" + v.id + (v.st ? "&t=" + v.st + "s" : "")]);
        x.links.push(["My growth skills plan", "#tracker-growth"]); break;
      }
      case "video": {
        var vv = videoFor(d); x.title = "🎬 Growth video" + (vv ? ": " + vv.t : ""); x.goal = "Warm up your mind for tonight's skill session.";
        x.pts = vv ? ["Channel: " + vv.ch + (vv.st ? " (start at " + Math.round(vv.st / 60) + " min)" : ""), "Watch for one idea you can use in the next 45 minutes.", "15 minutes is enough; you don't need to finish long videos."] : ["Pick a short talk that makes you better at your craft."];
        x.todo = ["Watch with a notebook open.", "Write the one idea you'll use tonight.", "Tick 'Mark watched' for +5 XP."]; x.out = "One idea written down."; x.q = "What will I do differently because of this video?";
        if (vv) x.links.push(["Open on YouTube", "https://www.youtube.com/watch?v=" + vv.id + (vv.st ? "&t=" + vv.st + "s" : "")]); break;
      }
      case "research": {
        var st = curStep(d);
        if (!st) { x.goal = "All research steps are done: polish and share the report."; x.todo = ["Read the report once, start to finish.", "Fix the three weakest sentences."]; x.out = "A cleaner final report."; x.q = "What is the single most important finding?"; break; }
        var gs = gapsAll().filter(function (g) { return g.step === st.n && gapStatus(g) !== "Closed"; }).sort(function (a, c) { var pr = { High: 0, Medium: 1, Low: 2 }; return pr[a.pri] - pr[c.pri]; }).slice(0, 2);
        var str = D.strings[STEPSTR[st.n] || 0];
        x.title = "🌍 Research, Step " + st.n + ": " + st.task; x.goal = "Move Step " + st.n + " forward (due " + fd(st.due) + ", " + stepStatus(st).toLowerCase() + ").";
        x.pts = ["Deliverable: " + st.deliv + ".", "Cover: " + st.info + ".", "Best sources: " + st.src + "."].concat(st.notes ? ["Watch out: " + st.notes] : []);
        x.todo = ["4 focus blocks of 25 minutes; log them in the Focus log."].concat(gs.map(function (g) { return "Close gap " + g.id + " (" + g.pri + "): " + g.gap + ". " + (g.how || ""); })).concat(["Search: " + str[0] + " → " + str[1]]);
        x.out = "Progress on the " + st.deliv.toLowerCase() + ", with sources logged in the Evidence log."; x.q = "What did I find today that changes my picture of Ghana's carbon market?";
        x.links = [["Steps", "#tracker-steps"], ["Gaps", "#tracker-gaps"], ["Evidence log", "#tracker-evidence"], ["Research page", "research.html"]]; break;
      }
      case "learn": case "learn-pm": case "learn-sun": {
        var lid = b.id === "learn-sun" ? "sun" : b.id === "learn-pm" ? lessonId(d, dow === 2 ? "stv" : "sen") : lessonId(d);
        var lt = LESSON[lid] || (lid === "sun" ? "Leadership & reflection" : "Today's lesson");
        x.title = b.t.replace(/^📚 Learn( \(afternoon\))?: /, "📚 ").replace(/^🌱 Learn: /, "🌱 ") + " · " + lt; x.goal = lid === "sun" ? "Step back: what kind of leader and founder are you becoming?" : "Understand \u201c" + lt + "\u201d well enough to explain it to a funder.";
        x.pts = lid === "sun" ? ["Watch the Sunday talk on the Learning page.", "Look back at the week: wins, lessons, next week's focus.", "Rest is part of the plan."] : ["Open the lesson: video, reading and key terms.", "Connect it to James Town and the Chorkor vs Ahotor pilot.", "Take the 3-question quiz; the platform schedules your revision."];
        x.todo = lid === "sun" ? ["Watch the talk (20 min).", "Write this week's reflection in the tracker.", "Choose next week's one big goal."] : ["Watch and read (25 min).", "Do the quiz (5 min).", "Write your 3 sentences and save them to your notes doc (10 min)."];
        x.out = lid === "sun" ? "A written weekly reflection." : "Quiz done and 3 sentences saved."; x.q = lid === "sun" ? "What am I most grateful for this week, and what will I change?" : "How would I explain \u201c" + lt + "\u201d to a fish processor in two sentences?";
        x.links = [["Open the lesson", "#" + lid]].concat(lid === "sun" ? [["Weekly reflection", "#tracker-reflect"]] : [["Notes Google Doc", NOTES_DOC]]); break;
      }
      case "deep": x.goal = "One piece of meaningful Carbon Clarity work finished, not just started."; x.pts = ["Choose the single most important task from the work plan before you begin.", "Phone away, notifications off, door closed.", "Write first, edit later."]; x.todo = ["Pick one task from the work plan.", "4 focus blocks of 25 minutes with 5-minute breaks.", "Log the sessions in the Focus log."]; x.out = "A finished section, analysis or draft."; x.q = "What did I finish today that moves Carbon Clarity forward?"; x.links = [["Work plan", "workplan.html"], ["Focus timer", "focus.html"], ["Focus log", "#tracker-focus"]]; break;
      case "plan": x.goal = "Start the week knowing your three priorities."; x.pts = ["Check deadlines in the work plan and the research tracker.", "Pick three outcomes for the week, not ten tasks.", "Block time for each in the calendar."]; x.todo = ["Open the work plan and review last week.", "Write this week's top 3.", "Check the research step due this week."]; x.out = "Three weekly priorities written down."; x.q = "If I only finish three things this week, which three matter most?"; x.links = [["Work plan", "workplan.html"], ["Research steps", "#tracker-steps"]]; break;
      case "tasks": x.goal = "Clear communication and admin without losing the day."; x.pts = ["Batch emails and messages; don't keep the inbox open.", "Every meeting should end with a decision or next step.", "Reply to partners and the team first."]; x.todo = ["Process the inbox to zero or to a short list.", "Note decisions and owners from any meeting.", "Send one follow-up that moves a partnership forward."]; x.out = "Inbox handled and decisions noted."; x.q = "Which conversation today mattered most?"; x.links = [["Work plan", "workplan.html"]]; break;
      case "field": x.goal = "Collect clean, complete field data the same day."; x.pts = ["Record data on the day; memory fades by tomorrow.", "Check consent, IDs and units before you leave a site.", "Photos and notes are evidence for auditors later."]; x.todo = ["Prepare forms, scales and sensors before leaving.", "Collect and check data on site.", "Upload or type up today's data before wrap-up."]; x.out = "Today's field data saved and checked."; x.q = "Is anything missing that I would need for an audit?"; x.links = [["Pilot page", "pilot.html"], ["Work plan", "workplan.html"]]; break;
      case "wrap": x.goal = "Close the day cleanly so tomorrow starts fast."; x.pts = ["Update task status in the work plan.", "Log focus sessions and tick finished sessions here.", "Write tomorrow's top 3 before you leave."]; x.todo = ["Update the work plan.", "Log today's focus.", "Copy today's summary (below the timetable) into your notes."]; x.out = "Work plan updated and tomorrow's top 3 written."; x.q = "What is the first thing I'll do tomorrow?"; x.links = [["Work plan", "workplan.html"], ["Focus log", "#tracker-focus"]]; break;
      case "review": x.goal = "See what moved this week and set up next week."; x.pts = ["Compare what you planned on Monday with what happened.", "Celebrate wins, however small.", "Carry unfinished work forward on purpose."]; x.todo = ["Read this week's summary (Timetable page).", "Write the weekly reflection.", "Update research step statuses."]; x.out = "Weekly reflection written."; x.q = "What moved, what stalled, and why?"; x.links = [["Weekly reflection", "#tracker-reflect"], ["Steps", "#tracker-steps"]]; break;
      case "lunch": x.goal = "Rest and refuel."; x.pts = ["Step away from the screen.", "Eat well; a short walk helps the afternoon."]; x.todo = ["Take the full hour."]; x.out = "Rested."; x.q = ""; break;
      case "church": x.goal = "Worship and community."; x.pts = ["Be fully present.", "Notice one message to carry into the week."]; x.todo = ["Note one thing to reflect on this evening."]; x.out = ""; x.q = ""; break;
      default: x.goal = /prayer/i.test(b.t) ? "Quiet time to start and end the day grounded." : ""; x.pts = /Morning prayer/.test(b.t) ? ["Pray, then look at today's plan below."] : /Evening/.test(b.t) ? ["Give thanks for the day.", "Glance at tomorrow's first block."] : []; x.out = ""; x.q = "";
    }
    return x;
  }
  function majorIds() { return ["research", "skill", "learn", "learn-pm", "learn-sun", "deep", "plan", "field", "review", "video"]; }
  function dk(d) { return iso(d); }
  function note(d, id) { return (S.notes[dk(d)] || {})[id] || ""; }
  function isDone(d, id) { return !!(S.done[dk(d)] || {})[id]; }
  var WHO = "I'm Pout Chop Jal, founder of Carbon Clarity in Accra, Ghana (clean fish-smoking ovens with women processors in James Town, sensors and digital MRV, and carbon credits with benefit-sharing). I'm also researching current trends in Ghana's carbon market.";
  function askPrompt(x, d) {
    return WHO + "\n\nI'm about to start this session on " + d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) + " (" + x.time + "): " + x.title + ".\nGoal: " + x.goal +
      (x.pts.length ? "\nKey points: " + x.pts.join(" ") : "") + (x.out ? "\nOutput I need: " + x.out : "") +
      "\n\nSummarise everything I need for this session in plain English: the 3 to 5 key ideas, a minute-by-minute plan, a worked example from James Town where it helps, common mistakes to avoid, and one question to check myself. Keep it under 350 words.";
  }
  function claudeUrl(p) { return "https://claude.ai/new?q=" + encodeURIComponent(p.slice(0, 1800)); }
  function aiBtns(p, small) {
    var c = small ? " small" : "";
    return '<a class="btn pri' + c + '" target="_blank" rel="noopener" href="' + claudeUrl(p) + '">✨ Ask AI to brief me</a><button class="btn' + c + '" data-copy="' + esc(p) + '">Copy prompt</button><a class="btn' + c + '" target="_blank" rel="noopener" href="' + TUTOR + '">AI tutor ↗</a>';
  }
  function briefHtml(x, d, opts) {
    opts = opts || {}; var key = dk(d) + "|" + x.id;
    var h = '<div class="brief">' + (x.goal ? '<p><b>Goal:</b> ' + esc(x.goal) + "</p>" : "") +
      (x.pts.length ? '<p class="eyebrow">What you need to know</p><ul>' + x.pts.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>" : "") +
      (x.todo.length ? '<p class="eyebrow">What to do</p><ol>' + x.todo.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ol>" : "") +
      (x.out ? '<p><b>Output:</b> ' + esc(x.out) + "</p>" : "") + (x.q ? '<p><b>Check yourself:</b> <i>' + esc(x.q) + "</i></p>" : "");
    if (x.links.length) h += '<div class="row">' + x.links.map(function (l) { var ext = /^https?:/.test(l[1]); return '<a class="btn small" href="' + esc(l[1]) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + esc(l[0]) + (ext ? " ↗" : "") + "</a>"; }).join("") + "</div>";
    if (majorIds().indexOf(x.id) >= 0 && !opts.noAi) h += '<div class="row">' + aiBtns(askPrompt(x, d), true) + "</div>";
    if (!opts.noNotes && x.id && majorIds().concat(["tasks", "wrap"]).indexOf(x.id) >= 0) h += '<label class="snote"><span>Session notes (what you did, learned, still need)</span><textarea data-note="' + key + '" placeholder="Type as you go. It saves itself and goes into today\'s summary.">' + esc(note(d, x.id)) + '</textarea></label><label class="sdone"><input type="checkbox" data-done="' + key + '"' + (isDone(d, x.id) ? " checked" : "") + "> Session done (+3 XP)</label>";
    return h + "</div>";
  }
  function wireBriefs(root, again) {
    root = root || document;
    Array.prototype.forEach.call(root.querySelectorAll("[data-note]"), function (el) { var t; el.oninput = function () { clearTimeout(t); t = setTimeout(function () { var p = el.dataset.note.split("|"); S.notes[p[0]] = S.notes[p[0]] || {}; S.notes[p[0]][p[1]] = el.value; save(); var s = document.getElementById("daysum"); if (s) s.value = daySummary(pd(p[0])); }, 500); }; });
    Array.prototype.forEach.call(root.querySelectorAll("[data-done]"), function (el) { el.onchange = function () { var p = el.dataset.done.split("|"); S.done[p[0]] = S.done[p[0]] || {}; S.done[p[0]][p[1]] = el.checked ? 1 : 0; save(el.checked ? "Session done: +3 XP" : "Saved"); if (again) again(); }; });
    Array.prototype.forEach.call(root.querySelectorAll("[data-copy]"), function (el) { el.onclick = function () { copyText(el.dataset.copy, "Copied. Paste it into Claude or the AI tutor."); }; });
    Array.prototype.forEach.call(root.querySelectorAll("[data-copyfrom]"), function (el) { el.onclick = function () { var s = document.getElementById(el.dataset.copyfrom); if (s) copyText(s.value, "Summary copied"); }; });
  }
  function copyText(t, msg) {
    function fb() { var a = document.createElement("textarea"); a.value = t; a.style.position = "fixed"; a.style.opacity = "0"; document.body.appendChild(a); a.select(); try { document.execCommand("copy"); toast(msg); } catch (e) { toast("Select the text and copy it"); } a.remove(); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { toast(msg); }, fb); else fb();
  }
  /* "Today you need..." digest */
  function digest(d, opts) {
    opts = opts || {}; d = d || today();
    var bl = plan(d).filter(function (b) { return majorIds().indexOf(b.id) >= 0; }).map(function (b) { return brief(b, d); });
    var cur = nowNext(), live = dk(d) === dk(today());
    var dayP = WHO + "\n\nHere is my plan for " + d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) + ":\n" + bl.map(function (x) { return "- " + x.time + " " + x.title + ". Goal: " + x.goal + (x.out ? " Output: " + x.out : ""); }).join("\n") +
      "\n\nGive me a short briefing for the day: what matters most, what I need to prepare, how the sessions connect, and the one thing I must not skip. Under 300 words.";
    var h = '<div class="card digest"><p class="eyebrow">' + (live ? "Today you need" : "On " + d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" }) + " you need") + "</p>" +
      (bl.length ? '<ul class="dg">' + bl.map(function (x) {
        var on = live && cur.now.some(function (b) { return b.id === x.id; }), dn = isDone(d, x.id);
        return '<li class="' + x.k + (on ? " on" : "") + (dn ? " dn" : "") + '"><span class="tm">' + x.time + '</span><div><a href="#tracker-time" data-open="' + x.id + '"><b>' + esc(x.title) + "</b></a>" + (dn ? " " + pill("✓ done") : on ? " " + pill("now") : "") + '<div class="small">' + esc(x.goal) + (x.out ? " <b>Output:</b> " + esc(x.out) : "") + "</div></div></li>";
      }).join("") + "</ul>" : '<p class="small">A rest day. Nothing scheduled beyond prayer.</p>') +
      '<div class="row">' + aiBtns(dayP) + (opts.full ? "" : '<a class="btn" href="#tracker-time">Full timetable & session briefs</a>') + "</div></div>";
    return h;
  }
  function wireDigest(root, again) { Array.prototype.forEach.call((root || document).querySelectorAll("[data-open]"), function (el) { el.addEventListener("click", function () { OPEN = el.dataset.open; }); }); wireBriefs(root, again); }
  var OPEN = null;
  /* Daily and weekly summaries built from your notes, ticks, videos and focus log */
  function daySummary(d) {
    var k = dk(d), bl = plan(d).filter(function (b) { return majorIds().concat(["tasks", "wrap"]).indexOf(b.id) >= 0; }), lines = [];
    lines.push("Carbon Clarity daily summary: " + d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    var done = bl.filter(function (b) { return isDone(d, b.id); }), fl = S.focus.filter(function (f) { return f.date === k; }), fs = fl.reduce(function (a, f) { return a + (+f.sess || 0); }, 0);
    lines.push("Sessions done: " + done.length + " of " + bl.length + (fs ? " · focus: " + fs + " x 25 min" : "") + (S.vids[k] ? " · growth video watched" : ""));
    bl.forEach(function (b) { var x = brief(b, d), n = note(d, b.id).trim(); if (n || isDone(d, b.id)) lines.push("\n" + (isDone(d, b.id) ? "✓ " : "• ") + x.time + " " + x.title + (n ? "\n  " + n.replace(/\n/g, "\n  ") : "")); });
    fl.forEach(function (f) { if (f.task || f.notes) lines.push("\nFocus log: " + (f.task || "") + (f.notes ? " — " + f.notes : "")); });
    var nx = D && curStep(d); if (nx) lines.push("\nResearch next: Step " + nx.n + " " + nx.task + " (due " + fd(nx.due) + ")");
    var tm = new Date(d); tm.setDate(tm.getDate() + 1); var tb = plan(tm).filter(function (b) { return majorIds().indexOf(b.id) >= 0; })[0]; if (tb) lines.push("Tomorrow starts with: " + tb.s + " " + brief(tb, tm).title);
    return lines.join("\n");
  }
  function weekSummary(d) {
    var m = monday(d), out = ["Carbon Clarity weekly summary: week of " + m.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })], tot = 0, dn = 0, vids = 0, fs = 0;
    for (var i = 0; i < 7; i++) { var x = new Date(m); x.setDate(x.getDate() + i); if (x > today()) break; var k = dk(x), bl = plan(x).filter(function (b) { return majorIds().concat(["tasks", "wrap"]).indexOf(b.id) >= 0; });
      tot += bl.length; var dd = bl.filter(function (b) { return isDone(x, b.id); }); dn += dd.length; if (S.vids[k]) vids++; S.focus.forEach(function (f) { if (f.date === k) fs += +f.sess || 0; });
      var ns = bl.map(function (b) { var n = note(x, b.id).trim(); return n ? "  - " + brief(b, x).title + ": " + n.replace(/\n/g, " ") : ""; }).filter(Boolean);
      if (ns.length || dd.length) out.push("\n" + x.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" }) + " (" + dd.length + " of " + bl.length + " sessions done)" + (ns.length ? "\n" + ns.join("\n") : "")); }
    out.splice(1, 0, "Sessions done: " + dn + " of " + tot + " · focus: " + Math.round(fs * 25 / 6) / 10 + " h · growth videos: " + vids);
    var s = stats(); out.push("\nResearch: " + Math.round(s.progress * 100) + "% · " + s.stepsDone + " of " + D.steps.length + " steps · " + s.gapsOpen + " gaps open · " + s.read + " papers read · Level " + s.level + " (" + s.xp + " XP)");
    return out.join("\n");
  }
  function summaryCard(d) {
    var ds = daySummary(d), ws = weekSummary(d);
    var dp = WHO + "\n\nHere are my notes from today. Summarise them as: 1) what I achieved, 2) what I learned (key ideas in plain English), 3) what is still open, 4) my top 3 for tomorrow. Be concise.\n\n" + ds;
    var wp = WHO + "\n\nHere is my week. Write my weekly review: wins, lessons, what slipped and why, and three priorities for next week. Then suggest one improvement to my routine. Be concise.\n\n" + ws;
    return '<div class="card"><p class="eyebrow">Summaries from your session notes</p><h2>' + (dk(d) === dk(today()) ? "Today's" : "This day's") + ' summary</h2><textarea id="daysum" class="sumbox" readonly>' + esc(ds) + '</textarea>' +
      '<div class="row"><button class="btn" data-copyfrom="daysum">Copy</button><a class="btn pri" target="_blank" rel="noopener" href="' + claudeUrl(dp) + '">✨ AI: summarise my day</a><a class="btn" target="_blank" rel="noopener" href="' + TUTOR + '#notes">Save notes to Google Doc ↗</a></div>' +
      '<details style="margin-top:14px"><summary><b>This week\'s summary</b></summary><textarea id="wksum" class="sumbox" readonly>' + esc(ws) + '</textarea><div class="row"><button class="btn" data-copyfrom="wksum">Copy</button><a class="btn pri" target="_blank" rel="noopener" href="' + claudeUrl(wp) + '">✨ AI: write my weekly review</a><a class="btn" href="#tracker-reflect">Weekly reflection</a></div></details></div>';
  }
  var BCSS = '<style id="briefcss">.brief{margin-top:10px;padding-top:10px;border-top:1px dashed var(--line);font-size:15px}.brief ul,.brief ol{margin:4px 0 10px;padding-left:20px}.brief li,.agenda .brief li{display:list-item;margin:2px 0;padding:0;border:0;background:none;border-radius:0;outline:0}.brief .eyebrow{margin:8px 0 2px}.btn.small{font-size:13.5px;padding:5px 12px}' +
    '.agenda li.blk{display:block;padding:0}.agenda details>summary{display:grid;grid-template-columns:110px 1fr auto;gap:10px;padding:8px 12px;cursor:pointer;list-style:none;align-items:center}.agenda details>summary::-webkit-details-marker{display:none}.agenda details>summary::after{content:"▾";color:var(--muted)}.agenda details[open]>summary::after{content:"▴"}.agenda details .brief{margin:0 12px 12px}.agenda li.dn summary>span:nth-child(2)::after{content:" ✓";color:var(--ok);font-weight:700}' +
    '.snote{display:grid;gap:4px;margin-top:10px;font-size:13px;color:var(--muted)}.snote textarea,.sumbox{font:inherit;font-size:14px;width:100%;min-height:70px;padding:8px 10px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink)}.sumbox{min-height:170px;margin-top:8px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px}.sdone{display:flex;gap:8px;align-items:center;margin-top:8px;font-weight:600;font-size:14px}' +
    '.dg{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:6px}.dg li{display:grid;grid-template-columns:96px 1fr;gap:10px;padding:8px 12px;border:1px solid var(--line);border-left:5px solid var(--line);border-radius:10px;background:var(--card)}.dg .tm{font-variant-numeric:tabular-nums;font-weight:700;color:var(--muted);font-size:14px}.dg li.research{border-left-color:#0F7C72}.dg li.skill{border-left-color:#B4561D}.dg li.video{border-left-color:#D9A441}.dg li.learn{border-left-color:#6A3D9A}.dg li.deep{border-left-color:#1E5AA8}.dg li.on{outline:2px solid var(--accent)}.dg li.dn{opacity:.65}.dg a{text-decoration:none;color:var(--ink)}.nnb{margin-top:8px;font-size:14px}@media(max-width:600px){.dg li{grid-template-columns:1fr}.agenda details>summary{grid-template-columns:1fr auto;gap:2px 10px}.agenda details>summary .tm{grid-column:1/-1}}</style>';
  function css() { return (document.getElementById("trkcss") ? "" : CSS) + (document.getElementById("briefcss") ? "" : BCSS); }

  /* ---------- Revision page panel ---------- */
  function panel(el) {
    load();
    if (!D) { fetch(BASE + "data/tracker.json").then(function (r) { return r.json(); }).then(function (j) { D = j; panel(el); }).catch(function () {}); return; }
    if (!LIT) { el.innerHTML = '<div class="card"><p class="hint">Loading your research revision…</p></div>'; fetch(BASE + "data/literature.json").then(function (r) { return r.json(); }).then(function (j) { LIT = j; panel(el); }).catch(function () { LIT = { rows: [] }; panel(el); }); return; }
    var s = stats(), nx = s.next;
    var gs = gapsAll().filter(function (g) { return gapStatus(g) !== "Closed"; }).sort(function (a, b) { var pr = { High: 0, Medium: 1, Low: 2 }; return (pr[a.pri] - pr[b.pri]) || ((a.step || 9) - (b.step || 9)); }).slice(0, 3);
    var papers = []; LIT.rows.forEach(function (r, i) { if (r[0] === "C" && litRead(i) === "To read") papers.push(i); });
    papers.sort(function (a, b) { var A = LIT.rows[a], B = LIT.rows[b]; return ((B[2] === "G") - (A[2] === "G")) || (B[7] - A[7]); }); papers = papers.slice(0, 3);
    var evs = evAll().filter(function (e) { return evVer(e) !== "Yes"; }).slice(0, 2);
    var h = css() +
      '<div class="card"><p class="eyebrow">Ghana carbon market research</p><h2>Research revision</h2>' +
      '<p class="small" style="margin:4px 0 8px">Level ' + s.level + " · " + esc(s.title) + " · " + s.xp.toLocaleString() + " XP" + (s.nextXp ? " (" + (s.nextXp - s.xp) + " to level " + (s.level + 1) + ")" : "") + " · streak " + s.streak + " day" + (s.streak === 1 ? "" : "s") + "</p>" + bar(s.toNext) +
      '<div class="kpis" style="margin-top:14px">' + kpi(Math.round(s.progress * 100) + "%", "research progress") + kpi(s.overdue, "overdue steps", s.overdue > 0) + kpi(s.read, "papers read") + kpi(s.gapsOpen, "gaps open", s.gapsOpen > 0) + "</div>" +
      (nx ? '<p style="margin-top:14px"><b>Next step:</b> Step ' + nx.n + ": " + esc(nx.task) + " · due " + fd(nx.due) + " " + flagPill(stepFlag(nx)) + "</p>" : "<p style=\"margin-top:14px\"><b>All research steps done.</b></p>") +
      "<h3 style=\"margin-top:16px\">Close a gap today</h3>" + (gs.length ? '<ul class="clean">' + gs.map(function (g) { return '<li style="display:block;padding:10px 0;border-bottom:1px solid var(--line)"><b>' + esc(g.gap) + '</b> ' + pill(g.pri, g.pri === "High") + '<div class="small">' + esc(g.how || "") + (g.where ? " · " + esc(g.where) : "") + '</div><div class="row" style="margin-top:6px"><button class="btn" data-pclose="' + esc(g.id) + '">Mark closed (+20 XP)</button></div></li>'; }).join("") + "</ul>" : '<p class="empty">No open gaps. Excellent.</p>') +
      "<h3 style=\"margin-top:16px\">Read next</h3>" + (papers.length ? '<ul class="clean">' + papers.map(function (i) { var r = LIT.rows[i]; return '<li style="display:block;padding:10px 0;border-bottom:1px solid var(--line)"><a href="' + esc(r[10] || r[9]) + '" target="_blank" rel="noopener"><b>' + esc(r[4]) + '</b></a><div class="small">' + esc(r[5]) + " · " + r[3] + (r[2] === "G" ? " · Ghana" : "") + '</div><div class="row" style="margin-top:6px"><button class="btn" data-pread="' + i + '">Mark read (+10 XP)</button></div></li>'; }).join("") + "</ul>" : '<p class="empty">You have read every core paper.</p>') +
      (evs.length ? "<h3 style=\"margin-top:16px\">Verify a fact</h3><ul class=\"clean\">" + evs.map(function (e) { return '<li style="display:block;padding:10px 0;border-bottom:1px solid var(--line)">' + esc(e.claim) + ' <span class="pill">' + esc(evVer(e)) + '</span><div class="small">' + esc(e.check || "") + "</div></li>"; }).join("") + "</ul>" : "") +
      '<div class="row"><a class="btn pri" href="#tracker">Open research tracker</a><a class="btn" href="#tracker-focus">Log today\'s focus</a><a class="btn" href="#tracker-evidence">Evidence log</a></div></div>';
    h = css() + '<div class="card"><p class="eyebrow">Your day</p>' + nnHtml() + '</div>' + digest(today()) + h.slice(css().length) + videoCard(today(), true);
    el.innerHTML = h; wireDigest(el, function () { panel(el); });
    wireVid(el, function () { panel(el); });
    Array.prototype.forEach.call(el.querySelectorAll("[data-pclose]"), function (b) { b.onclick = function () { S.gaps[b.dataset.pclose] = { status: "Closed" }; save("Gap closed: +20 XP"); panel(el); }; });
    Array.prototype.forEach.call(el.querySelectorAll("[data-pread]"), function (b) { b.onclick = function () { var i = b.dataset.pread; S.lit[i] = S.lit[i] || {}; S.lit[i].s = "Read"; S.lit[i].c = 1; save("Paper read: +10 XP"); panel(el); }; });
  }
  var VIEWS = { "tracker": dashboard, "tracker-time": function () { timetable(0); }, "tracker-steps": steps, "tracker-evidence": function () { evidence(); }, "tracker-gaps": gaps, "tracker-lit": lit, "tracker-sites": function () { sites(); }, "tracker-dirs": dirs, "tracker-focus": focus, "tracker-reflect": reflect, "tracker-growth": growth, "tracker-backup": backup };
  function show(id) {
    load();
    if (!D) { render('<div class="card"><p>Loading your research tracker…</p></div>', "tracker"); fetch(BASE + "data/tracker.json").then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) { D = j; show(id); }).catch(function () { render('<div class="card"><h1>Research tracker</h1><p>The tracker could not load. Check your connection and refresh the page.</p></div>', "tracker"); }); return; }
    (VIEWS[id] || dashboard)();
  }
  function todayCard(el) {
    load();
    if (!D) { fetch(BASE + "data/tracker.json").then(function (r) { return r.json(); }).then(function (j) { D = j; todayCard(el); }).catch(function () {}); return; }
    el.innerHTML = css() + '<div class="card"><p class="eyebrow">Your day · <a href="#tracker-time">timetable & session briefs</a></p>' + nnHtml() + "</div>" + digest(today());
    wireDigest(el, function () { todayCard(el); });
  }
  window.CCTracker = { show: show, panel: panel, today: todayCard };
})();
