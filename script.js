(function () {
  var PLANS = [
    { id: "scan", img: "images/scan.jfif", cat: "Basic", name: "Scan", tier: "Basic", desc: "Digitize a roll of negatives into clean files.", monthly: 9, yearlyMo: 7, billed: 84,
      features: ["36 frames each month", "2400 dpi scans", "JPEG and TIFF export", "Email support"], cta: "Choose Scan", icon: "circle" },
    { id: "tidy", img: "images/tidy.jfif", cat: "Basic", name: "Tidy", tier: "Basic", desc: "Scans plus automatic color and exposure fixes.", monthly: 19, yearlyMo: 15, billed: 180,
      features: ["120 frames each month", "4000 dpi scans", "Auto color correction", "Shared albums"], cta: "Choose Tidy", icon: "square" },
    { id: "restore", img: "images/restore.jfif", cat: "Premium", name: "Restore", tier: "Premium", desc: "Dust, scratch and fade repair by a human editor.", monthly: 39, yearlyMo: 31, billed: 372,
      features: ["400 frames each month", "6400 dpi scans", "Dust and scratch removal", "Editor review of every frame", "Priority turnaround"], cta: "Choose Restore", icon: "triangle", popular: true },
    { id: "archive", img: "images/archive.jfif", cat: "Premium", name: "Archive", tier: "Premium", desc: "Full family archive with long-term safe storage.", monthly: 79, yearlyMo: 63, billed: 756,
      features: ["Unlimited frames", "Drum scan quality", "Restoration on request", "1 TB private storage", "Physical film returned insured"], cta: "Choose Archive", icon: "rings" }
  ];

  var PRESETS = {
    scan:    { e: 100, c: 100, s: 100, d: false },
    tidy:    { e: 108, c: 105, s: 100, d: false },
    restore: { e: 112, c: 112, s: 110, d: true },
    archive: { e: 115, c: 118, s: 115, d: true }
  };

  var ICONS = {
    circle:   '<svg viewBox="0 0 108 72" aria-hidden="true"><circle cx="54" cy="36" r="26" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="54" cy="36" r="8" fill="currentColor"/></svg>',
    square:   '<svg viewBox="0 0 108 72" aria-hidden="true"><rect x="28" y="8" width="52" height="52" fill="none" stroke="currentColor" stroke-width="5"/><rect x="42" y="22" width="24" height="24" fill="currentColor"/></svg>',
    triangle: '<svg viewBox="0 0 108 72" aria-hidden="true"><path d="M54 6 L94 64 H14 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="miter"/><path d="M54 30 L70 54 H38 Z" fill="currentColor"/></svg>',
    rings:    '<svg viewBox="0 0 108 72" aria-hidden="true"><circle cx="40" cy="36" r="24" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="68" cy="36" r="24" fill="none" stroke="currentColor" stroke-width="5"/></svg>'
  };

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var state = { cat: "All", yearly: false };
  var grid = document.getElementById("grid");
  var timer = null;

  function priceOf(p) { return state.yearly ? p.yearlyMo : p.monthly; }

  function cardHTML(p) {
    var li = p.features.map(function (f) { return "<li>" + f + "</li>"; }).join("");
    return '<article class="card' + (p.popular ? " popular" : "") + '" data-id="' + p.id + '">' +
      (p.popular ? '<span class="badge">Most popular</span>' : "") +
      '<div class="art">' + ICONS[p.icon] + '<img src="' + p.img + '" alt="' + p.name + ' plan photo" loading="lazy" onerror="this.remove()">' + "</div>" +
      '<div class="body">' +
        '<p class="tier">' + p.tier + "</p>" +
        "<h3>" + p.name + "</h3>" +
        '<p class="desc">' + p.desc + "</p>" +
        '<div class="price"><span class="amount" data-target="' + priceOf(p) + '">$' + priceOf(p) + '</span><span class="per">/ month</span></div>' +
        '<p class="billed">' + (state.yearly ? "Billed $" + p.billed + " each year" : "Billed monthly") + "</p>" +
        '<hr class="rule">' +
        '<ul class="features">' + li + "</ul>" +
        '<div class="actions">' +
          '<button class="btn cta" type="button" data-name="' + p.name + '">' + p.cta + "</button>" +
          '<button class="btn ghost preview" type="button" data-id="' + p.id + '">Preview plan</button>' +
        "</div>" +
      "</div></article>";
  }

  function skeletonHTML(n) {
    var one = '<article class="card skel" aria-hidden="true"><div class="art"></div><div class="body"><div class="bar sm"></div><div class="bar"></div><div class="bar lg"></div><div class="bar"></div><div class="bar sm"></div><div class="bar btn-bar"></div></div></article>';
    return new Array(n + 1).join(one);
  }

  function visible() {
    return PLANS.filter(function (p) { return state.cat === "All" || p.cat === state.cat; });
  }

  function render() {
    var list = visible();
    grid.innerHTML = list.length ? list.map(cardHTML).join("") : '<p class="empty">No plans in this category.</p>';
  }

  function renderWithSkeleton() {
    var n = visible().length;
    clearTimeout(timer);
    if (reduce) { render(); return; }
    grid.innerHTML = skeletonHTML(n);
    timer = setTimeout(render, 380);
  }

  // category filter (dropdown)
  document.getElementById("catSelect").addEventListener("change", function (e) {
    if (state.cat === e.target.value) return;
    state.cat = e.target.value;
    renderWithSkeleton();
  });

  // billing switch
  var sw = document.getElementById("billingSwitch");
  var lm = document.getElementById("lblMonthly"), ly = document.getElementById("lblYearly");
  function animateNumber(el, from, to) {
    if (reduce || from === to) { el.textContent = "$" + to; return; }
    var start = null, dur = 320;
    function step(t) {
      if (start === null) start = t;
      var k = Math.min((t - start) / dur, 1);
      var e = 1 - Math.pow(1 - k, 3);
      el.textContent = "$" + Math.round(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  sw.addEventListener("click", function () {
    state.yearly = !state.yearly;
    sw.setAttribute("aria-checked", String(state.yearly));
    lm.classList.toggle("on", !state.yearly);
    ly.classList.toggle("on", state.yearly);
    grid.querySelectorAll(".card:not(.skel)").forEach(function (card) {
      var p = PLANS.filter(function (x) { return x.id === card.dataset.id; })[0];
      var amt = card.querySelector(".amount");
      var from = parseInt(amt.textContent.replace("$", ""), 10);
      animateNumber(amt, from, priceOf(p));
      card.querySelector(".billed").textContent = state.yearly ? "Billed $" + p.billed + " each year" : "Billed monthly";
    });
  });

  // demo
  var exp = document.getElementById("exp"), con = document.getElementById("con"), sat = document.getElementById("sat");
  var dustT = document.getElementById("dustToggle"), dust = document.getElementById("dust"), photo = document.getElementById("photo");
  function applyDemo() {
    photo.style.filter = "brightness(" + exp.value + "%) contrast(" + con.value + "%) saturate(" + sat.value + "%)";
    document.getElementById("expOut").textContent = exp.value + "%";
    document.getElementById("conOut").textContent = con.value + "%";
    document.getElementById("satOut").textContent = sat.value + "%";
    dust.style.opacity = dustT.checked ? "0" : "1";
  }
  function loadPreset(id) {
    var p = PRESETS[id], plan = PLANS.filter(function (x) { return x.id === id; })[0];
    exp.value = p.e; con.value = p.c; sat.value = p.s; dustT.checked = p.d;
    document.getElementById("demoPlan").textContent = plan.name;
    applyDemo();
  }
  [exp, con, sat, dustT].forEach(function (el) { el.addEventListener("input", applyDemo); });
  document.getElementById("resetDemo").addEventListener("click", function () { loadPreset("scan"); });

  // card buttons (delegated)
  grid.addEventListener("click", function (e) {
    var cta = e.target.closest(".cta");
    if (cta) {
      var old = cta.textContent;
      cta.textContent = "Selected " + cta.dataset.name;
      cta.classList.add("done");
      setTimeout(function () { cta.textContent = old; cta.classList.remove("done"); }, 1600);
      return;
    }
    var pv = e.target.closest(".preview");
    if (pv) {
      loadPreset(pv.dataset.id);
      document.getElementById("demo").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  });

  // views (plans, terms, privacy)
  function route() {
    var h = (location.hash || "#plans").replace("#", "");
    if (["plans", "terms", "privacy"].indexOf(h) < 0) h = "plans";
    ["plans", "terms", "privacy"].forEach(function (v) {
      document.getElementById("view-" + v).hidden = (v !== h);
    });
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  render();
  loadPreset("scan");
  route();
})();