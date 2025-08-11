const prefersReduced =
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

// utils
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const on = (t, ev, fn, opts) => t && t.addEventListener(ev, fn, opts);
const off = (t, ev, fn, opts) => t && t.removeEventListener(ev, fn, opts);

// single shared cursor
const CURSOR = document.createElement("span");
CURSOR.className = "cursor";
CURSOR.textContent = " ";
function moveCursorAfter(node) {
  document
    .querySelectorAll(".cursor")
    .forEach((c) => c !== CURSOR && c.remove());
  if (CURSOR.parentNode) CURSOR.parentNode.remove();
  node?.after?.(CURSOR);
}

function wrapTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      n.nodeValue.trim().length
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  });
  const spans = [];
  const toWrap = [];
  while (walker.nextNode()) toWrap.push(walker.currentNode);
  toWrap.forEach((textNode) => {
    const span = document.createElement("span");
    span.dataset.full = textNode.nodeValue;
    span.textContent = "";
    textNode.parentNode.replaceChild(span, textNode);
    spans.push(span);
  });
  return spans;
}

// typing motion
function typeAcross(spans, cps = 30) {
  if (prefersReduced) {
    spans.forEach((s) => (s.textContent = s.dataset.full || ""));
    return Promise.resolve();
  }
  const perChar = Math.max(8, cps);
  return new Promise((resolve) => {
    let i = 0,
      j = 0,
      last = performance.now();
    const tick = (now) => {
      if (i >= spans.length) return resolve();
      if (now - last < perChar) return requestAnimationFrame(tick);
      last = now;
      const s = spans[i];
      const full = s.dataset.full || "";
      s.textContent = full.slice(0, ++j);
      if (j >= full.length) {
        i++;
        j = 0;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// music toggle
function startMusic() {
  const btn = document.getElementById("musicButton");
  const audio = document.getElementById("audio");
  if (!btn || !audio) return;

  let isPlaying = false;
  on(
    btn,
    "click",
    () => {
      if (!isPlaying) {
        audio.play().catch(() => {}); // no autoplay
        isPlaying = true;
        btn.src = "./assets/images/music-note-green-64x64.png";
        console.log("> Music started…");
      } else {
        audio.pause();
        isPlaying = false;
        btn.src = "./assets/images/music-note-gray-64x64.png";
        console.log("> Music paused…");
      }
    },
    { passive: true }
  );

  on(audio, "ended", () => {
    isPlaying = false;
    btn.src = "./assets/images/music-note-gray-64x64.png";
    console.log("> Music ended…");
  });
}

// panes
const steps = [
  { id: "skills-section", init: showSkills, ready: false },
  { id: "certifications-section", init: showCertifications, ready: false },
  { id: "experience-section", init: showExperience, ready: false },
  { id: "projects-section", init: showProjects, ready: false },
  { id: "video-section", init: showVideo, ready: false },
  { id: "blog-section", init: showBlogs, ready: false },
];

let stage = 0;
let keyHandler = null;
let touchStartY = null;

async function goTo(index) {
  index = Math.max(0, Math.min(steps.length - 1, index));
  stage = index;

  // mount target pane on first visit
  const target = steps[index];
  const el = document.getElementById(target.id);
  if (!el) return;

  // hide all sections except target section
  steps.forEach(({ id }) => {
    const node = document.getElementById(id);
    if (node) node.style.display = id === target.id ? "" : "none";
  });

  if (!target.ready) {
    target.ready = true;
    await target.init();
  }
}

function next() {
  goTo(stage + 1);
}
function prev() {
  goTo(stage - 1);
}

// index intro for flair
async function animatePane() {
  const pane = document.querySelector(".pane");
  if (!pane) return;

  // current date + year (per rubric)
  const d = new Date();
  const dateDiv = document.getElementById("current-date");
  if (dateDiv) {
    dateDiv.style.fontSize = "16px";
    dateDiv.textContent = d.toLocaleString();
  }
  const y = document.getElementById("year");
  if (y) y.textContent = d.getFullYear();

  // intro lines (resume page)
  const prompts = Array.from(pane.querySelectorAll("p.prompt"));
  const hr = pane.querySelector("hr.rule");
  const quote = pane.querySelector("div.quote");

  if (prompts.length) {
    pane.style.minHeight = pane.offsetHeight + "px";

    const originals = new Map();
    for (const p of prompts) originals.set(p, p.innerHTML);

    for (const p of prompts) {
      const sig = p.querySelector(".sig");

      const after = document.createElement("span");
      while (sig?.nextSibling) after.appendChild(sig.nextSibling);

      p.appendChild(after);
      p.style.opacity = 1;

      const spans = wrapTextNodes(after);
      moveCursorAfter(after);
      await typeAcross(spans, 23);
      await wait(140);

      p.innerHTML = originals.get(p);
    }

    await wait(8000);

    if (!prefersReduced) await wait(600);
    hr?.remove();
    quote?.remove();
    prompts.forEach((p) => p.remove());
  }

  // first pane
  await goTo(0);

  // keyboard
  keyHandler = async (e) => {
    const tag = e.target?.tagName || "";
    if (/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/i.test(tag)) return;

    switch (e.key) {
      case "ArrowDown":
      case "PageDown":
      case "j":
        e.preventDefault();
        next();
        break;
      case "ArrowUp":
      case "PageUp":
      case "k":
        e.preventDefault();
        prev();
        break;
      default:
        break;
    }
  };
  on(document, "keydown", keyHandler, { passive: false });

  // touch swipe controls (only added because I wanted the site to be mobile friendly to an extent. I've done this before on other projects, just brought over.)
  on(
    pane,
    "touchstart",
    (e) => {
      touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );
  on(
    pane,
    "touchend",
    (e) => {
      if (touchStartY == null) return;
      const dy = e.changedTouches[0].clientY - touchStartY;
      touchStartY = null;
      if (Math.abs(dy) < 40) return;
      if (dy < 0) next();
      else prev();
    },
    { passive: true }
  );
}

async function showSkills() {
  const mount = document.getElementById("skills-section");
  if (!mount) return;

  const header = document.createElement("h3");
  header.className = "pane-title";
  header.textContent = "> ./skills ";

  const ul = document.createElement("ul");
  ul.style.margin = "8px 0 0 22px";
  ul.innerHTML = `
    <li>Systems Architecture and Embedded AI</li>
    <li>Python, Java, C, C++, Lua, Rust, C, JavaScript/TypeScript, Bash, SQL</li>
    <li>Data Engineering and Forecast Modeling</li>
    <li>Full-Stack Web Development</li>
    <li>Robotics and Edge Computing</li>
    <li>Cloud and On-Prem Deployment Automation</li>
  `;

  const table = document.createElement("table");
  table.className = "skills-table";
  table.innerHTML = `
    <caption>Tooling Proficiency</caption>
    <thead>
      <tr><th>Tech</th><th>Years</th><th>Level</th><th>Notes</th></tr>
    </thead>
    <tbody>
      <tr><td>Python</td><td>10</td><td>Advanced</td><td>AI/ML, automation, robotics, backend.</td></tr>
      <tr><td>JavaScript</td><td>6</td><td>Advanced</td><td>Full-stack, UI/UX, real-time apps.</td></tr>
      <tr><td>HTML/CSS</td><td>6</td><td>Advanced</td><td>Pixel-perfect, responsive, animations.</td></tr>
      <tr><td>Lua</td><td>4</td><td>Advanced</td><td>Embedded scripting, game/robotics.</td></tr>
      <tr><td>Java</td><td>3</td><td>Proficient</td><td>Backend, OOP, academic projects.</td></tr>
      <tr><td>C</td><td>2</td><td>Proficient</td><td>Systems programming, embedded, OS-level code.</td></tr>
      <tr><td>C++</td><td>3</td><td>Proficient</td><td>Systems, game engines, high-performance apps.</td></tr>
      <tr><td>Rust</td><td>1</td><td>Basic</td><td>Memory-safe systems, networking, embedded.</td></tr>
      <tr><td>SQL</td><td>5</td><td>Proficient</td><td>Database design, queries, optimization.</td></tr>
      <tr><td>Bash/PowerShell</td><td>5</td><td>Proficient</td><td>Automation, server scripts, DevOps tooling.</td></tr>
      <tr><td>Go</td><td>1</td><td>Basic</td><td>APIs, concurrency, microservices.</td></tr>
      <tr><td>Fortran</td><td>0</td><td>Learning</td><td>HPC, simulations, scientific computing.</td></tr>
    </tbody>
  `;

  mount.innerHTML = "";
  mount.append(header, ul, table);
  mount.style.opacity = 0;

  const hSpan = document.createElement("span");
  hSpan.dataset.full = header.textContent;
  header.textContent = "";
  header.appendChild(hSpan);

  const scrollLine = document.createElement("p");
  scrollLine.className = "scrollLine";
  scrollLine.innerHTML =
    '<span class="sig">></span> <span class="cmd"> echo "Use ↑ / ↓ to navigate" </span>';
  scrollLine.style.marginBottom = "-25px";
  scrollLine.style.marginTop = "105px";
  mount.appendChild(scrollLine);

  const cmd = scrollLine.querySelector(".cmd");
  moveCursorAfter(cmd);
  mount.style.opacity = 1;
  await typeAcross([hSpan], 48);
}

async function showCertifications() {
  const mount = document.getElementById("certifications-section");
  if (!mount) return;

  const header = document.createElement("h3");
  header.className = "pane-title";
  header.textContent = "> cat certifications.md";

  const table = document.createElement("table");
  table.className = "certification-table";
  table.innerHTML = `
    <caption>Certifications</caption>
    <thead>
      <tr><th>Certification</th><th>Issuer</th><th>Status</th><th>Year</th></tr>
    </thead>
    <tbody>
      <tr><td>Microsoft Certified: Azure Data Engineer Associate</td><td>Microsoft</td><td>Active</td><td>2026</td></tr>
      <tr><td>AWS Certified Solutions Architect</td><td>AWS</td><td>In Progress</td><td>2026</td></tr>
      <tr><td>AWS Machine Learning Specialist</td><td>AWS</td><td>In Progress</td><td>2027</td></tr>
      <tr><td>Java Developer</td><td>WGU</td><td>In Progress</td><td>2026</td></tr>
      <tr><td>Back-End Developer</td><td>WGU</td><td>In Progress</td><td>2026</td></tr>
      <tr><td>AI Optimization Developer</td><td>WGU</td><td>In Progress</td><td>2026</td></tr>
      <tr><td>Linux Essentials</td><td>LPI</td><td>In Progress</td><td>2026</td></tr>
      <tr><td>ITIL® 4 Foundation Certification</td><td>ITIL</td><td>In Progress</td><td>2026</td></tr>
      <tr><td>Microsoft Certified: Azure AI Engineer Associate</td><td>Microsoft</td><td>In Progress</td><td>2027</td></tr>
    </tbody>
  `;

  mount.innerHTML = "";
  mount.append(header, table);
  mount.style.opacity = 0;

  const hSpan = document.createElement("span");
  hSpan.dataset.full = header.textContent;
  header.textContent = "";
  header.appendChild(hSpan);

  const scrollLine = document.createElement("p");
  scrollLine.innerHTML =
    '<span class="sig">></span> <span class="cmd"> echo "Use ↑ / ↓ to navigate" </span>';
  scrollLine.style.marginBottom = "-25px";
  scrollLine.style.marginTop = "140px";
  mount.appendChild(scrollLine);

  moveCursorAfter(scrollLine.querySelector(".cmd"));
  mount.style.opacity = 1;
  await typeAcross([hSpan], 48);
}

async function showExperience() {
  const mount = document.getElementById("experience-section");
  if (!mount) return;

  const header = document.createElement("h3");
  header.className = "pane-title";
  header.textContent = '> java -cp "out:libs/*" experience.java ';

  const data = [
    {
      title: "Data Engineer– Cedar Electronics",
      body: "Designed and led data architecture and pipelines. Built self-repairing ML-powered pipelines, CI/CD, dashboard engineering, forecasting, data modeling and Mentored team on perf and reliability.",
    },
    {
      title: "Systems Architect – Osiris Tech Co",
      body: "Designed and led distributed AI services. Built telemetry pipelines, CI/CD, and infra-as-code. Executed research and development on a solo team.",
    },
    {
      title: "Robotics / Embedded R&D - Osiris Tech co.",
      body: "Rapid prototyped edge inference on Jetson. Firmware tuning, sensor fusion, and control loops for mobile platforms.",
    },
  ];

  const grid = document.createElement("div");
  grid.className = "exp-grid";
  data.forEach(({ title, body }) => {
    const card = document.createElement("article");
    card.className = "exp-card";
    card.innerHTML = `<h4 class="exp-title">${title}</h4><p class="exp-body">${body}</p>`;
    grid.appendChild(card);
  });
  grid.style.marginBottom = "133px";

  mount.innerHTML = "";
  mount.append(header, grid);
  mount.style.opacity = 0;

  const hSpan = document.createElement("span");
  hSpan.dataset.full = header.textContent;
  header.textContent = "";
  header.appendChild(hSpan);

  const scrollLine = document.createElement("p");
  scrollLine.innerHTML =
    '<span class="sig">></span> <span class="cmd"> echo "Use ↑ / ↓ to navigate" </span>';
  scrollLine.style.marginBottom = "-25px";
  scrollLine.style.marginTop = "50px";
  mount.appendChild(scrollLine);

  moveCursorAfter(scrollLine.querySelector(".cmd"));
  mount.style.opacity = 1;
  await typeAcross([hSpan], 48);
}

async function showProjects() {
  const mount = document.getElementById("projects-section");
  if (!mount) return;

  const header = document.createElement("h3");
  header.className = "pane-title";
  header.textContent = "$ g++ projects.cpp -o projects && ./projects ";

  const wrap = document.createElement("div");
  wrap.className = "proj-wrap";

  // svg physics nodes
  const NS = "http://www.w3.org/2000/svg";
  let W = 1500,
    H = 494.5; // viewbox
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "proj-svg hidden");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

  const links = {
    ai: "https://github.com/ShadowMP252",
    sys: "https://github.com/ShadowMP252",
    emb: "https://github.com/ShadowMP252",
    rob: "https://github.com/ShadowMP252",
    web: "https://github.com/ShadowMP252",
    soft: "https://github.com/ShadowMP252",
    data: "https://github.com/ShadowMP252",
    engine: "https://github.com/ShadowMP252",
  };
  const nodes = [
    { id: "ai", x: 200 * 1.5, y: 200 * 1.5, r: 70 * 1.5, label: "AI" },
    { id: "sys", x: 370 * 1.5, y: 150 * 1.5, r: 55 * 1.5, label: "Systems" },
    {
      id: "emb",
      x: 610 * 1.5,
      y: 190 * 1.5,
      r: 55 * 1.5,
      label: "Embedded\nSystems",
    },
    { id: "rob", x: 800 * 1.5, y: 180 * 1.5, r: 70 * 1.5, label: "Robotics" },
    { id: "web", x: 160 * 1.5, y: 360 * 1.5, r: 70 * 1.5, label: "Web" },
    { id: "soft", x: 370 * 1.5, y: 340 * 1.5, r: 60 * 1.5, label: "Software" },
    { id: "data", x: 610 * 1.5, y: 350 * 1.5, r: 70 * 1.5, label: "Data" },
    { id: "engine", x: 360 * 1.5, y: 440 * 1.5, r: 60 * 1.5, label: "Engines" },
  ].map((n) => ({ ...n, vx: 0, vy: 0 }));

  const nodeEls = nodes.map((n) => {
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "proj-node");
    g.style.touchAction = "none";

    const c = document.createElementNS(NS, "circle");
    c.setAttribute("r", n.r);
    c.setAttribute("cx", n.x);
    c.setAttribute("cy", n.y);
    g.appendChild(c);

    // label
    const lines = String(n.label).split("\n");
    const lineGap = 16;
    const y0 = n.y - ((lines.length - 1) * lineGap) / 2;
    const texts = lines.map((t, i) => {
      const txt = document.createElementNS(NS, "text");
      txt.setAttribute("x", n.x);
      txt.setAttribute("y", y0 + i * lineGap);
      txt.setAttribute("text-anchor", "middle");
      txt.setAttribute("dominant-baseline", "middle");
      txt.textContent = t;
      g.appendChild(txt);
      return txt;
    });

    svg.appendChild(g);

    // drag and throw or click-to-open
    let dragging = false,
      moved = false,
      px = 0,
      py = 0,
      pt = 0,
      t0 = 0;
    function endPointer(e) {
      if (!dragging) return;
      dragging = false;
      g.classList.remove("dragging");
      try {
        g.releasePointerCapture(e.pointerId);
      } catch {}
      const clickish = !moved && performance.now() - t0 < 250;
      if (clickish && links[n.id]) {
        n.vx = 0;
        n.vy = 0;
        window.open(links[n.id], "_blank");
      }
    }
    g.addEventListener("pointerdown", (e) => {
      dragging = true;
      moved = false;
      t0 = performance.now();
      g.setPointerCapture(e.pointerId);
      g.classList.add("dragging");
      px = e.clientX;
      py = e.clientY;
      pt = t0;
      n.vx = 0;
      n.vy = 0;
    });
    g.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const rect = svg.getBoundingClientRect();
      const sx = W / rect.width,
        sy = H / rect.height;
      const dx = (e.clientX - px) * sx,
        dy = (e.clientY - py) * sy;
      if (!moved && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) moved = true;
      n.x = Math.max(n.r, Math.min(W - n.r, n.x + dx));
      n.y = Math.max(n.r, Math.min(H - n.r, n.y + dy));
      const now = performance.now(),
        dt = Math.max(1, now - pt);
      n.vx = (dx / dt) * 16;
      n.vy = (dy / dt) * 16;
      px = e.clientX;
      py = e.clientY;
      pt = now;
    });
    g.addEventListener("pointerup", endPointer);
    g.addEventListener("pointercancel", endPointer);
    g.addEventListener("lostpointercapture", endPointer);

    return { g, c, texts };
  });

  // physics
  const damp = 0.992,
    e = 0.96,
    eWall = 0.985,
    jitter = 0.004,
    accel = 0.09;
  nodes.forEach((n) => {
    n.vx = (Math.random() - 0.5) * 10;
    n.vy = (Math.random() - 0.5) * 10;
  });

  function resolveCollision(a, b, restitution) {
    const dx = b.x - a.x,
      dy = b.y - a.y;
    let d = Math.hypot(dx, dy);
    if (!d) return;
    const minDist = a.r + b.r;
    if (d >= minDist) return;
    const nx = dx / d,
      ny = dy / d;
    const velAlongNormal = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
    const j = (-(1 + restitution) * velAlongNormal) / 2;
    a.vx -= j * nx;
    a.vy -= j * ny;
    b.vx += j * nx;
    b.vy += j * ny;
    const overlap = minDist - d + 0.001;
    a.x -= overlap * 0.5 * nx;
    a.y -= overlap * 0.5 * ny;
    b.x += overlap * 0.5 * nx;
    b.y += overlap * 0.5 * ny;
  }

  function step() {
    nodes.forEach((n) => {
      n.vx += (Math.random() - 0.5) * accel + (Math.random() - 0.5) * jitter;
      n.vy += (Math.random() - 0.5) * accel + (Math.random() - 0.5) * jitter;
      n.vx *= damp;
      n.vy *= damp;
      const vmax = 14,
        s = Math.hypot(n.vx, n.vy);
      if (s > vmax) {
        n.vx *= vmax / s;
        n.vy *= vmax / s;
      }
      n.x += n.vx;
      n.y += n.vy;
    });
    nodes.forEach((n) => {
      if (n.x < n.r) {
        n.x = n.r;
        n.vx = Math.abs(n.vx) * eWall;
      }
      if (n.x > W - n.r) {
        n.x = W - n.r;
        n.vx = -Math.abs(n.vx) * eWall;
      }
      if (n.y < n.r) {
        n.y = n.r;
        n.vy = Math.abs(n.vy) * eWall;
      }
      if (n.y > H - n.r) {
        n.y = H - n.r;
        n.vy = -Math.abs(n.vy) * eWall;
      }
    });
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++)
        resolveCollision(nodes[i], nodes[j], e);
  }

  function draw() {
    nodeEls.forEach(({ c, texts }, i) => {
      const n = nodes[i];
      c.setAttribute("cx", n.x);
      c.setAttribute("cy", n.y);
      const y0 = n.y - ((texts.length - 1) * 16) / 2;
      texts.forEach((t, li) => {
        t.setAttribute("x", n.x);
        t.setAttribute("y", y0 + li * 16);
      });
    });
  }

  let loopStarted = false,
    rafId = null;
  function loop() {
    step();
    draw();
    rafId = requestAnimationFrame(loop);
  }

  // mount
  mount.innerHTML = "";
  mount.appendChild(header);
  wrap.appendChild(svg);
  mount.appendChild(wrap);

  // header typing then reveal
  mount.style.opacity = 0;
  const hSpan = document.createElement("span");
  hSpan.dataset.full = header.textContent;
  header.textContent = "";
  header.appendChild(hSpan);

  const scrollLine = document.createElement("p");
  scrollLine.innerHTML =
    '<span class="sig">></span> <span class="cmd"> echo "Use ↑ / ↓ to navigate" </span>';
  scrollLine.style.margin = "50px 0 -25px";
  mount.appendChild(scrollLine);
  moveCursorAfter(scrollLine.querySelector(".cmd"));

  mount.style.opacity = 1;
  await typeAcross([hSpan], 48);

  svg.classList.remove("hidden");
  if (!loopStarted && !prefersReduced) {
    loopStarted = true;
    rafId = requestAnimationFrame(loop);
  }

  const visObs = new MutationObserver(() => {
    const visible = mount.style.display !== "none";
    if (visible && !rafId && !prefersReduced)
      rafId = requestAnimationFrame(loop);
    if (!visible && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });
  visObs.observe(mount, { attributes: true, attributeFilter: ["style"] });

  let resizeRaf = null;
  const onResize = () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      nodes.forEach((n) => {
        n.x = Math.max(n.r, Math.min(W - n.r, n.x));
        n.y = Math.max(n.r, Math.min(H - n.r, n.y));
      });
    });
  };
  on(window, "resize", onResize, { passive: true });

  const killObs = new MutationObserver(() => {
    if (!document.body.contains(mount)) {
      if (rafId) cancelAnimationFrame(rafId);
      visObs.disconnect();
      killObs.disconnect();
      off(window, "resize", onResize);
    }
  });
  killObs.observe(document.body, { childList: true, subtree: true });
}

