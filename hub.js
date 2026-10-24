// hub.js — the home page of mecatrobot: a hub that sends you to the right place.
// It is built from the catalog in nav.js (robots, courses, tools), so a new robot or tool added there shows up here, in the menu and in the search at once.
(function () {
  'use strict';
  function start() {
    var MB = window.MB, cat = MB.catalog, ui = MB.ui, ico = MB.icon;
    var T = function (o) { return o; };
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var root = document.getElementById('hub');
    if (!root) return;
    var robotById = {}; cat.robots.forEach(function (r) { robotById[r.id] = r; });
    var courseById = {}; cat.courses.forEach(function (c) { courseById[c.id] = c; });
    var toolById = {}; cat.tools.forEach(function (t) { toolById[t.id] = t; });

    // ------------------------------------------------------------------ small kinematic glyphs, one per robot
    var G = {
      arm: '<path d="M10 52h20M20 52V44"/><path d="M20 44 34 24 52 30"/><circle cx="20" cy="44" r="3.4"/><circle cx="34" cy="24" r="3.4"/><circle class="o" cx="52" cy="30" r="3"/>',
      gantry: '<path d="M8 16h48M8 16v34h48V16M16 16v34"/><path d="M16 30h28"/><rect x="40" y="26" width="8" height="8" rx="1.5"/><path class="o" d="M44 34v10"/>',
      scara: '<path d="M10 52h14M17 52V40"/><path d="M17 40h22l10-10"/><circle cx="17" cy="40" r="3.4"/><circle cx="39" cy="40" r="3.4"/><path class="o" d="M49 30v16"/><circle class="o" cx="49" cy="30" r="2.6"/>',
      articulated: '<path d="M8 54h22M19 54V44"/><path d="M19 44V26l16-10 16 8"/><circle cx="19" cy="44" r="3.2"/><circle cx="19" cy="26" r="3.2"/><circle cx="35" cy="16" r="3.2"/><path class="o" d="M51 24l5 6"/><circle class="o" cx="51" cy="24" r="2.8"/>',
      cobot: '<path d="M8 54h22M19 54V46"/><path d="M19 46V30l18-8 8 14"/><circle cx="19" cy="46" r="3.6"/><circle cx="19" cy="30" r="3.6"/><circle cx="37" cy="22" r="3.6"/><path class="o" d="M45 36l8 4"/><circle class="o" cx="45" cy="36" r="2.8"/><path d="M5 10 12 6M5 18l7-2" opacity=".5"/>',
      delta: '<path d="M12 14h40"/><path d="M20 14l8 16M32 14v16M44 14l-8 16"/><path d="M26 30l-2 16M32 30v16M38 30l2 16"/><path class="o" d="M22 46h20"/>',
      mobile: '<rect x="18" y="14" width="28" height="36" rx="5"/><rect x="12" y="20" width="6" height="12" rx="1.5"/><rect x="46" y="20" width="6" height="12" rx="1.5"/><path class="o" d="M32 42V26M27 31l5-5 5 5"/>',
      wheels: '<circle cx="32" cy="32" r="20"/><circle cx="32" cy="32" r="5"/><path d="M32 12v15M32 37v15M12 32h15M37 32h15" opacity=".6"/><path class="o" d="M17 17l30 30" opacity=".0"/>'
    };
    var glyph = function (id) { return '<svg class="glyph" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (G[id] || '') + '</svg>'; };

    // ------------------------------------------------------------------ the learning paths: three ways in
    var PATHS = [
      { id: 'beginner', icon: 'play', name: 'I am new to robots', tag: 'No maths needed. Learn what a robot is made of, and play with the simplest ones.',
        steps: [['course', 'learn'], ['robot', 'arm'], ['robot', 'gantry'], ['robot', 'mobile'], ['tool', 'arm2']] },
      { id: 'builder', icon: 'tool', name: 'I want to build one', tag: 'Wheels, drive types, motors and control: what you need before you pick up a screwdriver.',
        steps: [['robot', 'mobile'], ['robot', 'wheels'], ['tool', 'diff'], ['tool', 'pid'], ['course', 'ctrl'], ['robot', 'scara']] },
      { id: 'curious', icon: 'sigma', name: 'I want to understand deeply', tag: 'The maths of motion: frames, DH tables, Jacobians, singularities and dynamics.',
        steps: [['course', 'maths'], ['tool', 'dh'], ['robot', 'articulated'], ['robot', 'cobot'], ['course', 'sing'], ['course', 'model']] }
    ];
    var stepInfo = function (s) {
      if (s[0] === 'robot') { var r = robotById[s[1]]; return { href: r.href, name: T(r.name), type: ui.typeResults.robot, id: r.id, track: true }; }
      if (s[0] === 'course') { var c = courseById[s[1]]; return { href: c.href, name: T(c.name), type: ui.typeResults.course, id: c.id, track: true }; }
      var t = toolById[s[1]]; return { href: 'tools.html#' + t.id, name: T(t.name), type: ui.typeResults.tool, id: t.id, track: false };
    };

    // ------------------------------------------------------------------ page
    var kinds = [['all', 'All'], ['serial', ui.serial], ['parallel', ui.parallel], ['mobile', ui.mobile]];
    var join = cat.links.join;
    var soc = cat.links.social.map(function (s) { return '<a href="' + s[1] + '" target="_blank" rel="noopener" aria-label="' + s[0] + '" title="' + s[0] + '">' + s[2] + '</a>'; }).join('');
    var featuredTools = ['arm2', 'dh', 'diff', 'pid', 'astar', 'kalman'];

    root.innerHTML =
      // ---------- hero
      '<section class="hero" id="top">' +
        '<div class="hero-text">' +
          '<p class="eyebrow"><span class="dot"></span>Mecatro Club · interactive learning platform</p>' +
          '<h1>Learn robots by <em>moving</em> them.</h1>' +
          '<p class="lead">Eight robots, each with a 3D model you can move, its kinematic diagram, the DH table and the maths behind it. Short lessons, small tools, no installation, no prior knowledge needed.</p>' +
          '<form class="hero-search" role="search" id="heroSearch"><span class="ic-wrap">' + ico('search') + '</span><input type="search" autocomplete="off" placeholder="' + esc(ui.searchPh) + '" aria-label="' + esc(ui.search) + '"><button type="submit" class="btn">Search</button></form>' +
          '<div class="cta"><a class="btn" href="#paths">Choose your path' + ico('arrow') + '</a><a class="btn ghost" href="#robots">Browse the robots</a></div>' +
        '</div>' +
        '<figure class="hero-view" aria-hidden="true"><div id="heroView"></div><figcaption><span>q1…q6</span><span class="mono">DH · 6 × R</span></figcaption></figure>' +
      '</section>' +
      '<ul class="stats" aria-label="mecatrobot">' +
        '<li><b>' + cat.robots.length + '</b><span>robots</span></li>' +
        '<li><b>' + cat.courses.length + '</b><span>courses</span></li>' +
        '<li><b>' + cat.tools.length + '</b><span>tools</span></li>' +
        '<li><b>3D</b><span>interactive models</span></li>' +
      '</ul>' +
      // ---------- paths
      '<section class="block" id="paths"><div class="block-h"><p class="eyebrow">Start here</p><h2>Pick the way that fits you</h2>' +
        '<p>Three short paths through the platform. Your progress is saved in this browser.</p></div>' +
        '<div class="paths">' + PATHS.map(function (p) {
          return '<article class="path" data-path="' + p.id + '"><header>' + ico(p.icon) + '<h3>' + p.name + '</h3></header><p>' + p.tag + '</p>' +
            '<ol>' + p.steps.map(function (s, i) { var f = stepInfo(s); return '<li data-id="' + f.id + '" data-track="' + (f.track ? 1 : 0) + '"><a href="' + f.href + '"><span class="n">' + (i + 1) + '</span><span class="t">' + esc(f.name) + '</span><em>' + f.type + '</em></a></li>'; }).join('') + '</ol>' +
            '<div class="path-foot"><div class="rm-bar"><i></i></div><span class="mono cnt"></span></div></article>';
        }).join('') + '</div></section>' +
      // ---------- robots
      '<section class="block" id="robots"><div class="block-h"><p class="eyebrow">The robots</p><h2>Eight robots, one way to look at them</h2>' +
        '<p>Every robot page has the same tabs: a 3D model, the diagram, the DH table, the formulas and where it is used.</p></div>' +
        '<div class="chips" role="group" aria-label="' + esc(ui.type) + '">' + kinds.map(function (k, i) { return '<button type="button" class="chip" data-kind="' + k[0] + '" aria-pressed="' + (i === 0) + '">' + k[1] + '</button>'; }).join('') + '</div>' +
        '<div class="rgrid">' + cat.robots.map(function (r) {
          return '<a class="rcard" href="' + r.href + '" data-kind="' + r.kind + '" data-id="' + r.id + '"><div class="rc-top"><span class="rc-g">' + glyph(r.id) + '</span><span class="tb-code">' + esc(r.code) + '</span><span class="rc-done" title="' + esc(ui.doneOn) + '">✓</span></div>' +
            '<h3>' + esc(T(r.name)) + '</h3><p>' + esc(T(r.tag)) + '</p><dl><div><dt>' + ui.dof + '</dt><dd class="mono">' + esc(r.dof) + '</dd></div><div><dt>' + ui.level + '</dt><dd>' + MB.lvDots(r.level) + ' ' + ui.lv[r.level - 1] + '</dd></div><div><dt>' + ui.time + '</dt><dd><span class="mono">~' + r.min + '</span> ' + ui.min + '</dd></div></dl>' +
            '<div class="rc-use"><b>Used in</b> ' + esc(T(r.used)) + '</div></a>';
        }).join('') + '</div></section>' +
      // ---------- courses
      '<section class="block" id="courses"><div class="block-h"><p class="eyebrow">Courses</p><h2>Go as deep as you like</h2>' +
        '<p>From a twelve-lesson introduction to a full master-level course. Lessons are short and end with a check question.</p></div>' +
        '<div class="cgrid">' + cat.courses.map(function (c) {
          return '<a class="ccard" href="' + c.href + '" data-id="' + c.id + '" data-prefix="' + c.prefix + '" data-total="' + c.total + '"><div class="cc-top">' + ico('book') + '<span class="lvl">' + MB.lvDots(c.level) + ' ' + ui.lv[c.level - 1] + '</span></div><h3>' + esc(T(c.name)) + '</h3><p>' + esc(T(c.tag)) + '</p>' +
            '<div class="cc-foot"><div class="rm-bar"><i></i></div><span class="mono cnt"></span><span class="mono mins">~' + c.min + ' ' + ui.min + '</span></div></a>';
        }).join('') + '</div></section>' +
      // ---------- tools
      '<section class="block" id="tools"><div class="block-h"><p class="eyebrow">Tools</p><h2>Small tools you can use right now</h2>' +
        '<p>Calculators and simulators from the lessons, gathered in one page: kinematics, DH tables, motion, control, planning and filters.</p></div>' +
        '<div class="tgrid">' + featuredTools.map(function (id) { var t = toolById[id]; return '<a class="tcard" href="tools.html#' + t.id + '">' + ico('tool') + '<div><h3>' + esc(T(t.name)) + '</h3><p>' + esc(T(t.tag)) + '</p></div></a>'; }).join('') + '</div>' +
        '<p class="more"><a class="btn ghost" href="tools.html">See all the tools' + ico('arrow') + '</a></p></section>' +
      // ---------- the club
      '<section class="block club" id="club"><div class="club-box"><div><p class="eyebrow">Mecatro Club</p><h2>Built by a club, for everyone who likes robots</h2>' +
        '<p>mecatrobot is the learning platform of Mecatro Club. Come to our workshops, ask questions, build things with us. Everyone is welcome, whatever your level.</p>' +
        '<p class="fac">' + esc(T(cat.faculty)) + '</p>' +
        '<div class="cta"><a class="btn" href="' + join + '" target="_blank" rel="noopener">' + ico('join') + ui.join + '</a><a class="btn ghost" href="' + cat.links.hub + '" target="_blank" rel="noopener">All our links</a></div></div>' +
        '<div class="club-soc" aria-label="' + esc(ui.contact) + '">' + soc + '</div></div></section>';

    // ------------------------------------------------------------------ behaviour
    // search: Enter opens the palette with the text typed in the hero, or goes straight to a single result
    var form = document.getElementById('heroSearch'), inp = form.querySelector('input');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var res = MB.search(inp.value, 5);
      if (res.length === 1) { location.href = res[0].href; return; }
      MB.openSearch();
      var pi = document.querySelector('.pal-in input'); if (pi) { pi.value = inp.value; pi.dispatchEvent(new Event('input')); }
    });
    // filter chips
    var chips = root.querySelectorAll('.chip'), cards = root.querySelectorAll('.rcard');
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (o) { o.setAttribute('aria-pressed', String(o === c)); });
        cards.forEach(function (card) { card.hidden = !(c.dataset.kind === 'all' || card.dataset.kind === c.dataset.kind); });
      });
    });
    // progress (robots and courses are ticked on their own pages)
    var P = MB.progress;
    var courseCount = function (c) { var n = 0; for (var i = 1; i <= c.total; i++) if (P.get(c.prefix + i)) n++; return n; };
    function paint() {
      cards.forEach(function (card) { card.classList.toggle('done', P.get(card.dataset.id)); });
      root.querySelectorAll('.ccard').forEach(function (a) {
        var c = courseById[a.dataset.id], n = courseCount(c);
        a.querySelector('.cnt').textContent = n + ' / ' + c.total; a.querySelector('.rm-bar i').style.width = Math.round(n / c.total * 100) + '%'; a.classList.toggle('complete', n === c.total);
      });
      root.querySelectorAll('.path').forEach(function (p) {
        var done = 0, tot = 0, next = null;
        p.querySelectorAll('li').forEach(function (li) {
          if (li.dataset.track !== '1') return;
          tot++;
          var id = li.dataset.id, ok = courseById[id] ? courseCount(courseById[id]) === courseById[id].total : P.get(id);
          li.classList.toggle('done', ok); if (ok) done++; else if (!next) next = li;
        });
        p.querySelectorAll('li').forEach(function (li) { li.classList.toggle('next', li === next); });
        p.querySelector('.cnt').textContent = done + ' / ' + tot; p.querySelector('.rm-bar i').style.width = Math.round(done / tot * 100) + '%';
      });
    }
    window.addEventListener('mb-progress', paint); paint();
    // a #hash on the home page (for example #paths) scrolls after the page was built
    if (location.hash && document.getElementById(location.hash.slice(1))) setTimeout(function () { document.getElementById(location.hash.slice(1)).scrollIntoView(); }, 50);
  }
  if (window.MB && window.MB.ready) start(); else window.addEventListener('mb-ready', start);
})();
