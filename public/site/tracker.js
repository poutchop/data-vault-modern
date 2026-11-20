/* Carbon Clarity Learning: Ghana carbon market research tracker.
   Loaded on demand by learning.html. Uses the page's helpers: render, esc, ls, lj, sj, toast, $.
   Everything you change is saved in this browser (localStorage key cc_trk_v1). Use Backup to move it between devices. */
(function () {
  if (window.CCTracker) return;
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
  var TABS = [["tracker", "Dashboard"], ["tracker-time", "Timetable"], ["tracker-ai", "AI coach"], ["tracker-pomo", "Time locker"], ["tracker-opps", "🎓 Opportunities"], ["tracker-alerts", "🔔 Notifications"], ["tracker-world", "🌍 World today"], ["tracker-cc", "🔥 Carbon Clarity HQ"], ["tracker-steps", "Steps"], ["tracker-evidence", "Evidence"], ["tracker-gaps", "Gaps"],
    ["tracker-lit", "Literature"], ["tracker-sites", "Sites"], ["tracker-dirs", "Directions"], ["tracker-focus", "Focus log"],
    ["tracker-reflect", "Reflection"], ["tracker-growth", "My growth"], ["tracker-backup", "Backup"]];

  /* ---------- state ---------- */
  function load() { S = lj(KEY, null) || {}; ["steps", "ev", "gaps", "lit", "sites", "dirs", "skills", "outs", "rewards", "reflect", "vids"].forEach(function (k) { S[k] = S[k] || {}; }); S.focus = S.focus || []; S.notes = S.notes || {}; S.done = S.done || {}; S.addEv = S.addEv || []; S.addGaps = S.addGaps || []; S.goal = S.goal || 10; }
  function save(msg) { S.saved = new Date().toISOString(); sj(KEY, S); if (msg) toast(msg); try { if (D) bellUpdate(); } catch (e) {} }
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
    s.perfect = LIT ? perfectDays() : 0; s.chal = Object.keys(S.chal || {}).length; s.mis = 0; Object.keys(S.mis || {}).forEach(function (k) { s.mis += Object.keys(S.mis[k]).length; });
    s.vids = Object.keys(S.vids).filter(function (k) { return S.vids[k]; }).length;
    var st = streaks(); s.streak = st.current; s.best = st.best; s.hours = hours(); s.week = hours(monday(today()));
    s.ms = milestones(s); s.msDone = s.ms.filter(function (m) { return m.done; }).length;
    s.xpRows = [["Research steps completed", s.stepsDone, PTS.steps], ["Papers read", s.read, PTS.read], ["Core papers read (bonus)", s.coreRead, PTS.core],
      ["Evidence items fully verified", s.evYes, PTS.ev], ["Gaps closed", s.gapsClosed, PTS.gaps], ["Focus sessions (25 min)", s.sess, PTS.sess],
      ["Skill levels gained", s.lvls, PTS.lvl], ["Learning resources completed", s.resDone, PTS.res], ["Weekly reflections written", s.refl, PTS.refl],
      ["Career outputs completed", s.outsDone, PTS.outs], ["Growth videos watched", s.vids, 5], ["Sessions done (timetable)", s.sdone, 3], ["Perfect days (all goals met)", s.perfect, 20], ["Practical challenges done", s.chal, 10], ["Research missions completed", s.mis, 10], ["Milestones unlocked", s.msDone, PTS.ms]];
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
      ["First skill mastered", s.skillsAt, 1], ["Multi-skilled (3 skills)", s.skillsAt, 3], ["Reflective researcher (4 reflections)", s.refl, 4], ["Daily learner (20 growth videos)", s.vids, 20], ["Showing up (50 sessions done)", s.sdone, 50], ["Perfect week (5 perfect days)", s.perfect, 5], ["Public voice (3 outputs)", s.outsDone, 3]];
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
    var h = CSS + BCSS + CCSS + OCSS + NCSS + HQCSS + '<div class="card"><p class="eyebrow">Ghana carbon market research</p><h1>' + esc(title) + "</h1>" + (sub ? '<p class="sub">' + sub + "</p>" : "") + "</div>" + tabs(cur) + inner;
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
    h += miniToday(today());
    h += '<div class="card"><h2>Research progress</h2><div class="kpis" style="margin-top:12px">' +
      kpi(Math.round(s.progress * 100) + "%", "overall progress") + kpi(s.stepsDone + " of " + D.steps.length, "steps completed") +
      kpi(s.overdue, "overdue steps", s.overdue > 0) + kpi(s.soon, "due in next 3 days", s.soon > 0) +
      kpi(Math.max(0, Math.round((pd(s.final) - today()) / 864e5)), "days to final deadline (" + fd(s.final) + ")") +
      kpi(s.evN ? Math.round(s.evYes / s.evN * 100) + "%" : "0%", "evidence fully verified (" + s.evYes + "/" + s.evN + ")") +
      kpi(s.read, "papers read of " + (LIT ? LIT.rows.length.toLocaleString() : "1,499")) + kpi(s.gapsOpen, "gaps still open", s.gapsOpen > 0) +
      '</div><p style="margin-top:14px"><b>Next:</b> ' + next + "</p></div>";
    h += '<div class="card tw"><h2>Steps</h2><table class="tt"><tr><th>#</th><th>Task</th><th>Due</th><th>Status</th><th>Flag</th></tr>' +
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
    add("06:30", "06:50", "🙏 Morning prayer", "", "prayer");
    if (dow >= 1 && dow <= 5) {
      add("07:00", "07:45", "📚 Learn: " + MORNING[dow], "learn");
      if ((dow === 2 || dow === 4) && research) add("08:30", "10:30", "🌍 Ghana carbon market research (deep work)", "research");
      else add("08:30", "10:30", "Deep work: Carbon Clarity research and writing", "deep");
      if (dow === 2) { add("10:30", "11:30", "Project tasks and emails (before check-in)", "", "tasks"); add("11:30", "13:30", "🤝 Check-in meeting", "meet", "meeting"); add("13:30", "14:15", "Lunch break", "", "lunch"); add("14:15", "16:00", "Fieldwork, pilot and admin", "", "field"); add("16:00", "16:30", "📚 Learn (afternoon): Stove design & development", "learn", "learn-pm"); }
      else if (dow === 3) { add("10:30", "12:30", "Project tasks, emails and meetings", "", "tasks"); add("12:30", "13:30", "Lunch break", "", "lunch"); add("13:30", "15:15", "Fieldwork, pilot and admin", "", "field"); add("15:15", "16:00", "🤝 Check-in meeting", "meet", "meeting"); add("16:00", "16:30", "Follow-ups from the check-in", "", "followup"); }
      else if (dow === 4) { add("10:30", "12:30", "Project tasks, emails and meetings", "", "tasks"); add("12:30", "13:30", "Lunch break", "", "lunch"); add("13:30", "16:00", "Fieldwork, pilot and admin", "", "field"); add("16:00", "16:30", "📚 Learn (afternoon): Sensors, IoT & data", "learn", "learn-pm"); }
      else { add("10:30", "12:30", "Project tasks, emails and meetings", "", "tasks"); add("12:30", "13:30", "Lunch break", "", "lunch"); add("13:30", "16:30", "Fieldwork, pilot and admin", "", "field"); }
      add("16:30", "17:00", dow === 5 ? "Weekly review: what moved, what's next" : "Wrap up the day: update the work plan", "", dow === 5 ? "review" : "wrap");
      if (skills) { add("19:00", "19:15", "🎬 Growth video", "video"); add("19:15", "20:00", SKILLDAY[dow][0] + " " + SKILLDAY[dow][1], "skill"); }
      add("20:15", "21:45", "🌙 Evening deep work: " + (dow % 2 && research ? "write up your research" : dow % 2 ? "Carbon Clarity writing" : "Carbon Clarity project work"), "deep", "evening");
      if (dow % 2) add("21:45", "22:45", "📣 Yamale LinkedIn content", "yam", "yamale"); else add("21:45", "22:45", "🎓 Graduate applications", "grad", "grad");
      add("22:45", "23:30", "📄 Read today's papers", "", "papers");
      add("23:30", "23:45", "📝 Wrap up and plan tomorrow", "", "plantom");
    } else if (dow === 6) {
      add("10:00", "10:15", "🎬 Growth video", "video");
      add("10:15", "11:15", "🎤 Practice: explain this week's learning out loud", "skill");
      add("11:15", "13:00", "📚 Saturday learning: skill project and catch-up", "learn", "satlearn");
      add("13:00", "14:00", "Lunch break", "", "lunch");
      add("14:00", "15:30", "🌍 Saturday research: read and write up", "research", "satres");
      add("15:45", "17:00", "🎓 Graduate applications", "grad", "grad");
      add("20:00", "22:00", "🌙 Saturday evening deep work", "deep", "evening");
      add("22:00", "23:30", "🔁 Revision and catch-up", "", "revision");
      add("23:30", "23:45", "📝 Wrap up and plan tomorrow", "", "plantom");
    } else {
      add("08:00", "09:00", "🪞 Weekly reflection and plan the week", "", "sunplan");
      add("09:00", "09:45", "🌱 Learn: Leadership & reflection", "learn", "learn-sun");
      add("09:45", "10:00", "🎬 Growth video (light)", "video");
      add("10:00", "11:00", "📄 Sunday reading", "", "papers");
      add("11:30", "14:00", "⛪ Sunday prayers", "", "church");
    }
    add("23:45", "24:00", "🙏 Evening prayer, then sleep", "", "prayer");
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
    if (xb) cur += '<div class="nnb"><b>You need:</b> ' + esc(xb.goal) + (xb.out ? " <b>Output:</b> " + esc(xb.out) : "") + '<div class="row" style="margin-top:6px"><a class="btn small" href="#tracker-time" data-open="' + xb.id + '">Open session brief</a><button class="btn pri small" data-coach="' + esc(askPrompt(xb, d0)) + '">✨ Ask the coach</button></div></div>';
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
      case "satres": case "research": {
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
      case "meeting": x.goal = "A short, useful check-in: report, decide, unblock."; x.pts = ["Bring three things: done, next, blocked.", "Your daily summary (Timetable page) is a ready-made report.", "Write down every decision and who owns it."]; x.todo = ["Before: copy yesterday's and today's summary.", "During: note decisions and owners.", "After: add new tasks to the work plan."]; x.out = "Decisions and owners noted."; x.q = "What did we decide, and what do I own?"; x.links = [["Work plan", "workplan.html"], ["Timetable summary", "#tracker-time"]]; break;
      case "followup": x.goal = "Turn the check-in into action."; x.pts = ["Every decision becomes a task with an owner and a date.", "Send any promised follow-up today."]; x.todo = ["Add tasks to the work plan.", "Send follow-up messages."]; x.out = "Work plan updated."; x.q = "Did anything from the check-in change this week's priorities?"; x.links = [["Work plan", "workplan.html"]]; break;
      case "evening": { var res = d.getDay() % 2 && d <= RES_END && d.getDay() !== 6;
        x.goal = res ? "Write up today's research while it's fresh." : "Push one Carbon Clarity deliverable forward."; x.pts = res ? ["Turn notes into sentences for the report.", "Log every fact with its source in the Evidence log.", "Update or close a gap."] : ["Pick one deliverable: literature review fixes, pilot design, a proposal.", "Take the 15-minute break at 20:00 first.", "Use the Time locker: 3 focus blocks."];
        x.todo = ["3 focus blocks of 25 minutes.", res ? "Write one paragraph of findings." : "Finish one section or task.", "Note what's next in your session notes."]; x.out = res ? "One paragraph of findings, sources logged." : "One finished section or task."; x.q = "What did I finish tonight?"; x.links = res ? [["Evidence log", "#tracker-evidence"], ["Gaps", "#tracker-gaps"]] : [["Work plan", "workplan.html"], ["Time locker", "#tracker-pomo"]]; break; }
      case "yamale": { var yd = d.getDay(); x.goal = yd === 1 ? "Plan this week's Yamale LinkedIn posts." : yd === 3 ? "Write and design this week's posts." : "Polish, schedule and review results."; x.pts = ["Write for Yamale's audience: what problem do they have, what can Yamale do about it?", "One clear message per post, with a call to action.", "Use what worked last week: check reach, comments and clicks."];
        x.todo = yd === 1 ? ["Check last week's analytics.", "Pick 2–3 post ideas and the goal of each.", "Gather photos, facts and quotes."] : yd === 3 ? ["Draft the posts.", "Create the visuals.", "Ask the coach to tighten the copy."] : ["Final edit and proofread.", "Schedule the posts.", "Note one lesson for next week."];
        x.out = yd === 1 ? "A content plan for the week." : yd === 3 ? "Drafts and visuals ready." : "Posts scheduled."; x.q = "Who is this post for, and what should they do next?"; break; }
      case "grad": x.goal = "Move your graduate applications forward by one concrete step."; x.pts = ["Keep a simple tracker: programme, deadline, requirements, status.", "Your Carbon Clarity work and Ghana carbon market research are your story: use them in your statement.", "Ask referees early and give them a short brief."];
        x.todo = ["Pick one: shortlist programmes, draft a statement paragraph, update your CV, contact a referee, or research a scholarship.", "Do it in 2 focus blocks.", "Update your application tracker."]; x.out = "One application task finished and logged."; x.q = "What is the next deadline, and am I on track?"; x.links = [["My opportunities", "#tracker-opps"], ["Notifications", "#tracker-alerts"]]; break;
      case "papers": x.goal = "Read today's papers and log what matters."; x.pts = ["Read the abstract, conclusion, then the methods.", "One useful fact per paper goes into the Evidence log.", "Unread papers roll over to tomorrow."]; x.todo = ["Open the first paper from the Today page.", "Mark each one read (+XP).", "Log one fact per paper."]; x.out = "Today's papers read and logged."; x.q = "Which paper changed what I think?"; x.links = [["Today's papers", "#today"], ["Evidence log", "#tracker-evidence"]]; break;
      case "plantom": x.goal = "Close the day and set up tomorrow."; x.pts = ["Tick today's missions.", "Look at tomorrow's first block.", "Screens off by midnight."]; x.todo = ["Tick missions on the Today page.", "Write tomorrow's top 3."]; x.out = "Tomorrow's top 3 written."; x.q = "What's the first thing I'll do tomorrow?"; x.links = [["Today page", "#today"]]; break;
      case "satlearn": x.goal = "Finish this week's skill output and catch up."; x.pts = ["Finish the phase output from your weekday skill sessions.", "Catch up on any lesson you missed.", "Do your Revision quizzes."]; x.todo = ["45 min: finish one skill output.", "30 min: one missed lesson.", "20 min: Revision quizzes."]; x.out = "One skill output finished."; x.q = "Which skill moved most this week?"; x.links = [["Revision", "#revise"], ["My growth", "#tracker-growth"]]; break;
      case "sunplan": x.goal = "Reflect on the week and plan the next."; x.pts = ["Wins, lessons, what slipped and why.", "Check research and work-plan deadlines.", "Choose next week's top 3."]; x.todo = ["Write your weekly reflection.", "Check deadlines.", "Pick next week's top 3."]; x.out = "Reflection written and top 3 chosen."; x.q = "What's the one thing that would make next week a success?"; x.links = [["Weekly reflection", "#tracker-reflect"], ["Weekly summary", "#tracker-time"]]; break;
      case "revision": x.goal = "Lock in this week's learning."; x.pts = ["Revision quizzes first.", "Then unread papers that rolled over.", "Tidy your notes."]; x.todo = ["Do the Revision quizzes.", "Read one rolled-over paper.", "Tidy notes."]; x.out = "Quizzes done."; x.q = "What do I still find confusing?"; x.links = [["Revision", "#revise"]]; break;
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
  function majorIds() { return ["research", "satres", "skill", "learn", "learn-pm", "learn-sun", "satlearn", "deep", "evening", "yamale", "grad", "plan", "sunplan", "field", "review", "video"]; }
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
    return '<button class="btn pri' + c + '" data-coach="' + esc(p) + '">✨ Ask the coach</button><a class="btn' + c + '" target="_blank" rel="noopener" href="' + claudeUrl(p) + '">Open in Claude ↗</a>';
  }
  function briefHtml(x, d, opts) {
    opts = opts || {}; var key = dk(d) + "|" + x.id;
    var h = '<div class="brief">' + (x.goal ? '<p><b>Goal:</b> ' + esc(x.goal) + "</p>" : "") +
      (x.pts.length ? '<p class="eyebrow">What you need to know</p><ul>' + x.pts.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>" : "") +
      (x.todo.length ? '<p class="eyebrow">What to do</p><ol>' + x.todo.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ol>" : "") +
      (x.out ? '<p><b>Output:</b> ' + esc(x.out) + "</p>" : "") + (x.q ? '<p><b>Check yourself:</b> <i>' + esc(x.q) + "</i></p>" : "");
    if (x.links.length) h += '<div class="row">' + x.links.map(function (l) { var ext = /^https?:/.test(l[1]); return '<a class="btn small" href="' + esc(l[1]) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + esc(l[0]) + (ext ? " ↗" : "") + "</a>"; }).join("") + "</div>";
    if (majorIds().indexOf(x.id) >= 0 && !opts.noAi) h += '<div class="row">' + (x.id !== "video" ? '<button class="btn small" data-pomo="' + esc(x.title) + '">⏱ Start a focus block</button>' : "") + aiBtns(askPrompt(x, d), true) + "</div>";
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
      goalsHtml(d) + papersHtml(d) + '<p class="eyebrow" style="margin-top:12px">Sessions</p>' + (bl.length ? '<ul class="dg">' + bl.map(function (x) {
        var on = live && cur.now.some(function (b) { return b.id === x.id; }), dn = isDone(d, x.id);
        return '<li class="' + x.k + (on ? " on" : "") + (dn ? " dn" : "") + '"><span class="tm">' + x.time + '</span><div><a href="#tracker-time" data-open="' + x.id + '"><b>' + esc(x.title) + "</b></a>" + (dn ? " " + pill("✓ done") : on ? " " + pill("now") : "") + '<div class="small">' + esc(x.goal) + (x.out ? " <b>Output:</b> " + esc(x.out) : "") + "</div></div></li>";
      }).join("") + "</ul>" : '<p class="small">A rest day. Nothing scheduled beyond prayer.</p>') +
      '<div class="row">' + aiBtns(dayP) + (opts.full ? "" : '<a class="btn" href="#tracker-time">Full timetable & session briefs</a>') + "</div></div>";
    return h;
  }
  function wireDigest(root, again) { root = root || document; Array.prototype.forEach.call(root.querySelectorAll("[data-open]"), function (el) { el.addEventListener("click", function () { OPEN = el.dataset.open; }); }); wireBriefs(root, again); wireGoals(root, again || function () {}); }
  var OPEN = null;
  /* Daily and weekly summaries built from your notes, ticks, videos and focus log */
  function daySummary(d) {
    var k = dk(d), bl = plan(d).filter(function (b) { return majorIds().concat(["tasks", "wrap"]).indexOf(b.id) >= 0; }), lines = [];
    lines.push("Carbon Clarity daily summary: " + d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    var done = bl.filter(function (b) { return isDone(d, b.id); }), fl = S.focus.filter(function (f) { return f.date === k; }), fs = fl.reduce(function (a, f) { return a + (+f.sess || 0); }, 0);
    var pr = (S.pomo || {})[k]; if (pr && pr.n) lines.push("Pomodoro: " + pr.n + " focus block" + (pr.n === 1 ? "" : "s") + " (" + pr.mins + " min)" + (pr.dist ? ", " + pr.dist + " distraction" + (pr.dist === 1 ? "" : "s") + " noted" : ""));
    var sca = agScore(d); lines.push("Agenda: " + sca.done + " of " + sca.n + " tasks (" + sca.pct + "%) " + (sca.pct >= 60 ? "✅ above the 60% target" : "🔴 below the 60% target"));
    lines.push("Sessions done: " + done.length + " of " + bl.length + (fs ? " · focus: " + fs + " x 25 min" : "") + (S.vids[k] ? " · growth video watched" : ""));
    var G = goals(d); lines.push("Goals met: " + G.filter(function (g) { return g.done; }).length + " of " + G.length + (G.every(function (g) { return g.done; }) && G.length ? " (perfect day)" : "")); G.forEach(function (g) { lines.push("  " + (g.done ? "✓ " : "☐ ") + g.t); });
    if (LIT) { var tp = todaysPapers(d); if (tp.length) { lines.push("Papers (" + papersRead(d) + " of " + tp.length + " read):"); tp.forEach(function (i) { lines.push("  " + (litRead(i) === "Read" ? "✓ " : "☐ ") + LIT.rows[i][4] + " (" + LIT.rows[i][5] + ", " + LIT.rows[i][3] + ")"); }); } }
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
  function css() { return (document.getElementById("trkcss") ? "" : CSS) + (document.getElementById("briefcss") ? "" : BCSS) + (document.getElementById("coachcss") ? "" : CCSS) + (document.getElementById("oppcss") ? "" : OCSS); }

  /* ---------- Daily reading quota: specific papers assigned to each day ---------- */
  var STEPTHEMES = { 1: ["Ghana carbon market", "Climate policy and NDC"], 2: ["Ghana carbon market", "Climate policy and NDC", "Carbon pricing and ETS"], 3: ["Article 6 and Paris mechanisms", "African carbon markets", "Ghana carbon market"],
    4: ["Ghana carbon market", "Clean cooking", "Forest, REDD+ and cocoa"], 5: ["Benefit sharing, equity and gender", "Clean cooking"], 6: ["Voluntary carbon market and integrity", "Climate finance"],
    7: ["Benefit sharing, equity and gender", "Clean cooking", "Forest, REDD+ and cocoa"], 8: [], 9: ["Voluntary carbon market and integrity"] };
  var TIERN = { C: "Core", S: "Supporting", H: "Background" };
  var MKT = /carbon market|carbon credit|carbon offset|offsett?ing|article 6|itmo|paris agreement|carbon financ|redd|voluntary carbon|carbon pric|emissions? trading|cookstove|clean cooking|benefit.?shar|safeguard|mrv|verra|gold standard|integrity|additionality|corresponding adjustment|ndc/i;
  var STEPKW = { 1: /carbon market|policy|framework|ndc/i, 2: /regulat|legal|law|institution|framework|governance|policy|epa/i, 3: /article 6|itmo|bilateral|corresponding adjustment|paris|internationally transferred|switzerland|singapore|sweden/i,
    4: /project|registry|issuance|credits? (issued|volume)|cookstove|clean cooking|redd|cocoa|forest|sector/i, 5: /benefit.?shar|safeguard|equity|gender|communit|women|livelihood|consent/i, 6: /voluntary|private|developer|buyer|integrity|quality|over.?credit|corporate/i,
    7: /stakeholder|interview|perception|communit|participat/i, 8: /market|trend|review|outlook/i, 9: /integrity|verification|quality|over.?credit/i };
  function relevance(r, st) { var t = r[4] || ""; return (STEPKW[st] && STEPKW[st].test(t) ? 3 : 0) + (MKT.test(t) ? 2 : 0); }
  function quota(d) { var o = S.daily || {}, we = d.getDay() === 0 || d.getDay() === 6; return we ? (o.we != null ? +o.we : 1) : (o.wk != null ? +o.wk : 3); }
  function assigned() { var a = {}; Object.keys(S.rd || {}).forEach(function (k) { (S.rd[k] || []).forEach(function (i) { a[i] = k; }); }); return a; }
  function rankPapers(d, skip) {
    var st = curStep(d), th = STEPTHEMES[st ? st.n : 8] || [], tr = { C: 0, S: 1, H: 2 }, idx = [];
    LIT.rows.forEach(function (r, i) { if (!skip[i] && (litRead(i) === "To read" || litRead(i) === "Reading")) idx.push(i); });
    var sn = st ? st.n : 8, rel = {}; idx.forEach(function (i) { var r = LIT.rows[i]; rel[i] = relevance(r, sn) + (th.indexOf(r[1]) >= 0 ? 1 : 0); });
    idx.sort(function (a, b) { var A = LIT.rows[a], B = LIT.rows[b]; return (tr[A[0]] - tr[B[0]]) || (rel[b] - rel[a]) || ((B[2] === "G") - (A[2] === "G")) || (B[7] - A[7]); });
    return idx;
  }
  function todaysPapers(d) {
    if (!LIT || !LIT.rows.length) return [];
    var k = dk(d), t = dk(today()), n = quota(d); S.rd = S.rd || {};
    if (S.rdv !== 2) { S.rdv = 2; Object.keys(S.rd).forEach(function (x) { if (x >= t) S.rd[x] = S.rd[x].filter(function (i) { return litRead(i) === "Read"; }); }); }
    if (k < t) return S.rd[k] || [];
    var cur = (S.rd[k] || []).slice(), a = assigned();
    if (k > t) { if (cur.length) return cur; var sk = {}; Object.keys(a).forEach(function (i) { if (a[i] >= t) sk[i] = 1; }); return rankPapers(d, sk).slice(0, n); }
    var keep = cur.filter(function (i) { return litRead(i) === "Read"; }), rest = cur.filter(function (i) { return litRead(i) !== "Read" && litRead(i) !== "Not relevant"; });
    var list = keep.concat(rest).slice(0, Math.max(n, keep.length));
    if (list.length < n) { var sk2 = {}; Object.keys(a).forEach(function (i) { if (a[i] !== k && a[i] >= t) sk2[i] = 1; }); list.forEach(function (i) { sk2[i] = 1; }); list = list.concat(rankPapers(d, sk2).slice(0, n - list.length)); }
    if (JSON.stringify(list) !== JSON.stringify(cur)) { S.rd[k] = list; sj(KEY, S); }
    return list;
  }
  function papersRead(d) { return todaysPapers(d).filter(function (i) { return litRead(i) === "Read"; }).length; }
  function paperPrompt(r) { return "Help me read this paper efficiently. I only have its details, not the text: \"" + r[4] + "\" by " + r[5] + " (" + r[6] + ", " + r[3] + "), theme: " + r[1] + ". Based only on the title and details (don't invent findings), tell me: what it is probably about, why it matters for my Ghana carbon market research and Carbon Clarity, 3 questions to answer while reading it, and which sections to read first. Then remind me to log one sentence of evidence."; }
  function papersHtml(d) {
    if (!LIT) return '<p class="small">Loading today\'s papers…</p>';
    var L = todaysPapers(d), rd = papersRead(d), n = quota(d), live = dk(d) === dk(today()), past = dk(d) < dk(today());
    var core = 0, coreLeft = 0; LIT.rows.forEach(function (r, i) { if (r[0] === "C") { core++; if (litRead(i) !== "Read" && litRead(i) !== "Not relevant") coreLeft++; } });
    var wk = quota(new Date(2026, 10, 23)) * 5 + quota(new Date(2026, 10, 28)) * 2, days = coreLeft ? Math.ceil(coreLeft / Math.max(1, wk) * 7) : 0, fin = new Date(today()); fin.setDate(fin.getDate() + days);
    var h = '<div class="dpap"><p class="eyebrow">' + (live ? "Today's papers" : past ? "Papers that day" : "Papers planned") + " · " + rd + " of " + L.length + " read</p>" + bar(L.length ? rd / L.length : 0);
    h += L.length ? '<ul class="clean">' + L.map(function (i) { var r = LIT.rows[i], rr = litRead(i) === "Read";
      return '<li style="display:block;padding:9px 0;border-bottom:1px solid var(--line)"><a href="' + esc(r[10] || r[9]) + '" target="_blank" rel="noopener"><b>' + esc(r[4]) + "</b></a> " + pill(TIERN[r[0]] || r[0], r[0] === "C") + (r[2] === "G" ? " " + pill("Ghana") : "") + '<div class="small">' + esc(r[5]) + " · " + esc(r[6] || "") + " · " + r[3] + " · " + esc(r[1]) + (r[9] ? ' · <a href="' + esc(r[9]) + '" target="_blank" rel="noopener">free PDF</a>' : "") + "</div>" +
        '<div class="row" style="margin-top:6px">' + (rr ? pill("✓ Read") : '<button class="btn small" data-rdone="' + i + '">Mark read (+' + (PTS.read + (r[0] === "C" ? PTS.core : 0)) + " XP)</button>") + '<button class="btn small" data-coach="' + esc(paperPrompt(r)) + '">✨ AI reading guide</button></div></li>'; }).join("") + "</ul>" : '<p class="small">No papers set for this day.</p>';
    if (live) h += '<div class="row" style="margin-top:8px;align-items:center"><label class="small">Papers per weekday <select data-quota="wk">' + [1, 2, 3, 4, 5, 6, 8, 10].map(function (v) { return "<option" + (v === quota(new Date(2026, 10, 23)) ? " selected" : "") + ">" + v + "</option>"; }).join("") + '</select></label><label class="small">per weekend day <select data-quota="we">' + [0, 1, 2, 3, 4, 5].map(function (v) { return "<option" + (v === quota(new Date(2026, 10, 28)) ? " selected" : "") + ">" + v + "</option>"; }).join("") + "</select></label>" +
      '<span class="small">' + coreLeft + " of " + core + " core papers left" + (coreLeft ? " · at " + wk + " a week you finish them by " + fin.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "") + "</span></div>";
    return h + "</div>";
  }
  /* ---------- Daily goals ---------- */
  function focusSess(d) { var k = dk(d); return S.focus.reduce(function (a, f) { return a + (f.date === k ? +f.sess || 0 : 0); }, 0); }
  function goals(d) {
    var k = dk(d), dow = d.getDay(), G = [], bl = plan(d), n = quota(d);
    if (n) G.push({ k: "read", t: "Read " + n + " paper" + (n === 1 ? "" : "s") + " (" + papersRead(d) + "/" + n + ")", auto: 1, done: papersRead(d) >= n });
    bl.forEach(function (b) { if (["research", "satres", "skill", "learn", "learn-pm", "satlearn", "deep", "field", "plan", "review", "grad", "yamale", "sunplan"].indexOf(b.id) < 0) return; var x = brief(b, d);
      var t = b.id === "research" ? "Research: " + x.out : b.id === "skill" ? (dow === 6 ? "Practice: " : "Skill: ") + x.out : b.id === "learn" || b.id === "learn-pm" ? "Lesson: " + (x.title.split(" · ")[1] || "today's lesson") + ", quiz and 3 sentences" : b.id === "deep" ? "Deep work: " + x.out : b.id === "field" ? "Field: " + x.out : b.id === "plan" ? "Write this week's top 3" : b.id === "review" ? "Write the weekly review" : b.id === "satres" ? "Research: " + x.out : x.title.replace(/^\S+ /, "").split(":")[0] + ": " + x.out;
      G.push({ k: "blk:" + b.id, t: t, done: isDone(d, b.id), blk: b.id }); });
    if (bl.some(function (b) { return b.id === "research"; })) G.push({ k: "gap", t: "Close one research gap or verify one fact" });
    if (dow >= 1 && dow <= 5) G.push({ k: "focus", t: "4 focus sessions logged (" + focusSess(d) + "/4)", auto: 1, done: focusSess(d) >= 4 });
    if (videoFor(d) && bl.some(function (b) { return b.id === "video"; })) G.push({ k: "video", t: "Watch today's growth video", auto: 1, done: !!S.vids[k] });
    if (dow === 0) G.push({ k: "reflect", t: "Write this week's reflection", auto: 1, done: !!(S.reflect[iso(monday(d))] && (S.reflect[iso(monday(d))].wins || "").trim()) });
    var gd = (S.gdone || {})[k] || {};
    G.forEach(function (g) { if (!g.auto && !g.blk) g.done = !!gd[g.k]; });
    ((S.cgoals || {})[k] || []).forEach(function (c, i) { G.push({ k: "c" + i, t: c.t, done: !!c.done, custom: i }); });
    return G;
  }
  function goalsHtml(d) {
    var G = goals(d), dn = G.filter(function (g) { return g.done; }).length, k = dk(d), live = k === dk(today());
    return '<div class="dgoals"><p class="eyebrow">' + (live ? "Today's goals" : "Goals") + " · " + dn + " of " + G.length + (dn === G.length && G.length ? " · 🏆 perfect day (+20 XP)" : "") + "</p>" + bar(G.length ? dn / G.length : 0) +
      '<ul class="glist">' + G.map(function (g) { return '<li class="' + (g.done ? "ok" : "") + '"><label><input type="checkbox" data-goal="' + k + "|" + esc(g.k) + '"' + (g.done ? " checked" : "") + (g.auto ? " disabled" : "") + "> <span>" + esc(g.t) + "</span>" + (g.auto ? ' <span class="small">(updates itself)</span>' : "") + "</label>" + (g.custom != null ? ' <button class="lnk" data-gdel="' + k + "|" + g.custom + '" aria-label="Remove goal">✕</button>' : "") + "</li>"; }).join("") + "</ul>" +
      '<div class="row" style="margin-top:6px"><input class="gin" data-gnew="' + k + '" placeholder="Add your own goal for ' + (live ? "today" : "this day") + '…" maxlength="140"><button class="btn small" data-gadd="' + k + '">Add</button><button class="btn small pri" data-coach="Look at my goals for today and my timetable. Which order should I tackle them in, what is the one goal I must not skip, and is anything unrealistic? Be brief.">✨ Coach my goals</button></div></div>';
  }
  function perfectDays() { var c = 0; Object.keys(S.done || {}).concat(Object.keys(S.gdone || {}), Object.keys(S.rd || {})).filter(function (k, i, a) { return a.indexOf(k) === i && k < dk(today()) + "~"; }).forEach(function (k) { var G = goals(pd(k)); if (G.length && G.every(function (g) { return g.done; })) c++; }); return c; }
  function wireGoals(root, again) {
    function q(s, f) { Array.prototype.forEach.call(root.querySelectorAll(s), f); }
    q("[data-goal]", function (el) { el.onchange = function () { var p = el.dataset.goal.split("|"), k = p[0], g = p[1];
      if (g.indexOf("blk:") === 0) { S.done[k] = S.done[k] || {}; S.done[k][g.slice(4)] = el.checked ? 1 : 0; }
      else if (/^c\d+$/.test(g)) { S.cgoals[k][+g.slice(1)].done = el.checked; }
      else { S.gdone = S.gdone || {}; S.gdone[k] = S.gdone[k] || {}; S.gdone[k][g] = el.checked ? 1 : 0; }
      var all = goals(pd(k)).every(function (x) { return x.done; }); save(all ? "Perfect day! +20 XP" : el.checked ? "Goal done" : "Saved"); again(); }; });
    q("[data-gadd]", function (el) { el.onclick = function () { var k = el.dataset.gadd, inp = root.querySelector('[data-gnew="' + k + '"]'), t = (inp.value || "").trim(); if (!t) return; S.cgoals = S.cgoals || {}; (S.cgoals[k] = S.cgoals[k] || []).push({ t: t.slice(0, 140), done: false }); save("Goal added"); again(); }; });
    q("[data-gnew]", function (el) { el.onkeydown = function (e) { if (e.key === "Enter") { var b = root.querySelector('[data-gadd="' + el.dataset.gnew + '"]'); if (b) b.click(); } }; });
    q("[data-gdel]", function (el) { el.onclick = function () { var p = el.dataset.gdel.split("|"); S.cgoals[p[0]].splice(+p[1], 1); save("Goal removed"); again(); }; });
    q("[data-rdone]", function (el) { el.onclick = function () { var i = +el.dataset.rdone; S.lit[i] = S.lit[i] || {}; S.lit[i].s = "Read"; S.lit[i].c = LIT.rows[i][0] === "C" ? 1 : 0; save("Paper read: +" + (PTS.read + (LIT.rows[i][0] === "C" ? PTS.core : 0)) + " XP"); again(); }; });
    q("[data-quota]", function (el) { el.onchange = function () { S.daily = S.daily || {}; S.daily[el.dataset.quota] = +el.value; save("Daily reading target saved"); again(); }; });
  }
  /* ---------- Built-in AI coach (Vercel AI Gateway, no keys in the browser) ---------- */
  var AI_URL = window.CC_AI_URL || "/api/ai", COACH_BUSY = false;
  function md(s) { var lines = esc(s).split("\n"), out = "", list = null; function close() { if (list) { out += "</" + list + ">"; list = null; } }
    function b(x) { return x.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>"); }
    lines.forEach(function (l) { var t = l.trim(); if (/^#{1,4}\s+/.test(t)) { close(); out += "<h4>" + b(t.replace(/^#+\s+/, "")) + "</h4>"; } else if (/^[-*•]\s+/.test(t)) { if (list !== "ul") { close(); out += "<ul>"; list = "ul"; } out += "<li>" + b(t.replace(/^[-*•]\s+/, "")) + "</li>"; }
      else if (/^\d+[.)]\s+/.test(t)) { if (list !== "ol") { close(); out += "<ol>"; list = "ol"; } out += "<li>" + b(t.replace(/^\d+[.)]\s+/, "")) + "</li>"; } else if (!t) close(); else { close(); out += "<p>" + b(t) + "</p>"; } }); close(); return out; }
  function coachContext() {
    var d = today(), n = new Date(), s = stats(), nn = nowNext(), st = curStep(d), L = [];
    L.push("Now: " + n.toLocaleString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " (Accra).");
    L.push("Current block: " + (nn.now.length ? nn.now.map(function (b) { return b.s + "–" + b.e + " " + brief(b, d).title; }).join("; ") : "free time") + ". Next: " + (nn.next ? nn.next.s + " " + brief(nn.next, d).title : "nothing else today") + ".");
    L.push("\nTODAY'S TIMETABLE:"); plan(d).filter(function (b) { return majorIds().concat(["tasks", "wrap"]).indexOf(b.id) >= 0; }).forEach(function (b) { var x = brief(b, d); L.push("- " + x.time + " " + x.title + (isDone(d, b.id) ? " [DONE]" : "") + ". Goal: " + x.goal + (x.out ? " Output: " + x.out : "") + (note(d, b.id) ? " My notes: " + note(d, b.id).slice(0, 300) : "")); });
    var pq = (S.pomo || {})[dk(d)]; L.push("Pomodoro today: " + (pq ? pq.n + " focus blocks, " + pq.mins + " min, " + (pq.dist || 0) + " distractions" : "none yet") + (P && P.mode === "focus" ? ". Currently in a focus block on: " + P.label : P && (P.mode === "short" || P.mode === "long") ? ". Currently on a break" : "") + ".");
    try { L.push("\nTODAY'S MISSIONS (from his Today page):"); missions(d).forEach(function (m) { L.push("- [" + (m.done ? "x" : " ") + "] " + m.time + " " + m.kind + ": " + m.t + (m.how ? " — " + m.how : "") + (m.fin ? " Done when: " + m.fin : "")); }); var chx = challengeFor(d); L.push("Practical challenge: " + chx[0] + " — " + chx[1] + ((S.chal || {})[dk(d)] ? " [done]" : "")); } catch (e) {}
    L.push("\nTODAY'S GOALS:"); goals(d).forEach(function (g) { L.push("- [" + (g.done ? "x" : " ") + "] " + g.t); });
    if (LIT) { L.push("\nTODAY'S PAPERS:"); todaysPapers(d).forEach(function (i) { var r = LIT.rows[i]; L.push("- " + (litRead(i) === "Read" ? "[read] " : "") + r[4] + " — " + r[5] + ", " + r[6] + " " + r[3] + " (" + r[1] + ")"); }); }
    if (st) { L.push("\nRESEARCH (Ghana carbon market trends, due 15 Jan 2027): current step " + st.n + " '" + st.task + "', due " + fd(st.due) + ", status " + stepStatus(st) + ". Deliverable: " + st.deliv + ". Covers: " + st.info + ". Sources: " + st.src + (st.notes ? ". Note: " + st.notes : "") + ".");
      gapsAll().filter(function (g) { return gapStatus(g) !== "Closed" && g.pri === "High"; }).slice(0, 5).forEach(function (g) { L.push("- Open high-priority gap " + g.id + ": " + g.gap + " (how: " + (g.how || "") + ")"); }); }
    L.push("Steps: " + D.steps.map(function (x) { return x.n + ". " + x.task + " (" + stepStatus(x) + ", due " + x.due + ")"; }).join("; "));
    var dow = d.getDay(); if (SK[dow]) L.push("\nSKILLS PLAN (Mon data analysis, Tue financial analysis, Wed financial modelling, Thu business analysis, Fri public speaking; 19:00–19:45 until May 2027). Tonight: " + SK[dow].name + ", phase " + (phase(d) + 1) + " of 6: " + SK[dow].ph[phase(d)].t + ".");
    if (OPP && OPP.items) { L.push("\nGRADUATE OPPORTUNITIES (CGPA 2.3/4.0; looking at Canada, Germany, London):"); OPP.items.forEach(function (o) { L.push("- " + o.provider + ": " + o.title + " (" + o.city + "). Status: " + oppSt(o) + ". Deadline: " + (oppDl(o) || "none fixed") + ". Grade: " + o.grade); }); }
    if (NEWS && NEWS.sections) { L.push("\nTODAY'S WORLD BRIEFING (" + NEWS.updated + "):"); NEWS.sections.forEach(function (sec) { (sec.items || []).forEach(function (n) { L.push("- [" + sec.title + "] " + n.title + ": " + n.summary + " (" + n.source + ")"); }); }); (NEWS.good || []).forEach(function (n) { L.push("- [Good news] " + n.title + ": " + n.summary); }); }
    L.push("\nPROGRESS: level " + s.level + " (" + s.title + "), " + s.xp + " XP, streak " + s.streak + " days, research " + Math.round(s.progress * 100) + "%, " + s.overdue + " overdue steps, " + s.read + " papers read, " + s.gapsOpen + " gaps open, " + s.week + " focus hours this week (goal " + S.goal + ").");
    return L.join("\n").slice(0, 11000);
  }
  function coachHistory() { S.chat = S.chat || []; return S.chat; }
  function ensureCoach() {
    if (document.getElementById("ccCoach")) return;
    if (!document.getElementById("briefcss")) document.head.insertAdjacentHTML("beforeend", BCSS);
    var w = document.createElement("div"); w.id = "ccCoach";
    w.innerHTML = '<button class="cfab" aria-label="Open the AI coach">✨ Coach</button><div class="cdraw" role="dialog" aria-label="AI coach" hidden><div class="chead"><b>✨ Carbon Clarity Coach</b><span class="small">knows your plan, goals, papers and progress</span><button class="lnk cclose" aria-label="Close">✕</button></div><div class="clog"></div>' +
      '<div class="cchips"></div><form class="cform"><textarea rows="2" placeholder="Ask anything: brief me, explain a concept, quiz me, plan my evening…" maxlength="3000"></textarea><button class="btn pri">Send</button></form><div class="cfoot small"><button class="lnk cnew">New chat</button> · <a class="cext" target="_blank" rel="noopener" href="https://claude.ai/new">Open in Claude ↗</a></div></div>';
    document.body.appendChild(w);
    var fab = w.querySelector(".cfab"), dr = w.querySelector(".cdraw"), f = w.querySelector(".cform"), ta = f.querySelector("textarea");
    fab.onclick = function () { dr.hidden = !dr.hidden; var pd2 = document.querySelector("#ccPomo .pdraw"); if (pd2 && !dr.hidden) pd2.hidden = true; if (!dr.hidden) { drawLog(); ta.focus(); } };
    w.querySelector(".cclose").onclick = function () { dr.hidden = true; };
    w.querySelector(".cnew").onclick = function () { S.chat = []; save(); drawLog(); };
    f.onsubmit = function (e) { e.preventDefault(); var t = ta.value.trim(); if (t) { ta.value = ""; sendCoach(t); } };
    ta.onkeydown = function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); f.requestSubmit ? f.requestSubmit() : f.onsubmit(e); } };
    var chips = [["Brief me for now", "Brief me for the session I'm in right now (or the next one): key ideas, a minute-by-minute plan and the output."], ["Plan my day", "Look at my timetable, goals and papers for today and give me a realistic plan with the order to do things."], ["Summarise today", "Summarise my day from my notes and ticks: what I achieved, what I learned, what is still open, and my top 3 for tomorrow."], ["Quiz me", "Quiz me with 3 short questions on what I'm learning this week (lesson, skill and research). Wait for my answers before marking."], ["Research next step", "What exactly should I do next on my Ghana carbon market research? Be specific about sources and the deliverable."], ["Motivate me", "I'm losing focus. Give me a short, honest pep talk tied to my real progress and one tiny next action."]];
    var c = w.querySelector(".cchips"); chips.forEach(function (x) { var b = document.createElement("button"); b.className = "chip"; b.textContent = x[0]; b.onclick = function () { sendCoach(x[1]); }; c.appendChild(b); });
  }
  function drawLog() {
    var lg = document.querySelector("#ccCoach .clog"); if (!lg) return; var H = coachHistory();
    lg.innerHTML = H.length ? H.map(function (m) { return '<div class="cm ' + (m.role === "user" ? "me" : "ai") + '">' + (m.role === "user" ? esc(m.content) : md(m.content)) + "</div>"; }).join("") : '<div class="cm ai"><p>Hi Pout Chop. I can see today\'s timetable, your goals, your papers and your research progress. Ask me anything, or tap a button below.</p></div>';
    lg.scrollTop = lg.scrollHeight;
  }
  function openCoach(prompt) { ensureCoach(); var dr = document.querySelector("#ccCoach .cdraw"); dr.hidden = false; drawLog(); if (prompt) sendCoach(prompt); }
  function sendCoach(text) {
    if (COACH_BUSY) return; ensureCoach(); var H = coachHistory(), lg = document.querySelector("#ccCoach .clog");
    document.querySelector("#ccCoach .cdraw").hidden = false;
    H.push({ role: "user", content: text.slice(0, 3000) }); drawLog();
    lg.insertAdjacentHTML("beforeend", '<div class="cm ai think"><p>Thinking…</p></div>'); lg.scrollTop = lg.scrollHeight; COACH_BUSY = true;
    var ext = document.querySelector("#ccCoach .cext"); if (ext) ext.href = claudeUrl(WHO + "\n\n" + text);
    fetch(AI_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: H.slice(-12), context: coachContext() }) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw j; return j; }); })
      .then(function (j) { H.push({ role: "assistant", content: String(j.text || "").slice(0, 8000) }); if (H.length > 40) S.chat = H.slice(-40); save(); })
      .catch(function (e) { var msg = e && e.error === "gateway_403" ? "The coach is installed but not switched on yet. Vercel needs a card on file in your Vercel account to unlock its free AI credits (Vercel dashboard → AI Gateway → add card). Until then, tap **Open in Claude** below and your question opens there." : e && e.error === "rate" ? "You've asked a lot in a short time. Wait a few minutes and try again." : "The coach couldn't answer just now" + (e && e.error ? " (" + e.error + ")" : "") + ". Try again in a moment, or use 'Open in Claude' below."; H.push({ role: "assistant", content: msg, err: 1 }); })
      .then(function () { COACH_BUSY = false; S.chat = coachHistory().filter(function (m, i, a) { return !m.err || i === a.length - 1; }); drawLog(); });
  }
  function coachPage() {
    page("tracker-ai", '<div class="card"><h2>Your built-in AI coach</h2><p>The coach reads your live timetable, today\'s goals and papers, your session notes, your research step and gaps, and your XP. It is tailored to Carbon Clarity, James Town and your Ghana carbon market research. Tap <b>✨ Coach</b> (bottom right) on any page, or start here.</p><div class="row"><button class="btn pri" data-coach="Brief me for the session I\'m in right now (or the next one).">Brief me now</button><button class="btn" data-coach="Plan my day realistically from my timetable, goals and papers.">Plan my day</button><button class="btn" data-coach="Write my weekly review from this week\'s progress and notes, then give three priorities for next week.">Weekly review</button></div><p class="hint" style="margin-top:10px">Your chat stays in this browser. The coach runs on the Carbon Clarity site through Vercel AI Gateway (Claude Haiku), so there\'s nothing to sign in to.</p></div>', "AI coach", "An AI that knows your day, your goals and your research.");
    wireGoals(document, coachPage);
  }
  var CCSS = '<style id="coachcss">#ccCoach .cfab{position:fixed;right:16px;bottom:16px;z-index:60;border:0;border-radius:99px;padding:12px 18px;font-weight:700;font-size:15px;font-family:inherit;background:var(--accent);color:var(--accent-ink);box-shadow:0 6px 20px rgba(0,0,0,.18);cursor:pointer}' +
    '#ccCoach .cdraw{position:fixed;right:16px;bottom:72px;z-index:61;width:min(440px,calc(100vw - 32px));height:min(640px,calc(100vh - 100px));display:flex;flex-direction:column;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.22);overflow:hidden}#ccCoach .cdraw[hidden]{display:none}' +
    '#ccCoach .chead{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap;padding:12px 14px;border-bottom:1px solid var(--line);background:var(--soft)}#ccCoach .chead .cclose{margin-left:auto}#ccCoach .clog{flex:1;overflow:auto;padding:12px 14px;display:grid;gap:10px;align-content:start}' +
    '#ccCoach .cm{border-radius:12px;padding:9px 12px;font-size:14.5px;line-height:1.5;overflow-wrap:anywhere}#ccCoach .cm p{margin:0 0 6px}#ccCoach .cm ul,#ccCoach .cm ol{margin:0 0 6px;padding-left:20px}#ccCoach .cm h4{margin:6px 0 2px;font-size:15px}#ccCoach .cm.me{background:var(--soft);justify-self:end;max-width:88%;white-space:pre-wrap}#ccCoach .cm.ai{border:1px solid var(--line)}#ccCoach .think{opacity:.6}' +
    '#ccCoach .cchips{display:flex;gap:6px;overflow-x:auto;padding:8px 12px 0}#ccCoach .chip{flex:none;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:99px;padding:5px 10px;font-size:13px;font-weight:600;cursor:pointer}' +
    '#ccCoach .cform{display:flex;gap:8px;padding:10px 12px}#ccCoach textarea{flex:1;font:inherit;font-size:14.5px;padding:8px 10px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink);resize:none}#ccCoach .cfoot{padding:0 14px 10px}' +
    '.lnk{border:0;background:none;color:var(--muted);cursor:pointer;font:inherit;padding:0 4px}.glist{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:4px}.glist li{display:flex;align-items:flex-start;gap:6px;font-size:14.5px}.glist label{display:flex;gap:8px;align-items:flex-start;cursor:pointer}.glist input{margin-top:4px}.glist li.ok span:first-of-type{text-decoration:line-through;color:var(--muted)}' +
    '.gin{flex:1;min-width:180px;font:inherit;font-size:14px;padding:6px 10px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink)}.dgoals,.dpap{margin:12px 0;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:var(--soft)}#ccPomo .pfab{position:fixed;right:140px;bottom:16px;z-index:60;border:1px solid var(--line);border-radius:99px;padding:12px 16px;font-weight:700;font-size:15px;font-family:inherit;background:var(--card);color:var(--ink);box-shadow:0 6px 20px rgba(0,0,0,.15);cursor:pointer;font-variant-numeric:tabular-nums}#ccPomo .pfab.on{background:var(--ember);color:#fff;border-color:var(--ember)}' +
    '#ccPomo .pdraw{position:fixed;right:16px;bottom:72px;z-index:61;width:min(400px,calc(100vw - 32px));max-height:calc(100vh - 100px);overflow:auto;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.22)}#ccPomo .pdraw[hidden],#ccPomo .plock[hidden]{display:none}#ccPomo .chead{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap;padding:12px 14px;border-bottom:1px solid var(--line);background:var(--soft)}#ccPomo .pclose{margin-left:auto}#ccPomo .pbody{padding:12px 14px}' +
    '.ptime{font-size:52px;font-weight:800;line-height:1.05;font-variant-numeric:tabular-nums;color:var(--accent);margin:4px 0 8px}.ptime.big{font-size:min(26vw,120px)}.pdot{display:inline-block;width:12px;height:12px;border-radius:50%;border:2px solid var(--accent);margin-right:4px;vertical-align:-1px}.pdot.got{background:var(--accent)}' +
    '.pjoke{margin:10px 0;padding:12px 14px;border-radius:12px;background:var(--ember-soft)}.pjoke .jk{font-size:18px;font-weight:600;margin:4px 0 8px;line-height:1.4}' +
    '#ccPomo .plock{position:fixed;inset:0;z-index:80;background:var(--bg);display:grid;place-items:center;padding:24px 16px;overflow:auto}.plin{max-width:640px;width:100%;text-align:center;display:grid;gap:12px}.plab{font-size:20px;font-weight:700;margin:0}.plin .msg{text-align:left}' +
    '.punlock{justify-self:center;position:relative;overflow:hidden}.punlock.holding{background:var(--ember);color:#fff;border-color:var(--ember);transition:background 3s}@media(max-width:600px){#ccPomo .pfab{right:auto;left:16px}}.dpap select{font:inherit;font-size:13px;padding:2px 6px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--ink)}</style>';
  function fab() { if (!document.getElementById("coachcss")) document.head.insertAdjacentHTML("beforeend", CCSS); load(); if (!D) { fetch(BASE + "data/tracker.json").then(function (r) { return r.json(); }).then(function (j) { D = j; ensureCoach(); pomoInit(); bellInit(); }).catch(function () {}); return; } ensureCoach(); if (!document.getElementById("ccPomo")) pomoInit(); bellInit(); }
  var BELLT = null;
  function bellInit() { if (!document.getElementById("oppcss")) document.head.insertAdjacentHTML("beforeend", OCSS); ensureBell(); ensureOpps(function () { ensureNews(bellUpdate); }); if (!BELLT) BELLT = setInterval(function () { try { bellUpdate(); } catch (e) {} }, 60000); }
  function ensureLit(cb) { if (LIT) return cb(); fetch(BASE + "data/literature.json").then(function (r) { return r.json(); }).then(function (j) { LIT = j; cb(); }).catch(function () { LIT = { rows: [] }; cb(); }); }

  /* ---------- Pomodoro time locker with break-time laughs ---------- */
  var JOKES = [
    "Why did the carbon credit go to therapy? It had too many unresolved emissions.",
    "I told my Excel sheet a joke. It didn't laugh. It just returned #VALUE!",
    "A pivot table walks into a bar. The bartender says, \"We don't serve your kind.\" The pivot table says, \"Fine. Let me summarise the situation.\"",
    "Why was the thermocouple so calm in the meeting? It knows how to handle the heat.",
    "I asked the load cell how its day was. It said, \"Heavy.\"",
    "My research has three stages: \"This is easy.\" \"This is impossible.\" \"Why did nobody tell me about corresponding adjustments?\"",
    "Why did the SQL query leave the table? It said there was no relationship.",
    "A statistician on a diet: \"I'm not overeating. I'm increasing my sample size.\"",
    "Why did the PM2.5 particle get promoted? It always gets deep into the details.",
    "The Chorkor smoker told the Ahotor oven, \"Stop showing off, you're just hot air.\" The Ahotor replied, \"Yes, but I use it efficiently.\"",
    "Why are carbon markets so dramatic? Every relationship needs a corresponding adjustment.",
    "I tried to tell a joke about NPV. It's funnier if you wait, but it's worth less.",
    "Me: \"I'll check my phone for one minute.\" Also me, 45 minutes later: an expert on a goat that can open gates in Kumasi.",
    "Why did the business analyst bring a ladder to work? To reach the high-level requirements.",
    "I would tell you a joke about deadlines, but it's due tomorrow.",
    "Why did the balance sheet join a gym? To build up its assets.",
    "Why do ITMOs never travel alone? They always need a corresponding partner.",
    "My sensor broke up with the Wi-Fi. Too many dropped connections. Now it's seeing LoRaWAN: long range, low drama.",
    "My focus is like a trotro: it leaves when it's full, not when it's scheduled.",
    "What did the improved cookstove say on its first date? \"I think we have chemistry. Also very efficient combustion.\"",
    "Why did the dataset refuse to be cleaned? \"I'm not dirty. I'm just raw.\"",
    "Me reading papers: abstract, conclusion, done. My conscience: \"…and the methods, please.\"",
    "Why did the R script go back to school? To improve its class.",
    "I asked Google Scholar for one paper. It gave me 1,499. So now I have a tracker.",
    "Why did the pitch deck fail its driving test? It kept skipping slides.",
    "Why do smoked fish make great friends? They're well seasoned and never get cold feet.",
    "Why did the auditor fall in love with the Data Vault? Finally, someone with a clean record.",
    "If procrastination were an Olympic sport, I'd definitely compete… tomorrow.",
    "My brain after 25 focused minutes: \"Achievement unlocked.\" My brain after 25 minutes of scrolling: \"Where am I? Who am I?\"",
    "Why did the financial model go to the doctor? It had circular references and couldn't stop going round in circles.",
    "Why was the survey so popular? It always asked the right questions.",
    "Why don't trees ever lose arguments about carbon? They have deep roots in the evidence.",
    "What's a researcher's favourite music? Heavy metadata.",
    "Why did the public speaker bring a mirror? To practise reflection.",
    "A fish processor, an engineer and a carbon auditor walk into a kitchen. The fish gets smoked, the stove gets measured, and the auditor asks for the raw data.",
    "Why did the growth video feel proud? It finally got watched to the end.",
    "Jollof debate rules in our office: Ghana wins, Nigeria appeals, and the researcher asks for a larger sample.",
    "Why was the emission factor always invited to parties? It made everything add up.",
    "My to-do list and I have an agreement: I write it, and it judges me silently.",
    "Why did the PowerPoint go to therapy? Too many unresolved bullet points."
  ];
  var MOVES = ["Stand up and stretch your arms to the ceiling for 10 seconds. Reach for those carbon credits.", "Drink a full glass of water. Hydrated brains think faster.", "Walk to the window and look at something far away for 20 seconds. Your eyes will thank you.",
    "Do 10 slow shoulder rolls, then 10 the other way.", "Announce your last 25 minutes like a football commentator. Out loud. Yes, really.", "Text someone a kind word. It boosts your mood too.",
    "Dance to one song like nobody is watching (somebody might be, that's fine).", "Do 10 jumping jacks while whispering \"additionality\".", "Close your eyes and take 5 slow breaths: in for 4, out for 6.", "Tidy one thing on your desk. Small wins count."];
  var PK = "cc_pomo", P = null, PT = null, BEEPCTX = null;
  function pload() { P = lj(PK, null) || {}; P.cfg = P.cfg || { f: 25, s: 5, l: 15 }; P.mode = P.mode || "idle"; P.n = P.n || 0; return P; }
  function psave() { sj(PK, P); }
  function plen(m) { return (m === "focus" ? P.cfg.f : m === "short" ? P.cfg.s : m === "long" ? P.cfg.l : P.cfg.f) * 6e4; }
  function pleft() { if (P.mode === "idle" || P.mode === "ready") return plen("focus"); return P.paused ? P.left : Math.max(0, P.end - Date.now()); }
  function fmt(ms) { var s = Math.ceil(ms / 1000), m = Math.floor(s / 60); return String(m).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }
  function defLabel() { try { var nn = nowNext(), b = nn.now.filter(function (x) { return majorIds().indexOf(x.id) >= 0 || x.id === "tasks"; })[0] || nn.next; return b ? brief(b, today()).title : "Deep work"; } catch (e) { return "Deep work"; } }
  function beep(n) { try { BEEPCTX = BEEPCTX || new (window.AudioContext || window.webkitAudioContext)(); var t = BEEPCTX.currentTime; for (var i = 0; i < (n || 3); i++) { var o = BEEPCTX.createOscillator(), g = BEEPCTX.createGain(); o.frequency.value = i % 2 ? 660 : 880; o.connect(g); g.connect(BEEPCTX.destination); g.gain.setValueAtTime(.0001, t + i * .35); g.gain.exponentialRampToValueAtTime(.25, t + i * .35 + .03); g.gain.exponentialRampToValueAtTime(.0001, t + i * .35 + .3); o.start(t + i * .35); o.stop(t + i * .35 + .32); } } catch (e) {} }
  function notify(t, b) { try { if (window.Notification && Notification.permission === "granted") new Notification(t, { body: b }); } catch (e) {} }
  function joke() { return JOKES[Math.floor(Math.random() * JOKES.length)]; }
  function move() { return MOVES[Math.floor(Math.random() * MOVES.length)]; }
  function pstart(label) {
    pload(); if (label) P.label = label; P.label = P.label || defLabel();
    try { if (window.Notification && Notification.permission === "default") Notification.requestPermission(); } catch (e) {}
    P.mode = "focus"; P.end = Date.now() + plen("focus"); P.paused = false; P.dist = 0; psave(); ptick(); pdraw();
  }
  function pbreak(kind) { P.mode = kind; P.end = Date.now() + plen(kind); P.paused = false; P.joke = joke(); P.move = move(); psave(); }
  function pcomplete() {
    var k = dk(today());
    if (P.mode === "focus") {
      load(); S.pomo = S.pomo || {}; var r = S.pomo[k] = S.pomo[k] || { n: 0, mins: 0, dist: 0 }; r.n++; r.mins += P.cfg.f; r.dist += P.dist || 0;
      var e = S.focus.filter(function (f) { return f.date === k && f.auto === "pomo"; })[0]; if (!e) { e = { date: k, task: "Pomodoro time locker", step: "", sess: 0, win: "", auto: "pomo" }; S.focus.push(e); }
      e.sess = Math.round((+e.sess || 0) + P.cfg.f / 25); e.win = (e.win ? e.win + "; " : "") + (P.label || "").slice(0, 80); if (e.win.length > 400) e.win = e.win.slice(-400);
      save("Focus session logged: +" + Math.round(P.cfg.f / 25) * PTS.sess + " XP 🎉");
      P.n = (P.n + 1) % 4; pbreak(P.n === 0 ? "long" : "short"); beep(3); notify("Focus done! Break time 😄", P.joke);
    } else { P.mode = "ready"; psave(); beep(2); notify("Break over", "Ready to lock in again?"); }
    pdraw();
    if (location.hash === "#tracker-pomo") pomoPage(); else if (/^#tracker/.test(location.hash) && document.querySelector(".dgoals")) { try { show(location.hash.slice(1)); } catch (e2) {} }
  }
  function ptick() { clearInterval(PT); PT = setInterval(function () { if (!P) pload(); if ((P.mode === "focus" || P.mode === "short" || P.mode === "long") && !P.paused && Date.now() >= P.end) pcomplete(); pdrawTime(); }, 1000); }
  function modeName(m) { return m === "focus" ? "Focus" : m === "short" ? "Short break" : m === "long" ? "Long break" : m === "ready" ? "Ready for the next focus" : "Ready"; }
  function pdrawTime() {
    var t = fmt(pleft()), m = P.mode, run = (m === "focus" || m === "short" || m === "long") && !P.paused;
    var fb = document.querySelector("#ccPomo .pfab"); if (fb) { fb.textContent = (m === "focus" ? "🔒 " : m === "short" || m === "long" ? "😄 " : "⏱ ") + (m === "idle" || m === "ready" ? "Focus" : t); fb.classList.toggle("on", run); }
    Array.prototype.forEach.call(document.querySelectorAll("[data-ptime]"), function (el) { el.textContent = t; });
    var tot = plen(m === "idle" || m === "ready" ? "focus" : m); Array.prototype.forEach.call(document.querySelectorAll("[data-pbar]"), function (el) { el.style.width = Math.round((1 - pleft() / tot) * 100) + "%"; });
    if (run) document.title = t + " · " + (m === "focus" ? "Focus" : "Break") + " · Carbon Clarity"; else if (/· Carbon Clarity$/.test(document.title)) document.title = "Carbon Clarity Learning";
  }
  function pcontrols() {
    var m = P.mode, run = m === "focus" || m === "short" || m === "long", k = dk(today()), r = (S && S.pomo && S.pomo[k]) || { n: 0, mins: 0 };
    var dots = [0, 1, 2, 3].map(function (i) { return '<span class="pdot' + (i < P.n ? " got" : "") + '"></span>'; }).join("");
    var h = '<p class="eyebrow">' + modeName(m) + (P.paused ? " · paused" : "") + "</p>" + '<div class="ptime" data-ptime>' + fmt(pleft()) + '</div><div class="prog2"><i data-pbar style="width:0"></i></div>' +
      '<p class="small" style="margin:8px 0">' + dots + " &nbsp;Today: " + r.n + " focus session" + (r.n === 1 ? "" : "s") + " · " + r.mins + " min</p>";
    if (m === "focus") h += '<p><b>Locked in on:</b> ' + esc(P.label || "") + "</p>";
    if (m === "short" || m === "long") h += '<div class="pjoke"><p class="eyebrow">Break-time laugh 😂</p><p class="jk">' + esc(P.joke || joke()) + '</p><p class="small"><b>Move:</b> ' + esc(P.move || move()) + '</p><div class="row"><button class="btn small" data-pact="joke">Another joke 😆</button><button class="btn small" data-coach="Make me laugh for my break: tell me 3 short, clean, original jokes about carbon markets, fish smoking, data or startup life in Ghana. Then one line of motivation for my next focus block.">✨ Coach, make me laugh</button></div></div>';
    if (m === "idle" || m === "ready") h += '<label class="small" style="display:grid;gap:4px">What are you locking in on?<input class="gin" data-plabel value="' + esc(P.label && m === "ready" ? P.label : defLabel()) + '" maxlength="120"></label>';
    h += '<div class="row">' + (m === "idle" || m === "ready" ? '<button class="btn pri" data-pact="start">▶ Start ' + P.cfg.f + "-min focus</button>" + (m === "ready" ? "" : "") :
      (P.paused ? '<button class="btn pri" data-pact="resume">▶ Resume</button>' : '<button class="btn" data-pact="pause">❚❚ Pause</button>') + (m === "focus" ? '<button class="btn pri" data-pact="lock">🔒 Lock screen</button><button class="btn" data-pact="dist">I got distracted (' + (P.dist || 0) + ")</button>" : '<button class="btn" data-pact="skip">Skip break</button>') + '<button class="btn" data-pact="stop">■ Stop</button>') + "</div>";
    if (m === "idle" || m === "ready") h += '<div class="row small" style="align-items:center">Focus <select data-pcfg="f">' + [15, 20, 25, 30, 45, 50].map(function (v) { return "<option" + (v === P.cfg.f ? " selected" : "") + ">" + v + "</option>"; }).join("") + '</select> min · break <select data-pcfg="s">' + [3, 5, 10].map(function (v) { return "<option" + (v === P.cfg.s ? " selected" : "") + ">" + v + "</option>"; }).join("") + '</select> · long break <select data-pcfg="l">' + [10, 15, 20, 30].map(function (v) { return "<option" + (v === P.cfg.l ? " selected" : "") + ">" + v + "</option>"; }).join("") + "</select></div>";
    return h;
  }
  function pwire(root) {
    Array.prototype.forEach.call(root.querySelectorAll("[data-pact]"), function (b) { b.onclick = function () { var a = b.dataset.pact, li = root.querySelector("[data-plabel]");
      if (a === "start") pstart(li ? li.value.trim() : "");
      else if (a === "pause") { P.paused = true; P.left = Math.max(0, P.end - Date.now()); psave(); }
      else if (a === "resume") { P.paused = false; P.end = Date.now() + P.left; psave(); }
      else if (a === "stop") { P.mode = "idle"; P.lock = false; psave(); }
      else if (a === "skip") { P.mode = "ready"; psave(); }
      else if (a === "dist") { P.dist = (P.dist || 0) + 1; psave(); toast("Noted. Breathe, then back to it 💪"); }
      else if (a === "joke") { P.joke = joke(); P.move = move(); psave(); }
      else if (a === "lock") { P.lock = true; psave(); }
      pdraw(); if (location.hash === "#tracker-pomo") pomoPage(); }; });
    Array.prototype.forEach.call(root.querySelectorAll("[data-pcfg]"), function (s) { s.onchange = function () { P.cfg[s.dataset.pcfg] = +s.value; psave(); pdraw(); if (location.hash === "#tracker-pomo") pomoPage(); }; });
  }
  function ensurePomo() {
    if (document.getElementById("ccPomo")) return;
    if (!document.getElementById("coachcss")) document.head.insertAdjacentHTML("beforeend", CCSS);
    var w = document.createElement("div"); w.id = "ccPomo";
    w.innerHTML = '<button class="pfab" aria-label="Pomodoro time locker">⏱ Focus</button><div class="pdraw" role="dialog" aria-label="Pomodoro time locker" hidden><div class="chead"><b>⏱ Time locker</b><span class="small">Pomodoro: focus, break, repeat</span><button class="lnk pclose" aria-label="Close">✕</button></div><div class="pbody"></div></div><div class="plock" hidden></div>';
    document.body.appendChild(w);
    w.querySelector(".pfab").onclick = function () { var d = w.querySelector(".pdraw"); d.hidden = !d.hidden; var c = document.querySelector("#ccCoach .cdraw"); if (c && !d.hidden) c.hidden = true; pdraw(); };
    w.querySelector(".pclose").onclick = function () { w.querySelector(".pdraw").hidden = true; };
    window.addEventListener("beforeunload", function (e) { if (P && P.lock && P.mode === "focus" && !P.paused) { e.preventDefault(); e.returnValue = ""; } });
  }
  var HOLD = null;
  function pdraw() {
    if (!P) pload(); ensurePomo();
    var w = document.getElementById("ccPomo"), body = w.querySelector(".pbody"); body.innerHTML = pcontrols(); pwire(body);
    var lk = w.querySelector(".plock"), on = P.lock && P.mode === "focus";
    if (!on && P.lock && P.mode !== "focus") { P.lock = false; psave(); }
    lk.hidden = !on;
    if (on) {
      var msg = D && D.messages ? D.messages[Math.floor(Date.now() / 3e5) % D.messages.length] : "One block at a time.";
      lk.innerHTML = '<div class="plin"><p class="eyebrow">🔒 Locked in</p><div class="ptime big" data-ptime>' + fmt(pleft()) + '</div><div class="prog2"><i data-pbar style="width:0"></i></div><p class="plab">' + esc(P.label || "") + '</p><p class="msg">' + esc(msg) + '</p>' +
        '<div class="row" style="justify-content:center"><button class="btn" data-pact="dist">I got distracted (' + (P.dist || 0) + ')</button>' + (P.paused ? '<button class="btn pri" data-pact="resume">▶ Resume</button>' : '<button class="btn" data-pact="pause">❚❚ Pause</button>') + '</div><button class="btn punlock">Hold 3 seconds to unlock early</button><p class="small">Phone in another room. You\'ve got this.</p></div>';
      pwire(lk);
      var ub = lk.querySelector(".punlock"), startH = function (e) { e.preventDefault(); ub.classList.add("holding"); HOLD = setTimeout(function () { P.lock = false; psave(); pdraw(); toast("Unlocked. The timer is still running."); }, 3000); }, endH = function () { clearTimeout(HOLD); ub.classList.remove("holding"); };
      ub.addEventListener("mousedown", startH); ub.addEventListener("touchstart", startH); ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach(function (ev) { ub.addEventListener(ev, endH); });
    }
    pdrawTime();
  }
  function pomoPage() {
    pload(); var k = dk(today()), r = (S.pomo || {})[k] || { n: 0, mins: 0, dist: 0 }, wk = monday(today()), tot = 0, days = [];
    for (var i = 0; i < 7; i++) { var x = new Date(wk); x.setDate(x.getDate() + i); var q = (S.pomo || {})[dk(x)] || { n: 0 }; tot += q.n; days.push([x, q.n]); }
    var h = '<div class="card ppage">' + pcontrols() + "</div>" +
      '<div class="card"><h2>This week</h2><div class="kpis" style="margin-top:10px">' + kpi(r.n, "focus sessions today") + kpi(r.mins, "focus minutes today") + kpi(r.dist || 0, "distractions noted today") + kpi(tot, "sessions this week") + "</div>" +
      '<table class="tt" style="margin-top:12px"><tr>' + days.map(function (d) { return "<th>" + d[0].toLocaleDateString("en-GB", { weekday: "short" }) + "</th>"; }).join("") + "</tr><tr>" + days.map(function (d) { return "<td>" + (d[1] ? "🍅".repeat(Math.min(d[1], 8)) + (d[1] > 8 ? " " + d[1] : "") : '<span class="small">–</span>') + "</td>"; }).join("") + "</tr></table>" +
      '<p class="hint" style="margin-top:10px">Every finished focus block is logged in your Focus log automatically, earns XP, ticks your "4 focus sessions" goal and keeps your streak alive. After every 4th block you get a long break.</p></div>' +
      '<div class="card"><h2>How the time locker works</h2><ol><li>Pick what you\'re locking in on (it suggests the session you\'re in now).</li><li>Start. Tap <b>🔒 Lock screen</b> to hide everything else; unlocking early needs a 3-second hold.</li><li>When the timer ends you hear a chime, the block is logged, and your break starts with a joke and a quick move.</li><li>Break over, chime again, start the next block.</li></ol></div>';
    page("tracker-pomo", h, "Time locker", "Pomodoro focus timer. Lock in for 25 minutes, laugh on your break, repeat.");
    pwire(document.querySelector(".ppage")); pdrawTime();
  }
  function pomoInit() { pload(); ensurePomo(); ptick(); pdraw(); }

  /* ---------- TODAY: one simple page with just what you need to do ---------- */
  function M(t, how, done, src) { return { t: t, how: how, done: done, src: src || "" }; }
  var MISSIONS = {
    1: [M("Write your research question in one sentence", "Make it specific: what, where, when.", "One sentence you could say to a funder."), M("List 5 sub-questions", "One for each part of the market: rules, deals, projects, people, money.", "5 sub-questions in your Steps notes.")],
    2: [M("Map who's who in Ghana's carbon market", "EPA, Carbon Market Office, Ministry of Finance, Forestry Commission, COCOBOD. One line on each one's role.", "A 5-row who-does-what table.", "Ghana Carbon Market Office website; EPA Ghana"), M("Check the status of the Carbon Market Regulations", "Draft, laid, passed or gazetted? Find the newest official mention.", "Gap G01 updated with a date and source.", "Parliament of Ghana; EPA/CMO news")],
    3: [M("List every Article 6 partner country", "Find all bilateral agreements Ghana has signed and the signing dates.", "Country + date filled in for each row of your agreement table.", "Ghana Carbon Market Office; UNEP-CCC Article 6 Pipeline"),
      M("Ghana–Switzerland: the first transfers", "Which projects were authorised, how many credits moved, when? Check the 34,705 vs 11,733 figures in your notes.", "One verified number with its source in the Evidence log.", "KliK Foundation; Swiss FOEN; CMO reports"),
      M("Ghana–Singapore and Ghana–Sweden", "What's agreed so far? Any projects authorised?", "Two table rows filled in with sources.", "Singapore NCCS; Swedish Energy Agency; CMO"),
      M("Other talks: South Korea, Liechtenstein and others", "Note the status (signed, negotiating, announced) and date of each.", "Status column complete.", "UNEP-CCC Article 6 Pipeline; news from official sources"),
      M("How Ghana applies corresponding adjustments", "Find one official statement on how adjustments work and the share Ghana keeps for its own NDC.", "Gap G02 or G05 updated with a quote and link.", "CMO framework documents; Ghana's Article 6 guidance"),
      M("Write 150 words on the pattern", "Look at your table: who buys, which sectors, how much? What surprises you?", "150-word summary saved in Step 3 notes.")],
    4: [M("Count Ghana projects on the Verra registry", "Filter by country = Ghana. Count projects by type.", "A small table: sector and number of projects.", "registry.verra.org"),
      M("Count Ghana projects on the Gold Standard registry", "Same filter, same table.", "Table updated with Gold Standard numbers.", "registry.goldstandard.org"),
      M("Credits issued versus retired", "For your top 3 projects, note credits issued and retired, and the year.", "3 rows with numbers, dates and sources.", "Verra and Gold Standard registries"),
      M("Who runs Ghana's cookstove projects?", "List the top 5 developers and their project names.", "A 5-row developer list.", "Registries; Clean Cooking Alliance"),
      M("Cocoa and forests: Ghana's REDD+ payments", "What has the Ghana Cocoa Forest REDD+ Programme been paid, and when?", "One verified payment figure with source.", "World Bank FCPF; Forestry Commission"),
      M("Make one chart: projects by sector", "Use tonight's data skills: a simple bar chart in Excel.", "A chart you can drop into the report.")],
    5: [M("Find Ghana's benefit-sharing rule", "What share of carbon revenue must go to communities, by law or policy?", "Rule, percentage and source in the Evidence log.", "CMO framework; EPA"),
      M("REDD+ benefit-sharing plan", "Who gets what: farmers, chiefs, government? Note the split.", "A 'who gets what' list.", "Forestry Commission; World Bank FCPF"),
      M("One cookstove project: how do households benefit?", "Cheaper stoves, cash, or something else? Pick one project and find out.", "3 bullet points with a source."),
      M("Is there a grievance mechanism?", "How can a community complain about a carbon project in Ghana?", "Gap G11 or G16 updated."),
      M("Women and carbon money", "Find one finding on women receiving carbon revenue (Ghana or West Africa).", "One evidence row with the paper."),
      M("3 recommendations for Carbon Clarity", "How should your mobile-money benefit sharing work, based on what you found?", "3 recommendations in your notes.")],
    6: [M("List 10 developers and buyers active in Ghana", "Who builds projects, who buys credits?", "A 10-row actor list.", "Registries; company websites"),
      M("Quality labels: ICVCM Core Carbon Principles", "Which cookstove methodologies are approved or rejected?", "One-paragraph note with date.", "icvcm.org"),
      M("What do cookstove credits sell for?", "Find 2 price points with source and date. Prices change, so date them.", "2 dated prices in the Evidence log."),
      M("The over-crediting critique", "What does Gill-Wiehl et al. (2024) mean for Ghana's cookstove credits?", "5-sentence summary."),
      M("Who buys Ghana's credits?", "Name 3 corporate or government buyers.", "3 buyers with sources."),
      M("One-page memo: the opportunity for Carbon Clarity", "Where do you fit in this market?", "One page, saved in Docs.")],
    7: [M("Draft your interview guide", "8 open questions. Start easy, finish with 'what did I miss?'", "Interview guide v1."),
      M("List 10 people to interview", "CMO, developers, NGOs, processors' groups. How will you reach each one?", "10 names and contact routes."),
      M("Send 3 interview requests", "Ask the coach to help draft a short, polite request.", "3 requests sent."),
      M("Practise one interview", "Try your guide on a colleague and fix the confusing questions.", "Interview guide v2."),
      M("Do interview 1", "Record (with consent) or take careful notes.", "Notes typed up the same day."),
      M("Code your notes into themes", "Use what you learned in the thematic analysis lesson.", "5 themes with quotes.")],
    8: [M("Outline the report", "Headings only: intro, rules, deals, projects, benefits, market, recommendations.", "An outline doc."), M("Write the 'rules and institutions' section", "Use your Step 2 notes.", "A first draft of the section."), M("Write the 'Article 6 deals' section", "Use your agreement table.", "A first draft of the section."), M("Write the 'projects and volumes' section", "Use your chart.", "A first draft of the section."), M("Make 3 clear charts", "One message per chart.", "3 charts in the report."), M("Write the executive summary", "5 bullet points a minister could read in 1 minute.", "Executive summary.")],
    9: [M("Fact-check 10 numbers", "Each number gets a source and date.", "10 ticks in the Evidence log."), M("Check every citation", "APA 7 format, working links.", "A clean reference list."), M("Ask someone to read it", "One colleague, one question: what's unclear?", "Feedback received."), M("Final formatting and share", "Headings, page numbers, PDF.", "Report sent.")]
  };
  var CHALLENGES = [
    ["Teach it at home", "Explain this morning's lesson to someone at home in 2 minutes. If they get it, you've got it."],
    ["One paper, one tweet", "Turn one of today's papers into a single 280-character insight. Save it in your notes."],
    ["Ask a real expert", "Ask one processor, colleague or partner one question about what you learned today."],
    ["Draw the flow", "On paper, draw how a carbon credit moves: James Town stove → verifier → registry → buyer → money back to the women."],
    ["Double-check a number", "Take one number from today's reading and check it in a second source. Do they match?"],
    ["Teach the coach", "Write what you learned today in 5 lines and ask the coach to find the gaps."],
    ["One-slide summary", "Make one slide that sums up yesterday's work. Good practice for Friday's speaking session."],
    ["Do the maths", "If one processor saves one bundle of wood a week at your local price, what does she save in a year? Use a real price you know."],
    ["Voice note pitch", "Record a 60-second voice note: what Carbon Clarity does and why it matters. Listen back once."],
    ["Find the Ghana angle", "For today's lesson, find one way it applies specifically in Ghana, and note the source."],
    ["Spot the gap", "Read one of your research gaps. Write the single email or search that would close it."],
    ["Explain like a funder", "Write 3 sentences on today's research mission as if a funder asked 'so what?'"],
    ["Clean one dataset", "Open one messy sheet (pilot or literature) and fix 10 rows: dates, units, names."],
    ["Vocabulary sprint", "Pick 3 terms from the glossary and use each in a sentence about James Town."],
    ["Future headline", "Write the newspaper headline you want about Carbon Clarity in 2028. Then one step towards it."],
    ["Swap a scroll", "Next time you reach for your phone, open one free PDF from today's papers instead."],
    ["Process map in 5 minutes", "Sketch how a processor smokes one batch of fish today. Circle where smoke and wood are wasted."],
    ["Three whys", "Ask 'why?' three times about today's biggest problem. Write down the root cause."],
    ["Thank someone", "Send a short thank-you to someone who helped your research or project this week."],
    ["Predict and check", "Before reading a paper, guess its main finding. After reading, were you right?"]
  ];
  var WP = null, WPLOAD = false;
  function workplanTask() {
    if (!WPLOAD) { WPLOAD = true; fetch("/api/tasks", { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { var T = j && j.tasks || []; T = T.filter(function (t) { return t.status !== "done" && t.title; }).sort(function (a, b) { return (a.status === "doing" ? -1 : 0) - (b.status === "doing" ? -1 : 0) || String(a.due || "9").localeCompare(String(b.due || "9")); }); WP = T[0] || null; if (WP && (location.hash === "#today" || location.hash === "" || location.hash === "#")) todayView(); }).catch(function () {}); }
    return WP;
  }
  function missionFor(st) {
    if (!st) return null; var L = MISSIONS[st.n] || [], dn = (S.mis || {})[st.n] || {}, t = dk(today());
    for (var i = 0; i < L.length; i++) { if (!dn[i] || dn[i] === t) return { i: i, m: L[i], done: dn[i] === t, total: L.length, left: L.filter(function (x, j) { return !dn[j]; }).length }; }
    return null;
  }
  function challengeFor(d) { var n = Math.floor((d - new Date(2026, 0, 1)) / 864e5); return CHALLENGES[((n % CHALLENGES.length) + CHALLENGES.length) % CHALLENGES.length]; }
  function missions(d) {
    var dow = d.getDay(), bl = plan(d), k = dk(d), out = [];
    function blk(id) { return bl.filter(function (b) { return b.id === id; })[0]; }
    var lb = blk("learn") || blk("learn-sun") || blk("satlearn");
    if (lb) { var x = brief(lb, d), lid = (x.links[0] || [])[1] || "#home"; out.push({ id: "learn", time: lb.s, ico: "📚", kind: "Learn", t: x.title.replace(/^📚 |^🌱 /, ""), how: lb.id === "learn-sun" ? "Read or watch something on leadership, then note one thing to try this week." : lb.id === "satlearn" ? x.todo.join(" ") : "Watch, read, take the 3-question quiz.", fin: x.out, open: lid, done: isDone(d, lb.id), blk: lb.id, ask: askPrompt(x, d) }); }
    var rb = blk("research") || blk("satres"), db = blk("deep");
    if (rb) { var st = curStep(d), mi = missionFor(st);
      out.push({ id: "research", time: rb.s, ico: "🌍", kind: "Research mission" + (st ? " · Step " + st.n : ""), t: mi ? mi.m.t : st ? st.task : "Research", how: mi ? mi.m.how + (mi.m.src ? " Where to look: " + mi.m.src + "." : "") : "", fin: mi ? mi.m.done : "", open: "#tracker-steps", done: isDone(d, rb.id), blk: rb.id, mis: mi && st ? st.n + "|" + mi.i : "", prog: mi ? "Mission " + (mi.total - mi.left + (mi.done ? 0 : 1)) + " of " + mi.total + " for this step" : "", ask: "Help me do this research mission in my 2-hour block: \"" + (mi ? mi.m.t + ". " + mi.m.how + " Done when: " + mi.m.done : "") + "\". Give me a step-by-step plan, the exact searches to run, what to record, and how to check the source is reliable." }); }
    else if (db) { var w = workplanTask(), dx = brief(db, d);
      out.push({ id: "deep", time: db.s, ico: "🎯", kind: "Main work", t: w ? w.title : "Your most important Carbon Clarity task", how: w ? "From your work plan" + (w.due ? ", due " + fd(w.due) : "") + (w.owner ? " · " + w.owner : "") + ". Phone away, 4 focus blocks." : "Pick the top task from your work plan. Phone away, 4 focus blocks.", fin: dx.out, open: "workplan.html", done: isDone(d, "deep"), blk: "deep", ask: askPrompt(dx, d) + (w ? " The task is: " + w.title : "") }); }
    var n = quota(d);
    if (n && LIT) { var tp = todaysPapers(d), first = tp.filter(function (i) { return litRead(i) !== "Read"; })[0]; out.push({ id: "read", time: "Any time", ico: "📄", kind: "Read", t: "Read " + n + " paper" + (n === 1 ? "" : "s") + " (" + papersRead(d) + "/" + n + " done)", how: first != null ? "Next: " + LIT.rows[first][4] : "All done for today. 🎉", fin: "Log one useful fact from each paper in the Evidence log.", open: "#tracker-lit", done: papersRead(d) >= n, paper: first, ask: first != null ? paperPrompt(LIT.rows[first]) : "" }); }
    var sb = blk("skill");
    if (sb) { var sx = brief(sb, d); out.push({ id: "skill", time: sb.s, ico: dow === 6 ? "🎤" : SKILLDAY[dow] ? SKILLDAY[dow][0] : "⭐", kind: dow === 6 ? "Practice" : "Tonight's skill", t: sx.title.replace(/^\S+ /, ""), how: sx.todo[1] ? sx.todo[1].replace(/^25 min: /, "") : sx.goal, fin: sx.out, open: "#tracker-time", done: isDone(d, "skill"), blk: "skill", ask: askPrompt(sx, d) }); }
    var yb = blk("yamale") || blk("grad");
    if (yb) { var yx = brief(yb, d); out.push({ id: yb.id, time: yb.s, ico: yb.id === "grad" ? "🎓" : "📣", kind: yb.id === "grad" ? "Graduate applications" : "Yamale LinkedIn", t: yx.goal.replace(/\.$/, ""), how: yx.todo.join(" "), fin: yx.out, open: yb.id === "grad" ? "#tracker-opps" : "https://www.linkedin.com/", done: isDone(d, yb.id), blk: yb.id, ask: askPrompt(yx, d) }); }
    var vb = blk("video"), v = videoFor(d);
    if (vb && v && dow !== 6 && out.length < 5) out.push({ id: "video", time: vb.s, ico: "🎬", kind: "Bonus · 15 min", t: v.t, how: v.ch + ". Watch for one idea to use tonight.", fin: "One idea written down.", open: "https://www.youtube.com/watch?v=" + v.id + (v.st ? "&t=" + v.st + "s" : ""), done: !!S.vids[k], vid: k, ask: "" });
    if (dow === 0) out.push({ id: "reflect", time: "08:00", ico: "🪞", kind: "Reflect", t: "Weekly reflection", how: "Wins, lessons, next week's one big goal.", fin: "Reflection saved.", open: "#tracker-reflect", done: !!(S.reflect[iso(monday(d))] && (S.reflect[iso(monday(d))].wins || "").trim()), ask: "Help me write my weekly reflection: ask me 4 short questions one at a time." });
    out.sort(function (a, b) { return (/^\d/.test(a.time) ? a.time : "99") < (/^\d/.test(b.time) ? b.time : "99") ? -1 : 1; });
    return out;
  }
  function greet() { var h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; }
  function todayView() {
    if (!LIT) { ensureLit(todayView); return; }
    if (!OPP) { ensureOpps(todayView); return; }
    if (!NEWS) { ensureNews(todayView); return; }
    if (!WPL) { wpLoad(todayView); return; }
    S.visits = S.visits || {}; if (!S.first) S.first = dk(today()); if (!S.visits[dk(today())]) { S.visits[dk(today())] = 1; sj(KEY, S); }
    var d = today(), s = stats(), M2 = missions(d), dn = M2.filter(function (m) { return m.done; }).length, nn = nowNext(), cur = nn.now.filter(function (b) { return b.id !== "prayer"; })[0] || null, k = dk(d), ch = challengeFor(d), chDone = !!(S.chal || {})[k];
    var curM = cur ? M2.filter(function (m) { return m.blk === cur.id || (cur.id === "learn-pm" && false); })[0] : null;
    var h = CSS + BCSS + CCSS + OCSS + NCSS + HQCSS + TCSS + AGCSS + alertBanner() + '<div class="card thero"><p class="eyebrow">' + d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) + '</p><h1>' + greet() + ', Pout Chop</h1>' +
      '<p class="sub">' + (dn === M2.length && M2.length ? "Every mission done today. That's a perfect day. 🏆" : "Today you have <b>" + M2.length + " missions</b>. " + dn + " done so far.") + "</p>" + bar(M2.length ? dn / M2.length : 0) +
      '<p class="small" style="margin-top:8px">Level ' + s.level + " · " + esc(s.title) + " · " + s.xp.toLocaleString() + " XP · 🔥 " + s.streak + "-day streak" + (s.nextXp ? " · " + (s.nextXp - s.xp) + " XP to level " + (s.level + 1) : "") + "</p></div>";
    h += '<div class="card tnow"><p class="eyebrow">Right now · ' + new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + "</p>" +
      (cur ? "<h2>" + esc(brief(cur, d).title) + '</h2><p class="small">until ' + cur.e + "</p>" + (curM && !curM.done ? '<p>' + esc(curM.how) + '</p><div class="row"><button class="btn pri" data-pomo="' + esc(curM.t) + '">⏱ Start focus</button><button class="btn" data-coach="' + esc(curM.ask) + '">✨ Help me</button></div>' : "") :
        "<h2>Free time</h2><p class=\"small\">Rest, family or catch-up." + (nn.next ? " Next: <b>" + esc(brief(nn.next, d).title) + "</b> at " + nn.next.s + "." : " Nothing else today.") + "</p>") + "</div>";
    h += coachCard() + agendaHtml(d) + ccMini();
    h += '<h2 class="tsec">Today\'s missions</h2><div class="tmis">' + M2.map(function (m) {
      var ext = /^https?:/.test(m.open);
      return '<div class="mcard' + (m.done ? " done" : "") + '"><div class="mtop"><span class="mico">' + m.ico + '</span><div><p class="eyebrow">' + esc(m.time) + " · " + esc(m.kind) + "</p><h3>" + esc(m.t) + "</h3></div>" +
        '<label class="mchk" title="Mark done"><input type="checkbox" ' + (m.done ? "checked " : "") + (m.id === "read" ? "disabled " : "") + 'data-mdone="' + esc(m.id) + '"' + (m.blk ? ' data-mblk="' + m.blk + '"' : "") + (m.mis ? ' data-mmis="' + m.mis + '"' : "") + (m.vid ? ' data-mvid="' + m.vid + '"' : "") + "><span>" + (m.done ? "✓" : "") + "</span></label></div>" +
        (m.how ? '<p class="mhow">' + esc(m.how) + "</p>" : "") + (m.fin ? '<p class="mfin"><b>Done when:</b> ' + esc(m.fin) + "</p>" : "") + (m.prog ? '<p class="small">' + esc(m.prog) + "</p>" : "") +
        (m.done ? "" : '<div class="row">' + (m.id !== "video" ? '<button class="btn small pri" data-pomo="' + esc(m.t) + '">⏱ Start</button>' : "") + (m.id === "read" && m.paper != null ? '<a class="btn small" href="' + esc(LIT.rows[m.paper][10] || LIT.rows[m.paper][9]) + '" target="_blank" rel="noopener">Open paper ↗</a><button class="btn small" data-rdone="' + m.paper + '">Mark read</button>' : '<a class="btn small" href="' + esc(m.open) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">Open" + (ext ? " ↗" : "") + "</a>") + (m.ask ? '<button class="btn small" data-coach="' + esc(m.ask) + '">✨ Help</button>' : "") + "</div>") + "</div>";
    }).join("") + "</div>";
    h += '<div class="card tchal' + (chDone ? " done" : "") + '"><p class="eyebrow">🎲 Today\'s practical challenge · +10 XP</p><h3>' + esc(ch[0]) + "</h3><p>" + esc(ch[1]) + '</p><div class="row">' + (chDone ? pill("✓ Done") : '<button class="btn pri small" data-chal="' + k + '">I did it (+10 XP)</button>') + '<button class="btn small" data-coach="Help me with today\'s practical challenge: ' + esc(ch[0]) + ". " + esc(ch[1]) + ' Keep it short and fun.">✨ Help</button></div></div>';
    h += oppsMini() + worldMini();
    h += '<div id="papers" class="card"><h2>Today\'s papers</h2>' + papersHtml(d) + "</div>";
    var tm = new Date(d); tm.setDate(tm.getDate() + 1); var tM = missions(tm);
    h += '<div class="card"><p class="eyebrow">Tomorrow</p><p>' + tM.map(function (m) { return m.ico + " " + esc(m.t); }).join(" · ") + "</p></div>";
    h += '<h2 class="tsec">Your toolbox</h2><div class="tbox">' + [["🔥", "Carbon Clarity HQ", "Tasks, docs, pilot, research", "#tracker-cc"], ["🔔", "Notifications", "Deadlines and new opportunities", "#tracker-alerts"], ["🌍", "World today", "Daily news and good news", "#tracker-world"], ["🎓", "Opportunities", "Programmes that accept your 2.3", "#tracker-opps"], ["🗓️", "Full timetable", "Every block with its brief", "#tracker-time"], ["⏱", "Time locker", "Pomodoro focus timer", "#tracker-pomo"], ["✨", "AI coach", "Knows your day and research", "#tracker-ai"], ["📊", "Research tracker", "Steps, XP and progress", "#tracker"], ["🧾", "Evidence log", "Facts you've verified", "#tracker-evidence"], ["🕳️", "Gaps", "What's still unknown", "#tracker-gaps"], ["📚", "Literature", "All 1,499 papers", "#tracker-lit"], ["🔁", "Revision", "What to review today", "#revise"], ["🌱", "My growth", "Skills, levels, rewards", "#tracker-growth"], ["📝", "Focus log", "Hours and streak", "#tracker-focus"], ["📋", "Work plan", "Carbon Clarity tasks", "workplan.html"], ["🌍", "Research page", "Summary for others", "research.html"]].map(function (t) { return '<a class="tool" href="' + t[3] + '"><span>' + t[0] + "</span><b>" + t[1] + "</b><small>" + t[2] + "</small></a>"; }).join("") + "</div>";
    h += '<details class="card"><summary><b>What\'s new</b> <span class="small">(everything added recently, all on this site)</span></summary><ul style="margin-top:8px"><li><b>🔥 Carbon Clarity HQ</b>: your top project tasks, deadlines, documents and pages, plus a Carbon Clarity card on Today.</li><li><b>💪 Consistency coach</b>: tracks green days and switches to Comeback mode when you slip.</li><li><b>🚀 Future opportunities</b> and <b>▶ videos</b> in World today.</li><li><b>📋 Daily agenda</b>: every task of the day with your % done (red below 60%, green above) and a printable sheet.</li><li><b>🌍 World today</b>: a morning briefing on the world, Africa, climate and business, plus good news.</li><li><b>🎓 Opportunities</b> that accept your 2.3 GPA (London, Canada, Germany), checked every day, with status tracking and your own deadlines.</li><li><b>🔔 Notifications</b>: new opportunities, deadlines 100/30/14/7/1 days ahead, and missed deadlines, with pop-up alerts.</li><li><b>Today page</b> (this page): your missions, a practical challenge and today\'s papers in one place.</li><li><b>Research missions:</b> each research block now has one small, concrete task with where to look and when it\'s done.</li><li><b>Time locker:</b> Pomodoro timer with a lock screen; breaks come with a joke and a quick move.</li><li><b>AI coach</b> (✨ bottom right): knows your day, goals, papers and progress. Switches on once a card is added in Vercel → AI Gateway.</li><li><b>Daily papers:</b> named papers picked for your current research step, with a daily target you can change.</li><li><b>Session briefs:</b> tap any block in the Timetable for goal, steps and output.</li><li><b>Daily and weekly summaries</b> built from your notes (Timetable page).</li><li><b>Growth videos</b> every evening, linked to your skill for the night.</li><li><b>Research tracker</b> with XP, levels, streaks, milestones and the Excel download.</li></ul></details>';
    render(h, "today");
    var root = document.getElementById("view");
    wireGoals(root, todayView); wireAgenda(root, todayView);
    Array.prototype.forEach.call(root.querySelectorAll("[data-mdone]"), function (el) { el.onchange = function () {
      var on = el.checked; if (el.dataset.mblk) { S.done[k] = S.done[k] || {}; S.done[k][el.dataset.mblk] = on ? 1 : 0; }
      if (el.dataset.mmis) { var p = el.dataset.mmis.split("|"); S.mis = S.mis || {}; S.mis[p[0]] = S.mis[p[0]] || {}; if (on) S.mis[p[0]][p[1]] = k; else delete S.mis[p[0]][p[1]]; }
      if (el.dataset.mvid) S.vids[el.dataset.mvid] = on ? 1 : 0;
      if (el.dataset.mdone === "reflect" && on) { location.hash = "#tracker-reflect"; return; }
      save(on ? "Mission done! 🎉" : "Saved"); todayView(); }; });
    Array.prototype.forEach.call(root.querySelectorAll("[data-chal]"), function (el) { el.onclick = function () { S.chal = S.chal || {}; S.chal[el.dataset.chal] = 1; save("Challenge done: +10 XP 🎲"); todayView(); }; });
    clearInterval(TT_TIMER); TT_TIMER = setInterval(function () { if (location.hash !== "#today" && location.hash !== "") { clearInterval(TT_TIMER); return; } if (window.scrollY < 60 && !document.activeElement.matches("input,textarea,select")) todayView(); }, 120000);
  }
  function miniToday(d) {
    if (!LIT) return "";
    d = d || today(); var M2 = missions(d), dn = M2.filter(function (m) { return m.done; }).length, nx = M2.filter(function (m) { return !m.done; })[0], sc = agScore(d);
    return alertBanner() + '<a class="card agmini ' + (sc.pct >= 60 ? "ok" : "bad") + '" href="#today"><b>📋 Today\'s agenda: ' + sc.done + " of " + sc.n + " tasks · " + sc.pct + "%</b> " + (sc.pct >= 60 ? "✅ above 60%" : "· " + sc.need + " more to reach 60%") + "</a>" + '<div class="card"><p class="eyebrow">Today · ' + dn + " of " + M2.length + " missions done</p>" + bar(M2.length ? dn / M2.length : 0) + (nx ? '<p style="margin-top:10px">' + nx.ico + " <b>Next:</b> " + esc(nx.t) + ' <span class="small">(' + esc(nx.time) + ")</span></p>" : '<p style="margin-top:10px">🏆 All missions done. Rest well.</p>') + '<div class="row"><a class="btn pri" href="#today">Open Today</a>' + (nx && nx.id !== "video" ? '<button class="btn" data-pomo="' + esc(nx.t) + '">⏱ Start focus</button>' : "") + "</div></div>";
  }
  var TCSS = '<style id="todaycss">.thero h1{margin:2px 0 6px}.tnow{border-left:6px solid var(--accent)}.tnow h2{margin:2px 0}.tsec{margin:22px 0 10px;font-size:20px}' +
    '.tmis{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));margin-bottom:16px}.mcard{border:1px solid var(--line);border-radius:14px;padding:14px 16px;background:var(--card);display:grid;gap:6px;align-content:start}.mcard.done{opacity:.6;background:var(--soft)}.mcard h3{margin:2px 0 0;font-size:17px;line-height:1.3}.mtop{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:start}.mico{font-size:26px;line-height:1}' +
    '.mchk input{position:absolute;opacity:0;width:1px;height:1px}.mchk span{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;border:2px solid var(--accent);color:#fff;font-weight:800;cursor:pointer}.mchk input:checked+span{background:var(--accent)}.mchk input:focus-visible+span{outline:3px solid var(--ember);outline-offset:2px}.mchk input:disabled+span{border-style:dashed;cursor:default}.mhow{margin:0;font-size:15px}.mfin{margin:0;font-size:14px;color:var(--muted)}' +
    '.tchal{background:var(--ember-soft);border-color:transparent}.tchal.done{opacity:.7}.tchal h3{margin:4px 0}.tbox{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-bottom:16px}.tool{display:grid;gap:2px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:var(--card);text-decoration:none;color:var(--ink)}.tool span{font-size:22px}.tool small{color:var(--muted);font-size:12.5px}.tool:hover{border-color:var(--accent)}@media(max-width:600px){.tmis{grid-template-columns:1fr}}</style>';

  /* ---------- Opportunities (graduate study) and the notification centre ---------- */
  var OPP = null, OSTAT2 = ["New", "Interested", "Applying", "Submitted", "Offer", "Not for me"], OF = { c: "", st: "" };
  function ensureOpps(cb) {
    if (OPP) { if (cb) cb(); return; }
    fetch(BASE + "data/opps.json?t=" + Math.floor(Date.now() / 3e5), { cache: "no-store" }).then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { OPP = j; if (S && !S.oppSeen) { S.oppSeen = j.updated; sj(KEY, S); } if (cb) cb(); })
      .catch(function () { OPP = { items: [], alerts: [] }; if (cb) cb(); });
  }
  function oppS(o) { return (S.opp && S.opp[o.id]) || {}; }
  function oppSt(o) { return oppS(o).s || "New"; }
  function oppDl(o) { return oppS(o).dl || o.deadline || null; }
  function daysTo(s) { return Math.round((pd(s) - today()) / 864e5); }
  function alerts() {
    var A = [], k = dk(today());
    if (OPP) {
      (OPP.alerts || []).forEach(function (a) { var o = a.opp && OPP.items.filter(function (x) { return x.id === a.opp; })[0]; if (o && ["Not for me", "Submitted", "Offer"].indexOf(oppSt(o)) >= 0) return;
        A.push({ key: "n:" + a.id, level: a.level || "info", ico: a.level === "urgent" ? "⏰" : a.level === "new" ? "🆕" : "📣", title: a.title, body: a.body || "", date: a.date, link: a.link || "#tracker-opps" }); });
      OPP.items.forEach(function (o) {
        var st = oppSt(o); if (["Not for me", "Submitted", "Offer"].indexOf(st) >= 0) return;
        if (S.oppSeen && o.added > S.oppSeen) A.push({ key: "new:" + o.id, level: "new", ico: "🆕", title: "New opportunity: " + o.provider, body: o.title + " (" + o.city + ")", date: o.added, link: "#tracker-opps" });
        var dl = oppDl(o);
        if (dl) { var n = daysTo(dl);
          if (n < 0 && n >= -45) A.push({ key: "miss:" + o.id + ":" + dl, level: "missed", ico: "⚠️", title: "Missed deadline: " + o.provider, body: o.title + " closed on " + fd(dl) + ". Check the next intake or mark it 'Not for me'.", date: dl, link: "#tracker-opps" });
          else if (n >= 0) { var stg = n <= 1 ? 1 : n <= 7 ? 7 : n <= 14 ? 14 : n <= 30 ? 30 : n <= 100 ? 100 : 0;
            if (stg) A.push({ key: "dl:" + o.id + ":" + dl + ":" + stg, level: n <= 14 ? "urgent" : "soon", ico: "⏰", title: (n === 0 ? "Today" : n === 1 ? "Tomorrow" : "In " + n + " days") + ": " + o.provider + " deadline", body: o.title + " · " + fd(dl) + (st === "Applying" ? " · you're applying" : ""), date: k, link: "#tracker-opps" }); } }
        if (o.remindOn && k >= o.remindOn) A.push({ key: "rem:" + o.id + ":" + o.remindOn, level: "soon", ico: "🔔", title: "Get ready: " + o.provider, body: o.deadlineNote || o.title, date: o.remindOn, link: "#tracker-opps" });
      });
    }
    if (D) D.steps.forEach(function (x) { var f = stepFlag(x);
      if (f === "Overdue") A.push({ key: "step:" + x.n + ":" + x.due, level: "missed", ico: "⚠️", title: "Missed deadline: research Step " + x.n, body: x.task + " was due " + fd(x.due) + ". Finish it or set a new date.", date: x.due, link: "#tracker-steps" });
      else if (f === "Due soon") A.push({ key: "stepsoon:" + x.n + ":" + x.due, level: "soon", ico: "⏰", title: "Due soon: research Step " + x.n, body: x.task + " · due " + fd(x.due), date: k, link: "#tracker-steps" }); });
    try { var cs = consistency(); if (cs.red >= 2) A.push({ key: "red:" + k, level: "urgent", ico: "💪", title: cs.red + " red days in a row: your comeback plan is ready", body: "Open Today, start a 10-minute restart, and aim for 60%.", date: k, link: "#today" }); } catch (e) {}
    if (NEWS && NEWS.updated && NEWS.updated !== S.newsSeen) A.push({ key: "news:" + NEWS.updated, level: "info", ico: "🌍", title: "Today's world briefing is ready", body: NEWS.headline || "World, Africa, climate and good news.", date: NEWS.updated, link: "#tracker-world" });
    try { var hr = new Date().getHours(), sc = agScore(today()); if (hr >= 18 && sc.pct < 60) A.push({ key: "pct:" + k + ":" + sc.done, level: "urgent", ico: "🔴", title: "Today is at " + sc.pct + "%: " + sc.need + " more task" + (sc.need === 1 ? "" : "s") + " to reach 60%", body: "Open your agenda, pick the quickest tasks left and tick them as you finish.", date: k, link: "#today" }); } catch (e) {}
    var order = { missed: 0, urgent: 1, new: 2, soon: 3, info: 4 };
    A.sort(function (a, b) { return (order[a.level] - order[b.level]) || (a.date < b.date ? 1 : -1); });
    return A;
  }
  function unread() { S.alertRead = S.alertRead || {}; return alerts().filter(function (a) { return !S.alertRead[a.key]; }); }
  function ensureBell() {
    if (document.getElementById("ccBell")) return;
    var b = document.createElement("a"); b.id = "ccBell"; b.href = "#tracker-alerts"; b.setAttribute("aria-label", "Notifications"); b.innerHTML = '🔔<span class="bn"></span>';
    document.body.appendChild(b);
  }
  function bellUpdate() {
    if (!S || !D) return; ensureBell(); var U = unread(), el = document.querySelector("#ccBell .bn");
    if (el) { el.textContent = U.length ? (U.length > 9 ? "9+" : U.length) : ""; el.style.display = U.length ? "" : "none"; }
    document.getElementById("ccBell").classList.toggle("hot", U.some(function (a) { return a.level === "missed" || a.level === "urgent"; }));
    S.alertPushed = S.alertPushed || {}; var sent = 0, ch = false;
    U.forEach(function (a) { if (sent < 3 && !S.alertPushed[a.key] && (a.level === "missed" || a.level === "urgent" || a.level === "new")) { notify(a.ico + " " + a.title, a.body); S.alertPushed[a.key] = 1; sent++; ch = true; } });
    if (ch) sj(KEY, S);
  }
  function alertsPage() {
    var A = alerts(); S.alertRead = S.alertRead || {};
    var groups = [["Needs attention", ["missed", "urgent"]], ["New", ["new"]], ["Coming up", ["soon"]], ["Updates", ["info"]]];
    var perm = window.Notification ? Notification.permission : "unsupported";
    var h = '<div class="card"><div class="row" style="justify-content:space-between;align-items:center"><p class="sub" style="margin:0">' + unread().length + " unread · " + A.length + ' in total</p><div class="row" style="margin:0"><button class="btn small" data-aall>Mark all read</button>' + (perm === "default" ? '<button class="btn small pri" data-aperm>Turn on pop-up alerts</button>' : "") + "</div></div>" +
      (perm === "denied" ? '<p class="small">Pop-up alerts are blocked in this browser. Alerts still collect here and on the 🔔 button.</p>' : "") + "</div>";
    groups.forEach(function (g) { var L = A.filter(function (a) { return g[1].indexOf(a.level) >= 0; }); if (!L.length) return;
      h += '<h2 class="tsec">' + g[0] + '</h2><div class="alist">' + L.map(function (a) { var rd = !!S.alertRead[a.key];
        return '<div class="al ' + a.level + (rd ? " rd" : "") + '"><span class="aico">' + a.ico + '</span><div><b>' + esc(a.title) + "</b>" + (rd ? "" : ' <span class="pill warn">new</span>') + '<div class="small">' + esc(a.body) + (a.date ? " · " + fd(a.date) : "") + '</div><div class="row" style="margin-top:6px"><a class="btn small pri" href="' + esc(a.link) + '" data-aread="' + esc(a.key) + '">Open</a>' + (rd ? "" : '<button class="btn small" data-aread="' + esc(a.key) + '">Mark read</button>') + "</div></div></div>"; }).join("") + "</div>"; });
    if (!A.length) h += '<div class="card"><p>🎉 Nothing needs your attention right now.</p></div>';
    h += '<p class="hint" style="margin-top:12px">Alerts come from: new graduate opportunities (checked every day), deadlines 100, 30, 14, 7 and 1 days ahead, missed deadlines (opportunities and research steps), and important news. Opportunities you mark "Not for me" or "Submitted" stop alerting.</p>';
    page("tracker-alerts", h, "Notifications", "Everything that needs your attention, in one place.");
    var root = document.getElementById("view");
    Array.prototype.forEach.call(root.querySelectorAll("[data-aread]"), function (el) { el.addEventListener("click", function () { S.alertRead[el.dataset.aread] = 1; save(); if (el.tagName === "BUTTON") alertsPage(); bellUpdate(); }); });
    var all = root.querySelector("[data-aall]"); if (all) all.onclick = function () { alerts().forEach(function (a) { S.alertRead[a.key] = 1; }); save("All marked read"); alertsPage(); bellUpdate(); };
    var pm = root.querySelector("[data-aperm]"); if (pm) pm.onclick = function () { try { Notification.requestPermission().then(function () { alertsPage(); }); } catch (e) {} };
  }
  function oppsPage() {
    var I = OPP.items.slice(), cs = []; I.forEach(function (o) { if (cs.indexOf(o.country) < 0) cs.push(o.country); });
    if (OPP.updated) { S.oppSeen = OPP.updated > (S.oppSeen || "") ? OPP.updated : S.oppSeen; sj(KEY, S); }
    var L = I.filter(function (o) { return (!OF.c || (OF.c === "FUNDED" ? /Fully funded/.test(o.funded || "") : o.country === OF.c)) && (!OF.st || oppSt(o) === OF.st); });
    L.sort(function (a, b) { var da = oppDl(a) || "9999", db2 = oppDl(b) || "9999"; return (oppSt(a) === "Not for me") - (oppSt(b) === "Not for me") || (a.priority - b.priority) || (da < db2 ? -1 : 1); });
    var nx = I.filter(function (o) { var d = oppDl(o); return d && daysTo(d) >= 0 && oppSt(o) !== "Not for me"; }).sort(function (a, b) { return oppDl(a) < oppDl(b) ? -1 : 1; })[0];
    var cnt = {}; OSTAT2.forEach(function (s2) { cnt[s2] = I.filter(function (o) { return oppSt(o) === s2; }).length; });
    var h = '<div class="card"><p class="eyebrow">Your grade and your routes</p><p>' + esc(OPP.profile || "") + '</p><div class="kpis" style="margin-top:10px">' + kpi(I.length, "opportunities") + kpi(cnt.Interested + cnt.Applying, "you're interested in or applying to") + kpi(cnt.Submitted + cnt.Offer, "submitted or offers") + kpi(nx ? daysTo(oppDl(nx)) + " days" : "–", nx ? "to the next deadline (" + nx.provider + ")" : "no upcoming deadline") + '</div><p class="small" style="margin-top:8px">Checked daily for new options. Last update: ' + fd(OPP.updated) + '. Always confirm details on the official page before applying.</p></div>';
    h += '<div class="row" style="margin:8px 0 12px"><label class="small">Country <select id="ofc"><option value="">All</option>' + cs.map(function (c) { return '<option value="' + c + '"' + (OF.c === c ? " selected" : "") + ">" + (c === "Africa" ? "Africa (fellowships, grants)" : c === "Europe" ? "Europe (Erasmus Mundus)" : c) + "</option>"; }).join("") + '<option value="FUNDED"' + (OF.c === "FUNDED" ? " selected" : "") + '>💰 Fully funded only</option></select></label><label class="small">Status <select id="ofs"><option value="">All</option>' + OSTAT2.map(function (c) { return "<option" + (OF.st === c ? " selected" : "") + ">" + c + "</option>"; }).join("") + "</select></label></div>";
    h += '<div class="olist">' + L.map(function (o) { var st = oppSt(o), dl = oppDl(o), n = dl ? daysTo(dl) : null, my = oppS(o);
      var flag = { UK: "🇬🇧", Canada: "🇨🇦", Germany: "🇩🇪", Europe: "🇪🇺", USA: "🇺🇸", Australia: "🇦🇺" }[o.country] || "🌍";
      return '<div class="ocard' + (st === "Not for me" ? " off" : "") + '"><p class="eyebrow">' + flag + " " + esc(o.city) + " · " + esc(o.type) + (o.source && /LinkedIn/.test(o.source) ? ' · <span class="lin">in</span> LinkedIn' : "") + (S.oppSeen && o.added > S.oppSeen ? " · 🆕" : "") + "</p><h3>" + esc(o.provider) + (o.funded ? ' <span class="pill' + (/Fully/.test(o.funded) ? " fund" : "") + '">' + (/Fully/.test(o.funded) ? "💰 " : "") + esc(o.funded) + "</span>" : "") + '</h3><p class="otitle">' + esc(o.title) + "</p>" +
        '<p class="small"><b>Your grade:</b> ' + esc(o.grade) + "</p>" + '<p class="small"><b>Also needs:</b> ' + esc(o.req) + "</p>" +
        '<p class="small"><b>Starts:</b> ' + esc(o.start) + " · <b>Cost:</b> " + esc(o.cost) + "</p>" + (o.funding ? '<p class="small"><b>Funding:</b> ' + esc(o.funding) + "</p>" : "") +
        '<p class="small"><b>Deadline:</b> ' + (dl ? fd(dl) + (n >= 0 ? " (" + (n === 0 ? "today" : "in " + n + " days") + ")" : " (passed)") + (my.dl ? " · your date" : "") : "none fixed") + (o.deadlineNote ? " · " + esc(o.deadlineNote) : "") + "</p>" +
        '<p class="ofit">💡 ' + esc(o.fit) + "</p>" +
        '<div class="row"><a class="btn small pri" href="' + esc(o.link) + '" target="_blank" rel="noopener">Official page ↗</a><label class="small">Status <select data-ost="' + o.id + '">' + OSTAT2.map(function (x) { return "<option" + (x === st ? " selected" : "") + ">" + x + "</option>"; }).join("") + '</select></label><label class="small">My deadline <input type="date" data-odl="' + o.id + '" value="' + esc(my.dl || "") + '"></label>' +
        '<button class="btn small" data-coach="' + esc("Help me apply to this: " + o.provider + ", " + o.title + " (" + o.city + "). Entry: " + o.grade + " " + o.req + " Starts: " + o.start + ". My CGPA is 2.3/4.0 from Ghana and I have work experience (Carbon Clarity founder and researcher, marketing and sales for Yamale). Give me a step-by-step application checklist, what to say about my grade, and a 4-week timeline. Remind me to confirm details on the official page.") + '">✨ Plan my application</button></div>' +
        '<label class="small" style="display:grid;gap:4px;margin-top:6px">Notes<textarea class="gin" data-onote="' + o.id + '" rows="2" placeholder="Contacts, documents, what you asked…">' + esc(my.n || "") + "</textarea></label></div>"; }).join("") + "</div>";
    if (OPP.funders && OPP.funders.length) { var FL = { good: ["✅", "Good fit for you"], maybe: ["⚠️", "Possible: check the details"], no: ["❌", "Not open to you right now"] };
      h += '<div class="card" style="margin-top:12px"><h2>🏛 Who fully funds African students\' master\'s abroad</h2><p class="small">Checked against your 2.3 GPA and Ghanaian citizenship.</p>' + ["good", "maybe", "no"].map(function (f) { var L2 = OPP.funders.filter(function (x) { return x.fit === f; }); if (!L2.length) return ""; return '<p class="eyebrow" style="margin-top:12px">' + FL[f][0] + " " + FL[f][1] + '</p><div class="flist">' + L2.map(function (x) { return '<div class="fund ' + f + '"><a href="' + esc(x.link) + '" target="_blank" rel="noopener"><b>' + esc(x.name) + '</b> ↗</a><div class="small"><b>Where:</b> ' + esc(x.where) + " · <b>Covers:</b> " + esc(x.what) + '</div><div class="small"><b>Rule:</b> ' + esc(x.rule) + '</div><div class="small"><b>When:</b> ' + esc(x.when) + "</div></div>"; }).join("") + "</div>"; }).join("") + "</div>"; }
    if (OPP.excluded && OPP.excluded.length) h += '<details class="card" style="margin-top:12px"><summary><b>Checked and left out</b> <span class="small">(so you don\'t waste time)</span></summary><ul>' + OPP.excluded.map(function (x) { return "<li><b>" + esc(x.name) + ":</b> " + esc(x.why) + "</li>"; }).join("") + "</ul></details>";
    var LI = OPP.linkedin;
    if (LI) h += '<div class="card lisec"><h2><span class="lin">in</span> On LinkedIn</h2><p class="small">' + esc(LI.note) + '</p><p class="eyebrow" style="margin-top:12px">Jobs and internships (past week)</p><div class="lbtns">' + LI.jobs.map(function (x) { return '<a class="btn small" target="_blank" rel="noopener" href="' + esc(x.url) + '">' + esc(x.label) + " ↗</a>"; }).join("") + '</div><p class="eyebrow" style="margin-top:12px">Scholarship and fellowship posts (past week)</p><div class="lbtns">' + LI.posts.map(function (x) { return '<a class="btn small" target="_blank" rel="noopener" href="' + esc(x.url) + '">' + esc(x.label) + " ↗</a>"; }).join("") + '</div><details style="margin-top:12px"><summary><b>Pages to follow</b> <span class="small">(they post opportunities often)</span></summary><ul class="clean">' + LI.follow.map(function (x) { return '<li style="display:block;padding:6px 0"><a target="_blank" rel="noopener" href="' + esc(x.url) + '"><b>' + esc(x.name) + '</b> ↗</a><div class="small">' + esc(x.why) + "</div></li>"; }).join("") + '</ul></details><details style="margin-top:8px"><summary><b>Make LinkedIn work for you</b></summary><ul>' + LI.tips.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></details>" +
      '<div class="row"><button class="btn small pri" data-coach="Rewrite my LinkedIn headline and About section (under 200 words) for someone who founded Carbon Clarity (clean fish-smoking ovens, sensors and carbon credits with women processors in James Town), researches Ghana\'s carbon market, does marketing and sales for Yamale, and is applying for master\'s programmes in Canada, Germany and London. Give 3 headline options.">✨ Improve my LinkedIn profile</button></div></div>';
    page("tracker-opps", h, "Graduate opportunities", "Master's routes in London, Canada and Germany that work with a 2.3 GPA, plus fellowships, grants and LinkedIn searches. New ones are added every day and announced in 🔔 Notifications.");
    var root = document.getElementById("view");
    $("ofc").onchange = function () { OF.c = this.value; oppsPage(); }; $("ofs").onchange = function () { OF.st = this.value; oppsPage(); };
    function setO(id, f, v) { S.opp = S.opp || {}; S.opp[id] = S.opp[id] || {}; S.opp[id][f] = v; }
    Array.prototype.forEach.call(root.querySelectorAll("[data-ost]"), function (el) { el.onchange = function () { setO(el.dataset.ost, "s", el.value); save(el.value === "Submitted" ? "Application submitted! 🎉" : "Saved"); oppsPage(); bellUpdate(); }; });
    Array.prototype.forEach.call(root.querySelectorAll("[data-odl]"), function (el) { el.onchange = function () { setO(el.dataset.odl, "dl", el.value); save("Your deadline saved: you'll get reminders"); oppsPage(); bellUpdate(); }; });
    Array.prototype.forEach.call(root.querySelectorAll("[data-onote]"), function (el) { var t; el.oninput = function () { clearTimeout(t); t = setTimeout(function () { setO(el.dataset.onote, "n", el.value); save(); }, 500); }; });
  }
  function oppsMini() {
    if (!OPP || !OPP.items.length) return "";
    var I = OPP.items.filter(function (o) { return oppSt(o) !== "Not for me"; }), nx = I.filter(function (o) { var d = oppDl(o); return d && daysTo(d) >= 0; }).sort(function (a, b) { return oppDl(a) < oppDl(b) ? -1 : 1; })[0], ap = I.filter(function (o) { return oppSt(o) === "Applying"; }).length;
    return '<div class="card"><p class="eyebrow">🎓 Graduate opportunities</p><p>' + I.length + " opportunities for you (study routes that accept your 2.3, plus fellowships and grants)" + (ap ? " · applying to " + ap : "") + (nx ? " · next deadline: <b>" + esc(nx.provider) + "</b> on " + fd(oppDl(nx)) + " (in " + daysTo(oppDl(nx)) + " days)" : "") + '</p><div class="row"><a class="btn pri" href="#tracker-opps">See opportunities</a></div></div>';
  }
  function alertBanner() {
    if (!D) return ""; var U = unread(); if (!U.length) return "";
    return '<a class="card abanner" href="#tracker-alerts"><b>🔔 ' + U.length + " thing" + (U.length === 1 ? "" : "s") + " need" + (U.length === 1 ? "s" : "") + " your attention</b>" + U.slice(0, 3).map(function (a) { return '<div class="small">' + a.ico + " " + esc(a.title) + "</div>"; }).join("") + "</a>";
  }
  var OCSS = '<style id="oppcss">#ccBell{position:fixed;right:258px;bottom:16px;z-index:60;display:grid;place-items:center;width:48px;height:48px;border-radius:50%;border:1px solid var(--line);background:var(--card);box-shadow:0 6px 20px rgba(0,0,0,.15);text-decoration:none;font-size:20px}#ccBell.hot{border-color:var(--ember)}#ccBell .bn{position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;padding:0 5px;border-radius:99px;background:var(--ember);color:#fff;font:700 12px/20px inherit;font-family:inherit;text-align:center}' +
    '@media(max-width:600px){#ccBell{right:auto;left:130px}}.alist{display:grid;gap:8px}.al{display:grid;grid-template-columns:auto 1fr;gap:10px;padding:12px 14px;border:1px solid var(--line);border-left:5px solid var(--line);border-radius:12px;background:var(--card)}.al.missed{border-left-color:var(--bad)}.al.urgent{border-left-color:var(--ember)}.al.new{border-left-color:var(--accent)}.al.soon{border-left-color:#D9A441}.al.rd{opacity:.65}.aico{font-size:22px}' +
    '.olist{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(320px,1fr))}.ocard{border:1px solid var(--line);border-radius:14px;padding:14px 16px;background:var(--card);display:grid;gap:4px;align-content:start}.ocard.off{opacity:.55}.ocard h3{margin:2px 0 0;font-size:17px}.ocard p{margin:2px 0}.otitle{font-weight:600}.ofit{background:var(--soft);border-radius:10px;padding:8px 10px;font-size:14.5px}.ocard select,.ocard input[type=date]{font:inherit;font-size:13px;padding:3px 6px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--ink)}' +
    '.flist{display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));margin-top:6px}.fund{padding:10px 12px;border:1px solid var(--line);border-left:5px solid var(--ok);border-radius:10px}.fund.maybe{border-left-color:#D9A441}.fund.no{border-left-color:var(--bad);opacity:.75}@media(max-width:600px){.flist{grid-template-columns:1fr}}.pill.fund{background:var(--ok-soft);color:var(--ok)}.lin{display:inline-block;background:#0A66C2;color:#fff;font-weight:800;font-size:11px;line-height:1;padding:3px 4px;border-radius:3px;vertical-align:1px}.lbtns{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.lisec{margin-top:16px}.agmini{display:block;text-decoration:none;color:var(--ink);border-left:8px solid var(--ok)}.agmini.bad{border-left-color:var(--bad);background:var(--bad-soft)}.agmini.ok{background:var(--ok-soft)}.abanner{display:block;text-decoration:none;color:var(--ink);border-left:6px solid var(--ember)}@media(max-width:600px){.olist{grid-template-columns:1fr}}</style>';

  /* ---------- Daily agenda sheet: every task of the day, scored (green at 60%+, red below) ---------- */
  var SKIPAG = ["prayer", "lunch", "church"];
  function agenda(d) { return plan(d).filter(function (b) { return SKIPAG.indexOf(b.id) < 0; }); }
  function agScore(d) { var A = agenda(d), dn = A.filter(function (b) { return isDone(d, b.id); }).length; return { n: A.length, done: dn, pct: A.length ? Math.round(dn / A.length * 100) : 0, need: Math.max(0, Math.ceil(A.length * 0.6) - dn) }; }
  function agendaHtml(d) {
    var A = agenda(d), sc = agScore(d), ok = sc.pct >= 60, live = dk(d) === dk(today()), m = new Date().getHours() * 60 + new Date().getMinutes();
    var wk = []; for (var i = 6; i >= 0; i--) { var x = new Date(d); x.setDate(x.getDate() - i); var s2 = agScore(x), fut = x > today(); wk.push('<span class="agday ' + (fut ? "fut" : s2.pct >= 60 ? "ok" : "bad") + '" title="' + x.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" }) + ": " + s2.done + "/" + s2.n + '"><b>' + x.toLocaleDateString("en-GB", { weekday: "short" }).slice(0, 2) + "</b>" + (fut ? "–" : s2.pct + "%") + "</span>"); }
    var h = '<div class="card agsheet ' + (ok ? "ok" : "bad") + '" id="agsheet"><div class="aghead"><div><p class="eyebrow">📋 ' + (live ? "Today's agenda" : "Agenda") + " · " + d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) + "</p><h2>" + sc.done + " of " + sc.n + ' tasks done</h2><p class="small">' + (ok ? "✅ Above 60%: good day. Keep going." : "Target: at least 60% (" + Math.ceil(sc.n * 0.6) + " tasks). " + sc.need + " more to reach it.") + '</p></div><div class="agpct">' + sc.pct + '%</div></div><div class="agbar"><i style="width:' + sc.pct + '%"></i><span class="ag60" title="60% target"></span></div>' +
      '<ol class="aglist">' + A.map(function (b) { var dn = isDone(d, b.id), late = live && !dn && mins(b.e) <= m, now = live && mins(b.s) <= m && m < mins(b.e);
        return '<li class="' + (dn ? "dn" : late ? "late" : "") + (now ? " now" : "") + '"><label><input type="checkbox" data-adone="' + dk(d) + "|" + b.id + '"' + (dn ? " checked" : "") + '><span class="tm">' + b.s + "–" + b.e + "</span><span>" + esc(brief(b, d).title) + (now ? ' <span class="pill">now</span>' : late ? ' <span class="pill warn">not ticked</span>' : "") + "</span></label></li>"; }).join("") + "</ol>" +
      '<div class="row" style="align-items:center;justify-content:space-between"><div class="agweek" aria-label="Last 7 days">' + wk.join("") + '</div><button class="btn small" data-agprint="' + dk(d) + '">🖨 Print today\'s sheet</button></div></div>';
    return h;
  }
  function wireAgenda(root, again) {
    Array.prototype.forEach.call(root.querySelectorAll("[data-adone]"), function (el) { el.onchange = function () { var p = el.dataset.adone.split("|"); S.done[p[0]] = S.done[p[0]] || {}; S.done[p[0]][p[1]] = el.checked ? 1 : 0; var sc = agScore(pd(p[0])); save(el.checked ? (sc.pct >= 60 ? "Done: " + sc.pct + "% ✅" : "Done: " + sc.pct + "%, " + sc.need + " more to reach 60%") : "Saved"); again(); }; });
    Array.prototype.forEach.call(root.querySelectorAll("[data-agprint]"), function (el) { el.onclick = function () { printSheet(pd(el.dataset.agprint)); }; });
  }
  function printSheet(d) {
    var A = agenda(d), sc = agScore(d), w = window.open("", "_blank"); if (!w) { toast("Allow pop-ups to print the sheet"); return; }
    var G = goals(d), ch = challengeFor(d), tp = LIT ? todaysPapers(d) : [];
    w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Agenda ' + dk(d) + '</title><style>body{font:14px/1.45 system-ui,sans-serif;color:#111;margin:28px;max-width:760px}h1{font-size:22px;margin:0}h2{font-size:15px;margin:18px 0 6px;border-bottom:1px solid #999}.row{display:flex;gap:10px;padding:5px 0;border-bottom:1px dotted #bbb}.box{width:16px;height:16px;border:1.5px solid #111;border-radius:3px;flex:none;margin-top:2px}.t{width:96px;flex:none;font-variant-numeric:tabular-nums;color:#444}.score{float:right;border:2px solid #111;border-radius:8px;padding:6px 12px;text-align:center}.score b{font-size:20px;display:block}@media print{button{display:none}}</style></head><body>' +
      '<div class="score">Done ___ / ' + sc.n + "<b>___ %</b>Target 60% = " + Math.ceil(sc.n * 0.6) + "</div><h1>Pout Chop · Daily agenda</h1><p>" + d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + "</p>" +
      "<h2>Agenda (" + sc.n + " tasks)</h2>" + A.map(function (b) { return '<div class="row"><span class="box"></span><span class="t">' + b.s + "–" + b.e + "</span><span>" + esc(brief(b, d).title) + "</span></div>"; }).join("") +
      "<h2>Goals</h2>" + G.map(function (g) { return '<div class="row"><span class="box"></span><span>' + esc(g.t) + "</span></div>"; }).join("") +
      (tp.length ? "<h2>Papers to read</h2>" + tp.map(function (i) { return '<div class="row"><span class="box"></span><span>' + esc(LIT.rows[i][4]) + " (" + esc(LIT.rows[i][5]) + ", " + LIT.rows[i][3] + ")</span></div>"; }).join("") : "") +
      "<h2>Practical challenge</h2><p>" + esc(ch[0]) + ": " + esc(ch[1]) + '</p><h2>Notes</h2><div style="height:140px;border:1px solid #bbb;border-radius:6px"></div><p><button onclick="window.print()">Print</button></p></body></html>');
    w.document.close(); setTimeout(function () { try { w.print(); } catch (e) {} }, 400);
  }
  var AGCSS = '<style id="agcss">.agsheet{border-left:8px solid var(--ok)}.agsheet.bad{border-left-color:var(--bad)}.aghead{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center}.aghead h2{margin:2px 0}.agpct{font-size:44px;font-weight:800;line-height:1;padding:10px 14px;border-radius:14px;background:var(--ok-soft);color:var(--ok);font-variant-numeric:tabular-nums}.agsheet.bad .agpct{background:var(--bad-soft);color:var(--bad)}' +
    '.agbar{position:relative;height:14px;border-radius:99px;background:var(--line);margin:12px 0 6px;overflow:visible}.agbar i{display:block;height:100%;border-radius:99px;background:var(--ok)}.agsheet.bad .agbar i{background:var(--bad)}.ag60{position:absolute;left:60%;top:-4px;bottom:-4px;width:3px;background:var(--ink);border-radius:2px}' +
    '.aglist{list-style:none;margin:10px 0;padding:0;display:grid;gap:4px}.aglist label{display:grid;grid-template-columns:auto 100px 1fr;gap:10px;align-items:center;padding:7px 10px;border:1px solid var(--line);border-radius:10px;cursor:pointer;background:var(--card)}.aglist .tm{font-variant-numeric:tabular-nums;font-weight:700;color:var(--muted);font-size:14px}.aglist li.dn label{background:var(--ok-soft)}.aglist li.dn label span:last-child{text-decoration:line-through;color:var(--muted)}.aglist li.late label{border-color:var(--bad);background:var(--bad-soft)}.aglist li.now label{outline:2px solid var(--accent)}.aglist input{width:18px;height:18px}' +
    '.agweek{display:flex;gap:4px;flex-wrap:wrap}.agday{display:grid;place-items:center;min-width:44px;padding:4px 6px;border-radius:8px;font-size:12px;font-variant-numeric:tabular-nums}.agday b{font-size:11px}.agday.ok{background:var(--ok-soft);color:var(--ok)}.agday.bad{background:var(--bad-soft);color:var(--bad)}.agday.fut{background:var(--soft);color:var(--muted)}@media(max-width:600px){.aglist label{grid-template-columns:auto 1fr}.aglist .tm{grid-column:2}.aglist label span:last-child{grid-column:2}.agpct{font-size:34px}}</style>';

  /* ---------- World today: daily news briefing and good news ---------- */
  var NEWS = null;
  function ensureNews(cb) { if (NEWS) { if (cb) cb(); return; } fetch(BASE + "data/news.json?t=" + Math.floor(Date.now() / 3e5), { cache: "no-store" }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) { NEWS = j; if (cb) cb(); }).catch(function () { NEWS = { sections: [], good: [] }; if (cb) cb(); }); }
  function ytSearch(q) { return "https://www.youtube.com/results?search_query=" + encodeURIComponent(q) + "&sp=EgIIAw%253D%253D"; }
  function nItem(n, good) {
    var v = n.video && n.video.id ? '<a class="nvid" href="https://www.youtube.com/watch?v=' + esc(n.video.id) + '" target="_blank" rel="noopener"><img loading="lazy" alt="" src="https://i.ytimg.com/vi/' + esc(n.video.id) + '/mqdefault.jpg"><span>▶ ' + esc(n.video.title || "Watch") + (n.video.channel ? " · " + esc(n.video.channel) : "") + "</span></a>" : "";
    return '<div class="nitem' + (good ? " good" : "") + '">' + v + '<a href="' + esc(n.url) + '" target="_blank" rel="noopener"><b>' + esc(n.title) + '</b></a><p>' + esc(n.summary) + "</p>" + (n.why ? '<p class="nwhy">💡 ' + esc(n.why) + "</p>" : "") + '<p class="small">' + esc(n.source) + (n.date ? " · " + fd(n.date) : "") + '</p><div class="row" style="margin-top:6px"><a class="btn small" href="' + esc(n.url) + '" target="_blank" rel="noopener">📰 Read article ↗</a><a class="btn small" href="' + esc(n.video && n.video.id ? "https://www.youtube.com/watch?v=" + n.video.id : ytSearch(n.videoQuery || n.title)) + '" target="_blank" rel="noopener">▶ Watch ' + (n.video && n.video.id ? "video" : "clips") + " ↗</a></div></div>"; }
  function worldPage() {
    if (!NEWS) { ensureNews(worldPage); return; }
    S.newsSeen = NEWS.updated; sj(KEY, S);
    var age = NEWS.updated ? Math.round((today() - pd(NEWS.updated)) / 864e5) : 0;
    var h = '<div class="card"><p class="eyebrow">Briefing for ' + fd(NEWS.updated) + (age > 1 ? " · " + age + " days old" : "") + '</p><h2 style="margin:4px 0">' + esc(NEWS.headline || "") + "</h2>" + (NEWS.watch && NEWS.watch.length ? '<p class="small" style="margin-top:8px"><b>Trends to watch:</b> ' + NEWS.watch.map(esc).join(" · ") + "</p>" : "") + '<div class="row"><button class="btn small pri" data-coach="Using today\'s world briefing in my context, explain the 3 stories that matter most for me (a Ghanaian climate and carbon-market founder applying for master\'s abroad) and what I should watch next. Then give me one question to discuss with a colleague.">✨ What does this mean for me?</button></div></div>';
    if (NEWS.future && NEWS.future.length) h += '<h2 class="tsec">🚀 Future opportunities to watch</h2><p class="small" style="margin:-4px 0 8px">Projects and markets with strong prospects, each with the evidence and a first step for you. Updated as new evidence appears.</p><div class="nlist">' + NEWS.future.map(function (f) { return '<div class="nitem fut"><b>' + esc(f.title) + '</b><p>' + esc(f.why) + '</p><p class="nwhy">🎯 <b>For you:</b> ' + esc(f.fit) + '</p><p class="small"><b>First step:</b> ' + esc(f.step) + '</p><div class="row" style="margin-top:6px"><a class="btn small" href="' + esc(f.url) + '" target="_blank" rel="noopener">Evidence: ' + esc(f.source) + ' ↗</a><a class="btn small" href="' + ytSearch(f.title) + '" target="_blank" rel="noopener">▶ Watch ↗</a><button class="btn small" data-coach="' + esc("Help me explore this opportunity: " + f.title + ". " + f.why + " How could Carbon Clarity or I pursue it in Ghana in the next 12 months? Give 3 concrete options, rough first costs, who to talk to, and risks. Don't invent figures.") + '">✨ Explore</button></div></div>'; }).join("") + "</div>";
    if (NEWS.good && NEWS.good.length) h += '<h2 class="tsec">🌞 Good news</h2><div class="nlist">' + NEWS.good.map(function (n) { return nItem(n, true); }).join("") + "</div>";
    (NEWS.sections || []).forEach(function (sec) { if (!sec.items || !sec.items.length) return; h += '<h2 class="tsec">' + sec.icon + " " + esc(sec.title) + '</h2><div class="nlist">' + sec.items.map(function (n) { return nItem(n); }).join("") + "</div>"; });
    h += '<p class="hint" style="margin-top:12px">Refreshed every morning before 6:30. Summaries are written in plain words and link to the original reports; open them for the full story.</p>';
    page("tracker-world", h, "World today", "What's happening in the world, Africa, climate and business, plus the good news.");
  }
  function worldMini() {
    if (!NEWS || !NEWS.sections) return "";
    var top = []; NEWS.sections.forEach(function (sec) { if (sec.items && sec.items[0]) top.push([sec.icon, sec.items[0]]); });
    var g = NEWS.good && NEWS.good[Math.floor(Date.now() / 864e5) % NEWS.good.length];
    return '<div class="card"><p class="eyebrow">🌍 World today · ' + fd(NEWS.updated) + "</p>" + top.slice(0, 3).map(function (t) { return '<p style="margin:6px 0">' + t[0] + " " + esc(t[1].title) + "</p>"; }).join("") + (g ? '<p class="ngood">🌞 <b>Good news:</b> ' + esc(g.title) + "</p>" : "") + '<div class="row"><a class="btn pri" href="#tracker-world">Read the briefing</a></div></div>';
  }
  var NCSS = '<style id="newscss">.nlist{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(320px,1fr))}.nitem{padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:var(--card)}.nitem p{margin:6px 0 0}.nitem.good{border-left:5px solid var(--ok)}.nitem.fut{border-left:5px solid #6A3D9A}.nvid{display:block;margin:-4px -6px 8px;border-radius:10px;overflow:hidden;text-decoration:none;color:var(--ink)}.nvid img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;background:#000}.nvid span{display:block;font-size:13px;padding:6px 8px;background:var(--soft)}.nitem a{color:var(--ink)}.nwhy{background:var(--soft);border-radius:8px;padding:6px 8px;font-size:14px}.ngood{background:var(--ok-soft);border-radius:10px;padding:8px 10px;margin:8px 0}@media(max-width:600px){.nlist{grid-template-columns:1fr}}</style>';

  /* ---------- Consistency coach: notices slips and helps you restart ---------- */
  var WHYS = ["You're building Carbon Clarity so the women of James Town breathe cleaner air and earn more. Ten focused minutes moves that forward.", "Your master's abroad starts with today's small steps: one paper, one paragraph, one application task.", "Consistency beats intensity. A 60% day, repeated, changes your life.", "Missing a day is normal. Missing two is a pattern. Today you break it.", "Nobody sees the quiet hours, but every scholarship panel can tell who put them in.", "Start smaller than you think: open the agenda, tick one thing, then the next.", "You've already done hard things: a research plan, a pilot, a business. This is just today's piece.", "Future you, in a lecture hall in London, Toronto or Berlin, is counting on tonight's 45 minutes."];
  function activeDay(k) { return !!((S.visits || {})[k] || Object.keys((S.done || {})[k] || {}).some(function (x) { return S.done[k][x]; }) || S.focus.some(function (f) { return f.date === k; })); }
  function consistency() {
    var t = today(), first = S.first ? pd(S.first) : t, gap = 0, red = 0, green7 = 0, best = 0, run = 0;
    for (var i = 1; i <= 30; i++) { var x = new Date(t); x.setDate(x.getDate() - i); if (x < first) break; if (activeDay(dk(x))) break; gap++; }
    for (var j = 1; j <= 30; j++) { var y = new Date(t); y.setDate(y.getDate() - j); if (y < first) break; if (agScore(y).pct >= 60) break; red++; }
    for (var q = 60; q >= 1; q--) { var z = new Date(t); z.setDate(z.getDate() - q); if (z < first) { run = 0; continue; } if (agScore(z).pct >= 60) { run++; best = Math.max(best, run); } else run = 0; if (q <= 7 && agScore(z).pct >= 60) green7++; }
    var cur = 0; for (var r = 1; r <= 60; r++) { var w = new Date(t); w.setDate(w.getDate() - r); if (w < first) break; if (agScore(w).pct >= 60) cur++; else break; }
    var days7 = Math.min(7, Math.max(0, Math.round((t - first) / 864e5)));
    return { gap: gap, red: red, green7: green7, days7: days7, best: best, cur: cur };
  }
  function coachCard() {
    var c = consistency(), s = stats(), why = WHYS[Math.floor(Date.now() / 864e5) % WHYS.length], comeback = c.gap >= 2 || c.red >= 2;
    if (comeback) return '<div class="card comeback"><p class="eyebrow">💪 Comeback mode</p><h2>' + (c.gap >= 2 ? "Welcome back. You were away " + c.gap + " days." : c.red + " red days in a row. Let's break the pattern today.") + '</h2><p>' + esc(why) + '</p><ol><li><b>2-minute restart:</b> start a 10-minute focus block on the smallest next step.</li><li>Tick one agenda task as soon as it is finished.</li><li>Aim for 60% today, not 100%.</li></ol><p class="small">So far: level ' + s.level + " · " + s.xp.toLocaleString() + " XP · " + s.read + " papers read · " + s.stepsDone + ' research steps done. That progress is still yours.</p><div class="row"><button class="btn pri" data-pomo="Comeback: smallest next step">⏱ 10-minute restart</button><button class="btn" data-coach="I have been inconsistent (' + (c.gap >= 2 ? "away " + c.gap + " days" : c.red + " days below 60%") + '). Be kind but honest. Look at my plan and progress, tell me what probably went wrong, and give me a realistic comeback plan for the next 3 days with tiny first steps.">✨ Make my comeback plan</button></div></div>';
    return '<div class="card cons"><p class="eyebrow">🔥 Consistency</p><p><b>' + c.green7 + " of " + (c.days7 || 7) + "</b> green days this week · current run <b>" + c.cur + "</b> · best <b>" + c.best + '</b></p><p class="small">' + esc(why) + "</p></div>";
  }
  /* ---------- Carbon Clarity HQ ---------- */
  var WPL = null;
  function wpLoad(cb) { if (WPL) { if (cb) cb(); return; } fetch("/api/tasks", { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { WPL = (j && j.tasks) || []; if (cb) cb(); }).catch(function () { WPL = []; if (cb) cb(); }); }
  function ccOpen() { return (WPL || []).filter(function (t) { return t.status !== "done" && t.title; }).sort(function (a, b) { return (a.status === "doing" ? -1 : 0) - (b.status === "doing" ? -1 : 0) || String(a.due || "9").localeCompare(String(b.due || "9")); }); }
  var CCLINKS = [["🏠", "Carbon Clarity home", "index.html"], ["📋", "Project work plan", "workplan.html"], ["🔥", "Comparative pilot", "pilot.html"], ["🌍", "Research summary", "research.html"], ["⏱", "Focus timer page", "focus.html"], ["📚", "Learning dashboard", "#home"]];
  function ccMini() {
    var L = ccOpen(), all = WPL || [], dn = all.filter(function (t) { return t.status === "done"; }).length;
    return '<div class="card ccmini"><p class="eyebrow">🔥 Carbon Clarity today</p>' + (L[0] ? "<p><b>Top task:</b> " + esc(L[0].title) + (L[0].due ? ' <span class="small">· due ' + fd(L[0].due) + "</span>" : "") + (L[0].status === "doing" ? " " + pill("in progress") : "") + "</p>" : '<p class="small">Open your work plan to set today\'s top task.</p>') + (all.length ? '<p class="small">' + dn + " of " + all.length + " project tasks done</p>" + bar(all.length ? dn / all.length : 0) : "") + '<div class="row">' + (L[0] ? '<button class="btn pri small" data-pomo="' + esc(L[0].title) + '">⏱ Start it</button>' : "") + '<a class="btn small" href="#tracker-cc">Open Carbon Clarity HQ</a><a class="btn small" href="workplan.html">Work plan</a></div></div>';
  }
  function ccPage() {
    if (!WPL) { wpLoad(ccPage); return; }
    var L = ccOpen(), all = WPL, by = {}; all.forEach(function (t) { by[t.status] = (by[t.status] || 0) + 1; });
    var over = L.filter(function (t) { return t.due && daysTo(t.due) < 0; }), soon = L.filter(function (t) { return t.due && daysTo(t.due) >= 0 && daysTo(t.due) <= 7; });
    var docs = window.DOCS || [];
    var h = '<div class="card"><div class="kpis">' + kpi(all.length ? Math.round((by.done || 0) / all.length * 100) + "%" : "–", "of project tasks done") + kpi(by.doing || 0, "in progress") + kpi(over.length, "overdue", over.length > 0) + kpi(soon.length, "due in 7 days", soon.length > 0) + '</div><div class="row"><a class="btn pri" href="workplan.html">Open the work plan</a><button class="btn" data-coach="Look at my Carbon Clarity work plan tasks and my timetable. What are the 3 most important things to move this week, and in which time blocks should I do them?">✨ Plan my Carbon Clarity week</button></div></div>';
    h += '<div class="card"><h2>Next up</h2>' + (L.length ? '<ul class="clean">' + L.slice(0, 8).map(function (t) { var n = t.due ? daysTo(t.due) : null; return '<li style="display:block;padding:8px 0;border-bottom:1px solid var(--line)"><b>' + esc(t.title) + "</b> " + (t.status === "doing" ? pill("in progress") : t.status === "blocked" ? pill("blocked", true) : "") + '<div class="small">' + (t.stream ? esc(t.stream) + " · " : "") + (t.owner ? esc(t.owner) + " · " : "") + (t.due ? "due " + fd(t.due) + (n < 0 ? " (overdue)" : n <= 7 ? " (in " + n + " days)" : "") : "no date") + '</div><div class="row" style="margin-top:6px"><button class="btn small" data-pomo="' + esc(t.title) + '">⏱ Focus on this</button></div></li>'; }).join("") + "</ul>" : '<p class="small">No open tasks found. Add them in the work plan.</p>') + "</div>";
    h += '<h2 class="tsec">Everything for Carbon Clarity</h2><div class="tbox">' + CCLINKS.map(function (t) { return '<a class="tool" href="' + t[2] + '"><span>' + t[0] + "</span><b>" + t[1] + "</b></a>"; }).join("") + docs.map(function (d2) { var ext = /^https?:/.test(d2[2]); return '<a class="tool" href="' + esc(d2[2]) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + "><span>📄</span><b>" + esc(d2[0]) + (ext ? " ↗" : "") + "</b><small>" + esc(d2[1] || "") + "</small></a>"; }).join("") + "</div>";
    var cl = NEWS && NEWS.sections ? (NEWS.sections.filter(function (x) { return x.id === "climate"; })[0] || {}).items || [] : [];
    if (cl.length) h += '<h2 class="tsec">🌍 Climate and carbon news today</h2><div class="nlist">' + cl.map(function (n) { return nItem(n); }).join("") + "</div>";
    page("tracker-cc", h, "Carbon Clarity HQ", "Your project, every day: top tasks, deadlines, documents and the news that affects it.");
  }
  var HQCSS = '<style id="hqcss">.comeback{border-left:8px solid var(--ember);background:var(--ember-soft)}.comeback h2{margin:4px 0}.comeback ol{margin:8px 0;padding-left:20px}.cons{border-left:6px solid var(--accent)}.ccmini{border-left:6px solid var(--ember)}</style>';

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
      (evs.length ? "<h3 style=\"margin-top:16px\">Verify a fact</h3><ul class=\"clean\">" + evs.map(function (e) { return '<li style="display:block;padding:10px 0;border-bottom:1px solid var(--line)">' + esc(e.claim) + ' <span class="pill">' + esc(evVer(e)) + '</span><div class="small">' + esc(e.check || "") + "</div></li>"; }).join("") + "</ul>" : "") +
      '<div class="row"><a class="btn pri" href="#tracker">Open research tracker</a><a class="btn" href="#tracker-focus">Log today\'s focus</a><a class="btn" href="#tracker-evidence">Evidence log</a></div></div>';
    h = css() + miniToday(today()) + h.slice(css().length);
    el.innerHTML = h; wireDigest(el, function () { panel(el); });
    wireVid(el, function () { panel(el); });
    Array.prototype.forEach.call(el.querySelectorAll("[data-pclose]"), function (b) { b.onclick = function () { S.gaps[b.dataset.pclose] = { status: "Closed" }; save("Gap closed: +20 XP"); panel(el); }; });
    Array.prototype.forEach.call(el.querySelectorAll("[data-pread]"), function (b) { b.onclick = function () { var i = b.dataset.pread; S.lit[i] = S.lit[i] || {}; S.lit[i].s = "Read"; S.lit[i].c = 1; save("Paper read: +10 XP"); panel(el); }; });
  }
  var VIEWS = { "tracker": dashboard, "tracker-time": function () { timetable(0); }, "tracker-steps": steps, "tracker-evidence": function () { evidence(); }, "tracker-gaps": gaps, "tracker-lit": lit, "tracker-sites": function () { sites(); }, "tracker-dirs": dirs, "tracker-focus": focus, "tracker-reflect": reflect, "tracker-growth": growth, "tracker-backup": backup, "tracker-ai": coachPage, "tracker-pomo": pomoPage, "today": todayView, "tracker-opps": oppsPage, "tracker-alerts": alertsPage, "tracker-world": worldPage, "tracker-cc": function () { ensureNews(ccPage); } };
  function show(id) {
    load();
    if (!D) { render('<div class="card"><p>Loading your research tracker…</p></div>', "tracker"); fetch(BASE + "data/tracker.json").then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) { D = j; show(id); }).catch(function () { render('<div class="card"><h1>Research tracker</h1><p>The tracker could not load. Check your connection and refresh the page.</p></div>', "tracker"); }); return; }
    S.visits = S.visits || {}; if (!S.first) S.first = dk(today()); S.visits[dk(today())] = 1; sj(KEY, S);
    ensureLit(function () { ensureOpps(function () { (VIEWS[id] || dashboard)(); bellUpdate(); }); });
  }
  function todayCard(el) {
    load();
    if (!D) { fetch(BASE + "data/tracker.json").then(function (r) { return r.json(); }).then(function (j) { D = j; todayCard(el); }).catch(function () {}); return; }
    if (!LIT) { el.innerHTML = '<div class="card"><p class="hint">Loading your day…</p></div>'; ensureLit(function () { todayCard(el); }); return; }
    el.innerHTML = css() + miniToday(today());
    wireDigest(el, function () { todayCard(el); });
  }
  if (!window.__ccCoachClick) { window.__ccCoachClick = 1; document.addEventListener("click", function (e) { var t = e.target.closest && e.target.closest("[data-coach]"); if (t) { e.preventDefault(); openCoach(t.dataset.coach); return; } var pm = e.target.closest && e.target.closest("[data-pomo]"); if (pm) { e.preventDefault(); pstart(pm.dataset.pomo); var dr = document.querySelector("#ccPomo .pdraw"); if (dr) dr.hidden = false; pdraw(); toast("Focus started: " + pm.dataset.pomo.slice(0, 40)); } }); }
  window.CCTracker = { show: show, panel: panel, today: todayCard, fab: fab, coach: openCoach, _p: function () { return P; } };
  try { fab(); } catch (e) {}
})();