async function showVideo() {
  const mount = document.getElementById("video-section");
  if (!mount) return;

  const header = document.createElement("h3");
  header.className = "pane-title";
  header.textContent = "$ mpv ~/videos/developing.mp4 ";

  const wrap = document.createElement("div");
  wrap.className = "video-wrap";

  const vid = document.createElement("video");
  vid.setAttribute("controls", "");
  vid.setAttribute("preload", "metadata");
  vid.setAttribute("playsinline", "");
  vid.setAttribute("width", "81%");
  const src = document.createElement("source");
  src.src = "./assets/video/developing.mp4";
  src.type = "video/mp4";
  vid.appendChild(src);
  wrap.appendChild(vid);

  mount.innerHTML = "";
  mount.append(header, wrap);
  mount.style.opacity = 0;

  const hSpan = document.createElement("span");
  hSpan.dataset.full = header.textContent;
  header.textContent = "";
  header.appendChild(hSpan);

  const scrollLine = document.createElement("p");
  scrollLine.innerHTML =
    '<span class="sig">></span> <span class="cmd"> echo "Space=Play/Pause, ←/→=Seek, ↑/↓=Navigate" </span>';
  scrollLine.style.margin = "19px 0 -25px";
  mount.appendChild(scrollLine);
  moveCursorAfter(scrollLine.querySelector(".cmd"));

  mount.style.opacity = 1;
  await typeAcross([hSpan], 48);

  vid.tabIndex = 0;
  on(wrap, "click", () => vid.focus(), { passive: true });

  const onKeys = (e) => {
    const tag = e.target.tagName;
    if (/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/i.test(tag)) return;
    switch (e.key.toLowerCase()) {
      case " ":
        e.preventDefault();
        if (vid.paused) vid.play();
        else vid.pause();
        break;
      case "arrowleft":
        vid.currentTime = Math.max(0, vid.currentTime - 5);
        break;
      case "arrowright":
        vid.currentTime = Math.min(
          vid.duration || Infinity,
          vid.currentTime + 5
        );
        break;
      default:
        break;
    }
  };
  on(document, "keydown", onKeys);

  // cleanup pane
  const obs = new MutationObserver(() => {
    if (!document.body.contains(mount)) {
      off(document, "keydown", onKeys);
      obs.disconnect();
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });
}

async function showBlogs() {
  const mount = document.getElementById("blog-section");
  if (!mount) return;

  const header = document.createElement("h3");
  header.className = "pane-title";
  header.textContent = "$ ./blogPosts ";

  const posts = [
    {
      title: "Designing Terminal UX",
      sub: "Case Study",
      blurb:
        "Built a scroll-locked terminal with typewriter prompts, pane transitions, and SVG physics nodes.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Repo", href: "#" },
      ],
    },
    {
      title: "Designing AI for the Edge",
      sub: "Embedded Systems",
      blurb:
        "Low-latency AI inference on Jetson Orin: models, quantization, and thermal constraints.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Notes", href: "#" },
      ],
    },
    {
      title: "From Bash to Browser",
      sub: "Web Development",
      blurb:
        "Turning a terminal aesthetic into a portfolio site with interactive panes and CLI-style prompts.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Demo", href: "#" },
      ],
    },
    {
      title: "Architecture Threads",
      sub: "Opinion",
      blurb:
        "Why systems thinking beats feature creep; plus patterns for clean, maintainable interfaces.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Slides", href: "#" },
      ],
    },
    {
      title: "Embedded Notes",
      sub: "R&D",
      blurb:
        "Edge inference patterns and timing budgets that survive the jump from dev to device.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Benchmarks", href: "#" },
      ],
    },
    {
      title: "Data Pipelines",
      sub: "Playbook",
      blurb:
        "Ingestion, modeling, APIs with observability and zero-downtime deploys from day one.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Code", href: "#" },
      ],
    },
    {
      title: "The Art of Idle Worlds",
      sub: "Game Dev",
      blurb:
        "AFK mechanics that breathe life into worlds, balancing progression and player agency.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Repo", href: "#" },
      ],
    },
    {
      title: "AI Has Hit a Wall?",
      sub: "Opinion",
      blurb:
        "Why scaling bigger models isn’t enough and what’s next for the AI sector.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Notes", href: "#" },
      ],
    },
    {
      title: "Video Pane",
      sub: "Implementation",
      blurb:
        "Keyboard shortcuts (space/←/→/m/f) plus stable box-sizing for responsive video panes.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Demo", href: "#" },
      ],
    },
    {
      title: "Physics Engines",
      sub: "Dev Log",
      blurb:
        "Experimental physics engine to drive interactive SVG node graphs.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Slides", href: "#" },
      ],
    },
    {
      title: "Terminal UI Animations",
      sub: "Frontend",
      blurb:
        "Async typewriter effects, cursor control, and event-driven pane transitions in pure JS.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Benchmarks", href: "#" },
      ],
    },
    {
      title: "CLI-Style Portfolio",
      sub: "Design Notes",
      blurb:
        "Design philosophy behind blending retro terminal aesthetics with modern web tech.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Code", href: "#" },
      ],
    },
  ];

  const grid = document.createElement("div");
  grid.className = "blog-grid";
  posts.forEach(({ title, sub, blurb, links }) => {
    const card = document.createElement("article");
    card.className = "blog-card";
    card.innerHTML = `
      <h4 class="blog-title">${title}</h4>
      <div class="blog-sub">${sub}</div>
      <p class="blog-blurb">${blurb}</p>
      <div class="blog-links">
        ${links
          .map(
            (l) =>
              `<a href="${l.href}" target="_blank" rel="noopener">${l.label}</a>`
          )
          .join(" ")}
      </div>`;
    grid.appendChild(card);
  });

  mount.innerHTML = "";
  mount.append(header, grid);
  mount.style.opacity = 0;

  const hSpan = document.createElement("span");
  hSpan.dataset.full = header.textContent;
  header.textContent = "";
  header.appendChild(hSpan);

  const scrollLine = document.createElement("p");
  scrollLine.innerHTML =
    '<span class="sig">></span> <span class="cmd"> echo "Use ↑ / ↓ to navigate" </span>';
  scrollLine.style.margin = "35px 0 -25px";
  mount.appendChild(scrollLine);
  moveCursorAfter(scrollLine.querySelector(".cmd"));

  mount.style.opacity = 1;
  await typeAcross([hSpan], 48);
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    animatePane();
    startMusic();
    console.log("Resume loaded: terminal UI initialized (arrows + swipe).");
  } catch (e) {
    console.error("Initialization error:", e);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const playBtn = document.getElementById("playVideoBtn");
  if (playBtn) {
    let videoOpen = false;
    let videoElem = null;

    playBtn.addEventListener("click", () => {
      const wrap = document.querySelector(".letter-section");

      if (!videoOpen) {
        // video
        videoElem = document.createElement("video");
        videoElem.setAttribute("controls", "");
        videoElem.setAttribute("preload", "metadata");
        videoElem.setAttribute("playsinline", "");
        videoElem.setAttribute("width", "81%");

        const src = document.createElement("source");
        src.src = "./assets/video/developing.mp4";
        src.type = "video/mp4";
        videoElem.appendChild(src);

        wrap.appendChild(videoElem);
        videoElem.play();

        playBtn.textContent = "Close Video";
        videoOpen = true;
      } else {
        if (videoElem) {
          videoElem.pause();
          videoElem.remove();
          videoElem = null;
        }

        playBtn.textContent = "Play Video Again";
        videoOpen = false;
      }
    });
  }
});
