/* Shared behaviour for the Instagram System Design guide.
   Lesson pages only contain <article class="lesson">; this script builds the chrome around it. */
(function () {
  "use strict";
  var CONCEPTS = window.CONCEPTS || [], PARTS = window.PARTS || [];
  var STORE_KEY = "igsd-learned-v1";
  var body = document.body;
  var page = body.getAttribute("data-page");
  var slug = body.getAttribute("data-slug");
  var inConcepts = page === "concept";
  var lessonHref = function (s) { return (inConcepts ? "" : "concepts/") + s + ".html"; };
  var homeHref = inConcepts ? "../index.html" : "index.html";

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in (attrs || {})) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function bySlug(s) { for (var i = 0; i < CONCEPTS.length; i++) if (CONCEPTS[i].slug === s) return CONCEPTS[i]; return null; }
  function partOf(id) { for (var i = 0; i < PARTS.length; i++) if (PARTS[i].id === id) return PARTS[i]; return null; }
  function indexOf(s) { for (var i = 0; i < CONCEPTS.length; i++) if (CONCEPTS[i].slug === s) return i; return -1; }

  // ---------- progress (localStorage) ----------
  function getLearned() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; } }
  function setLearned(s, v) {
    var m = getLearned(); if (v) m[s] = Date.now(); else delete m[s];
    try { localStorage.setItem(STORE_KEY, JSON.stringify(m)); } catch (e) {}
    refreshProgress();
  }
  function refreshProgress() {
    var m = getLearned(), n = 0;
    CONCEPTS.forEach(function (c) { if (m[c.slug]) n++; });
    document.querySelectorAll("[data-progress-text]").forEach(function (e) { e.textContent = n + " / " + CONCEPTS.length + " learned"; });
    document.querySelectorAll("[data-progress-bar]").forEach(function (e) { e.style.width = (100 * n / CONCEPTS.length) + "%"; });
    document.querySelectorAll("[data-lesson-slug]").forEach(function (e) {
      e.classList.toggle("done", !!m[e.getAttribute("data-lesson-slug")]);
    });
  }

  // ---------- top bar ----------
  function buildTopbar() {
    var bar = el("header", { "class": "topbar" });
    bar.innerHTML =
      (inConcepts ? '<button class="menu-btn" aria-label="Toggle menu">☰</button>' : "") +
      '<a class="brand" href="' + homeHref + '"><span class="logo"></span>Instagram System Design</a>' +
      '<span class="spacer"></span>' +
      '<a class="top-link" href="' + homeHref + '#diagram">🗺️ Diagram</a>' +
      '<a class="top-link" href="' + homeHref + '#path">📚 Lessons</a>' +
      '<a class="top-link" href="' + lessonHref("glossary") + '">📖 Glossary</a>' +
      '<span class="progress-pill"><span class="progress-bar"><span data-progress-bar></span></span><span data-progress-text></span></span>';
    body.insertBefore(bar, body.firstChild);
    var mb = bar.querySelector(".menu-btn");
    if (mb) mb.addEventListener("click", function () { document.querySelector(".sidebar").classList.toggle("open"); });
  }

  // ---------- sidebar ----------
  function buildSidebar() {
    var nav = el("nav", { "class": "sidebar", "aria-label": "Lessons" });
    var html = '<a class="home-link" href="' + homeHref + '#diagram">🗺️ Back to the architecture diagram</a>' +
      '<input class="search" type="search" placeholder="Filter lessons…" aria-label="Filter lessons">';
    var n = 0;
    PARTS.forEach(function (p) {
      html += '<div class="part-block"><div class="part-title">' + esc(p.title) + "</div><ul>";
      CONCEPTS.filter(function (c) { return c.part === p.id; }).forEach(function (c) {
        n++;
        html += '<li><a data-lesson-slug="' + c.slug + '" href="' + lessonHref(c.slug) + '"' + (c.slug === slug ? ' class="active"' : "") +
          '><span class="num">' + n + '</span><span class="t">' + esc(c.title) + '</span><span class="check">✓</span></a></li>';
      });
      html += "</ul></div>";
    });
    nav.innerHTML = html;
    var input = nav.querySelector(".search");
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      nav.querySelectorAll(".part-block").forEach(function (b) {
        var any = false;
        b.querySelectorAll("li").forEach(function (li) {
          var c = bySlug(li.firstChild.getAttribute("data-lesson-slug"));
          var hit = !q || (c.title + " " + c.summary).toLowerCase().indexOf(q) >= 0;
          li.style.display = hit ? "" : "none"; any = any || hit;
        });
        b.style.display = any ? "" : "none";
      });
    });
    return nav;
  }

  // ---------- lesson page ----------
  function buildLesson() {
    var c = bySlug(slug), idx = indexOf(slug);
    var article = document.querySelector("article.lesson");
    if (!c || !article) return;
    document.title = c.title + " — Instagram System Design";
    buildTopbar();

    var layout = el("div", { "class": "layout" });
    var main = el("main", { "class": "content" });
    var toc = el("aside", { "class": "toc", "aria-label": "On this page" });
    layout.appendChild(buildSidebar());
    layout.appendChild(main);
    layout.appendChild(toc);
    article.parentNode.insertBefore(layout, article);

    var part = partOf(c.part);
    var words = (article.textContent || "").split(/\s+/).length;
    var mins = Math.max(3, Math.round(words / 200));
    var header = el("div", { "class": "lesson-header" });
    header.innerHTML =
      '<div class="breadcrumb"><a href="' + homeHref + '">Home</a> › <a href="' + homeHref + '#part-' + part.id + '">' + esc(part.title) + "</a> › Lesson " + (idx + 1) + "</div>" +
      '<span class="chip">' + esc(part.title.split("·")[1] || part.title).trim() + "</span>" +
      "<h1>" + esc(c.title) + "</h1>" +
      '<p class="summary">' + esc(c.summary) + "</p>" +
      '<div class="lesson-meta"><span>⏱️ ~' + mins + " min read</span><span>·</span><span>Lesson " + (idx + 1) + " of " + CONCEPTS.length + "</span>" +
      '<a class="btn" href="' + homeHref + "?focus=" + c.slug + '#diagram">📍 Show on diagram</a>' +
      '<button class="btn" data-learn-btn></button></div>';
    main.appendChild(header);
    main.appendChild(article);

    var actions = el("div", { "class": "lesson-actions" });
    actions.innerHTML = '<button class="btn" data-learn-btn></button>' +
      '<a class="btn" href="' + homeHref + "?focus=" + c.slug + '#diagram">📍 Show on diagram</a>' +
      '<a class="btn" href="' + homeHref + '#path">📚 All lessons</a>';
    main.appendChild(actions);

    var prev = CONCEPTS[idx - 1], next = CONCEPTS[idx + 1];
    var pager = el("nav", { "class": "pager" });
    pager.innerHTML =
      (prev ? '<a class="prev" href="' + lessonHref(prev.slug) + '"><div class="lbl">← Previous</div><div class="ttl">' + esc(prev.title) + "</div></a>" : "<span></span>") +
      (next ? '<a class="next" href="' + lessonHref(next.slug) + '"><div class="lbl">Next →</div><div class="ttl">' + esc(next.title) + "</div></a>" : "");
    main.appendChild(pager);

    document.querySelectorAll("[data-learn-btn]").forEach(function (b) {
      b.addEventListener("click", function () { setLearned(slug, !getLearned()[slug]); paintLearn(); });
    });
    function paintLearn() {
      var done = !!getLearned()[slug];
      document.querySelectorAll("[data-learn-btn]").forEach(function (b) {
        b.textContent = done ? "✅ Learned" : "☐ Mark as learned";
        b.classList.toggle("learned", done);
      });
    }
    paintLearn();
    buildToc(article, toc);
    var active = document.querySelector(".sidebar a.active");
    if (active) active.scrollIntoView({ block: "center" });
  }

  function slugify(t) { return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60); }

  function buildToc(article, toc) {
    var heads = article.querySelectorAll("h2, h3");
    if (!heads.length) return;
    var used = {}, html = "<h4>On this page</h4>";
    heads.forEach(function (h) {
      if (!h.id) { var id = slugify(h.textContent) || "s"; while (used[id]) id += "-x"; h.id = id; }
      used[h.id] = 1;
      html += '<a href="#' + h.id + '"' + (h.tagName === "H3" ? ' class="sub"' : "") + ">" + esc(h.textContent) + "</a>";
    });
    toc.innerHTML = html;
    var links = toc.querySelectorAll("a");
    function onScroll() {
      var cur = null;
      heads.forEach(function (h) { if (h.getBoundingClientRect().top < 110) cur = h.id; });
      links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + cur); });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---------- home page ----------
  function buildHome() {
    buildTopbar();
    // learning path
    var path = document.getElementById("path-list");
    if (path) {
      var n = 0, html = "";
      PARTS.forEach(function (p) {
        html += '<div class="path-part" id="part-' + p.id + '"><h3>' + esc(p.title) + '</h3><p class="pdesc">' + esc(p.desc) + '</p><div class="lesson-cards">';
        CONCEPTS.filter(function (c) { return c.part === p.id; }).forEach(function (c) {
          n++;
          html += '<a class="lesson-card" data-lesson-slug="' + c.slug + '" href="' + lessonHref(c.slug) + '"><div class="lc-num">Lesson ' + n +
            '</div><div class="lc-title">' + esc(c.title) + '</div><div class="lc-sum">' + esc(c.summary) + '</div><span class="lc-done">✓</span></a>';
        });
        html += "</div></div>";
      });
      path.innerHTML = html;
    }
    var cnt = document.querySelector("[data-lesson-count]");
    if (cnt) cnt.textContent = CONCEPTS.length;
    initDiagram();
  }

  // ---------- interactive diagram ----------
  function initDiagram() {
    var svg = document.getElementById("arch");
    if (!svg) return;
    var tip = el("div", { "class": "tooltip" });
    body.appendChild(tip);
    svg.querySelectorAll("[data-concept]").forEach(function (a) {
      var c = bySlug(a.getAttribute("data-concept"));
      if (!c) return;
      a.addEventListener("mousemove", function (ev) {
        var label = a.getAttribute("data-label");
        tip.innerHTML = "<b>" + esc(label || c.title) + "</b>" + (label ? '<span style="color:#cbd5e1">Lesson: ' + esc(c.title) + "</span><br>" : "") +
          esc(c.summary) + '<span class="go">Click to open the lesson →</span>';
        var x = ev.clientX + 16, y = ev.clientY + 16;
        if (x + 320 > window.innerWidth) x = ev.clientX - 326;
        if (y + 150 > window.innerHeight) y = ev.clientY - 150;
        tip.style.left = x + "px"; tip.style.top = y + "px"; tip.style.opacity = 1;
      });
      a.addEventListener("mouseleave", function () { tip.style.opacity = 0; });
    });

    // ?focus=slug -> pulse matching nodes
    var m = /[?&]focus=([a-z0-9-]+)/.exec(location.search);
    if (m) {
      var hits = svg.querySelectorAll('[data-concept="' + m[1] + '"]');
      hits.forEach(function (h) { h.classList.add("focus"); });
      var c = bySlug(m[1]);
      var note = document.getElementById("focus-note");
      if (note && c) {
        note.innerHTML = hits.length
          ? '📍 Highlighting <b>' + esc(c.title) + '</b> on the diagram. <a href="' + lessonHref(c.slug) + '">Back to the lesson →</a>'
          : '📍 <b>' + esc(c.title) + '</b> is a cross-cutting concept — see the strip at the bottom of the diagram. <a href="' + lessonHref(c.slug) + '">Back to the lesson →</a>';
        note.style.display = "block";
      }
      if (hits[0]) setTimeout(function () { hits[0].scrollIntoView({ block: "center", inline: "center" }); }, 150);
    }
    initFlows(svg);
  }

  function initFlows(svg) {
    var FLOWS = window.FLOWS || [];
    var bar = document.getElementById("flow-buttons"), panel = document.getElementById("flow-panel");
    if (!bar || !panel || !FLOWS.length) return;
    var cur = null, step = 0;
    FLOWS.forEach(function (f, i) {
      var b = el("button", { "class": "btn flow-btn", "type": "button" }, f.icon + " " + esc(f.title));
      b.addEventListener("click", function () { if (cur === i) stop(); else { cur = i; step = 0; render(); } });
      bar.appendChild(b);
    });
    var reset = el("button", { "class": "btn", "type": "button" }, "✖ Clear");
    reset.addEventListener("click", stop);
    bar.appendChild(reset);

    function stop() {
      cur = null; svg.classList.remove("flow-active");
      svg.querySelectorAll(".hl").forEach(function (e) { e.classList.remove("hl"); });
      bar.querySelectorAll(".flow-btn").forEach(function (b) { b.classList.remove("active"); });
      panel.classList.remove("show");
    }
    function render() {
      var f = FLOWS[cur], s = f.steps[step];
      bar.querySelectorAll(".flow-btn").forEach(function (b, i) { b.classList.toggle("active", i === cur); });
      svg.classList.add("flow-active");
      svg.querySelectorAll(".hl").forEach(function (e) { e.classList.remove("hl"); });
      (s.nodes || []).forEach(function (id) { var e = document.getElementById("n-" + id); if (e) e.classList.add("hl"); });
      (s.edges || []).forEach(function (id) { var e = document.getElementById("e-" + id); if (e) e.classList.add("hl"); });
      var learn = (s.learn || []).map(function (sl) { var c = bySlug(sl); return c ? '<a href="' + lessonHref(sl) + '">' + esc(c.title) + "</a>" : ""; }).join("");
      var dots = f.steps.map(function (_, i) { return '<span data-i="' + i + '" class="' + (i <= step ? "on" : "") + '"></span>'; }).join("");
      panel.innerHTML =
        '<div class="fp-head"><span class="fp-title">' + f.icon + " " + esc(f.title) + '</span><span class="fp-step">Step ' + (step + 1) + " of " + f.steps.length + "</span>" +
        '<span class="fp-nav"><button class="btn" data-prev ' + (step === 0 ? "disabled" : "") + '>← Prev</button><button class="btn primary" data-next>' +
        (step === f.steps.length - 1 ? "Finish ✓" : "Next →") + "</button></span></div>" +
        '<div class="fp-text"><b>' + esc(s.title) + ".</b> " + s.text + "</div>" +
        (learn ? '<div class="fp-learn">📘 Learn more: ' + learn + "</div>" : "") +
        '<div class="flow-dots">' + dots + "</div>";
      panel.classList.add("show");
      panel.querySelector("[data-prev]").onclick = function () { if (step > 0) { step--; render(); } };
      panel.querySelector("[data-next]").onclick = function () { if (step < f.steps.length - 1) { step++; render(); } else stop(); };
      panel.querySelectorAll(".flow-dots span").forEach(function (d) { d.onclick = function () { step = +d.getAttribute("data-i"); render(); }; });
    }
    document.addEventListener("keydown", function (e) {
      if (cur === null || /input|textarea/i.test((e.target || {}).tagName)) return;
      if (e.key === "ArrowRight" && step < FLOWS[cur].steps.length - 1) { step++; render(); }
      else if (e.key === "ArrowLeft" && step > 0) { step--; render(); }
      else if (e.key === "Escape") stop();
    });
  }

  if (page === "concept") buildLesson();
  else if (page === "home") buildHome();
  refreshProgress();
})();
