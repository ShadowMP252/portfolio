/**
 * !!!NOTE FOR OPTIMIZATION!!
 * instead of press enter to move forward, needs to be changed for directional arrows. 
 * if ↑ then move up one pane else ↓ down one pane.
 */

document.addEventListener("DOMContentLoaded", () => {
  const d = new Date();
  const dateDiv = document.getElementById("current-date");
  dateDiv.style.fontSize = "16px";
  if (dateDiv) dateDiv.textContent = d.toLocaleString();
  const y = document.getElementById("year");
  if (y) y.textContent = d.getFullYear();

  console.log("Resume loaded: terminal UI initialized.");
});

async function startMusic(){
  const btn = document.getElementById("musicButton");
  const audio = document.getElementById("audio");

  let isPlaying = false;

  btn.addEventListener("click", () => {
    if (!isPlaying) {
      audio.play();
      isPlaying = true;
      btn.src = "./assets/images/music-note-green-64x64.png";
      console.log("> Music started…");
    } else {
      audio.pause();
      isPlaying = false;
      btn.src = "./assets/images/music-note-gray-64x64.png";
      console.log("> Music paused…");
    }
  });

  // Optional: reset icon when audio ends
  audio.addEventListener("ended", () => {
    isPlaying = false;
    btn.src = "./assets/images/music-note-gray-64x64.png";
    console.log("> Music ended…");
  });
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

function typeAcross(spans, cps = 30) {
  return new Promise((resolve) => {
    let i = 0,
      j = 0;
    const tick = () => {
      if (i >= spans.length) return resolve();
      const s = spans[i];
      const full = s.dataset.full;
      s.textContent = full.slice(0, ++j);
      if (j >= full.length) {
        i++;
        j = 0;
      }
      setTimeout(tick, cps);
    };
    tick();
  });
}

const CURSOR = document.createElement("span");
CURSOR.className = "cursor";
CURSOR.textContent = " ";

function moveCursorAfter(node) {
  document.querySelectorAll(".cursor").forEach((c) => {
    if (c !== CURSOR) c.remove();
  });
  if (CURSOR.parentNode) CURSOR.parentNode.removeChild(CURSOR);
  node.after(CURSOR);
}

async function animatePane() {
  const pane = document.querySelector(".pane");
  const prompts = Array.from(pane.querySelectorAll("p.prompt"));
  const hr = document.querySelector("hr.rule");
  pane.style.minHeight = pane.offsetHeight + "px";

  for (const p of prompts) {
    const sig = p.querySelector(".sig");

    const after = document.createElement("span");
    while (sig.nextSibling) after.appendChild(sig.nextSibling);

    p.appendChild(after);
    p.style.opacity = 1;
    const spans = wrapTextNodes(after);
    moveCursorAfter(after);
    await typeAcross(spans, 48); // typing speed
    await wait(140);
  }
  await wait(2500);

  hr.remove();

  for (const p of prompts) {
    p.style.transition = 'opacity .3s ease';
    p.remove();
  }

  await showSkills();

  let stage = 0;
  document.addEventListener("keydown", async function onEnter(e) {
    if (e.key !== "Enter") return;

    const tag = e.target.tagName;
    const interactive = /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/i.test(tag);
    if (interactive) {
      e.preventDefault();
      e.stopPropagation();
      if (document.activeElement) document.activeElement.blur();
    }

    if (stage === 0) {
      const s = document.getElementById("skills-section");
      if (s) s.remove();
      await showCertifications();
      stage = 1;
    } else if (stage === 1) {
      const c = document.getElementById("certifications-section");
      if (c) c.remove();
      await showExperience();
      stage = 2;
    } else if (stage === 2) {
      const p = document.getElementById("experience-section");
      if (p) p.remove();
      await showProjects();
      stage = 3;
    } else if (stage === 3) {
      const pr = document.getElementById("projects-section");
      if (pr) pr.remove();
      await showVideo();
      stage = 4;
    } else if (stage === 4) {
      const v = document.getElementById("video-section");
      if (v) v.remove();
      await showBlogs();
      stage = 4;
    } else {
      // Do Nothing
    }
  });
}
function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function showSkills() {
  const mount = document.getElementById("skills-section");

  const header = document.createElement("h3");
  header.className = "pane-title";
  header.textContent = "> ./skills ";

  const ul = document.createElement("ul");
  ul.style.margin = "8px 0 0 22px";
  ul.innerHTML = `
    <li>Python • Flask • Data wrangling</li>
    <li>JavaScript • DOM • Async</li>
    <li>HTML5 / CSS3 • Responsive layouts</li>
    <li>Temp Placeholder</li>
    <li>Temp Placeholder</li>
  `;

  const table = document.createElement("table");
  table.className = "skills-table";
  table.innerHTML = `
    <caption>Tooling Proficiency</caption>
    <thead>
      <tr><th>Tech</th><th>Years</th><th>Level</th><th>Notes</th></tr>
    </thead>
    <tbody>
      <tr><td>Python</td><td>10</td><td>Advanced</td><td>APIs, data tasks</td></tr>
      <tr><td>JavaScript</td><td>6</td><td>Advanced</td><td>Vanilla, DOM, fetch</td></tr>
      <tr><td>HTML/CSS</td><td>6</td><td>Advanced</td><td>Grid/Flex, a11y</td></tr>
      <tr><td>Java</td><td>3</td><td>Proficient</td><td>Engines, UI, Networking</td></tr>
      <tr><td>C++</td><td>3</td><td>Proficient</td><td>Memory Modeling, Low Level Optimization, Engine Design</td></tr>
      <tr><td>Robotics</td><td>1</td><td>Basic</td><td>Plastics, CF, Assembly, Modeling</td></tr>
      <tr><td>Embedded-Devices</td><td>4</td><td>Advanced</td><td>Kernal Mapping, Fine Tuning, Deployments</td></tr>
      </tbody>
  `;

  mount.innerHTML = "";
  mount.appendChild(header);
  mount.appendChild(ul);
  mount.appendChild(table);
  mount.style.opacity = 0;

  const hSpan = document.createElement("span");
  hSpan.dataset.full = header.textContent;
  hSpan.textContent = "";
  header.textContent = "";
  header.appendChild(hSpan);
    
    const scrollLine = document.createElement("p");
    scrollLine.className = "scrollLine"
    scrollLine.innerHTML = '<span class="sig">></span> <span class="cmd"> echo "Press Enter to Continue" </span> ';
    scrollLine.style.marginBottom = "-25px";
    scrollLine.style.marginTop= "50px";
    mount.appendChild(scrollLine);

    const cmd = scrollLine.querySelector('.cmd');
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
      <tr><td>CompTIA Network+</td><td>CompTIA</td><td>In Progress</td><td>2025</td></tr>
      <tr><td>AWS CCP</td><td>Amazon</td><td>Planned</td><td>2025</td></tr>
      <tr><td>Python PCEP/PCAP</td><td>OpenEDG</td><td>Completed</td><td>2023</td></tr>
      <tr><td>CompTIA Network+</td><td>CompTIA</td><td>In Progress</td><td>2025</td></tr>
      <tr><td>AWS CCP</td><td>Amazon</td><td>Planned</td><td>2025</td></tr>
      <tr><td>Python PCEP/PCAP</td><td>OpenEDG</td><td>Completed</td><td>2023</td></tr>
      <tr><td>CompTIA Network+</td><td>CompTIA</td><td>In Progress</td><td>2025</td></tr>
      <tr><td>AWS CCP</td><td>Amazon</td><td>Planned</td><td>2025</td></tr>
      <tr><td>Python PCEP/PCAP</td><td>OpenEDG</td><td>Completed</td><td>2023</td></tr>
      <tr><td>CompTIA Network+</td><td>CompTIA</td><td>In Progress</td><td>2025</td></tr>
    </tbody>
  `;

  mount.innerHTML = "";
  mount.appendChild(header);
  mount.appendChild(table);
  mount.style.opacity = 0;

  const hSpan = document.createElement("span");
  hSpan.dataset.full = header.textContent;
  hSpan.textContent = "";
  header.textContent = "";
  header.appendChild(hSpan);

  const scrollLine = document.createElement("p");
  scrollLine.innerHTML = '<span class="sig">></span> <span class="cmd"> echo "Press Enter to Continue...." </span>';
  scrollLine.style.marginBottom = "-25px";
  scrollLine.style.marginTop = "89px";
  mount.appendChild(scrollLine);

  const cmd = scrollLine.querySelector('.cmd');
  moveCursorAfter(cmd);

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
      title: "Systems Architect – Osiris Tech Co",
      body:
        "Designed and led distributed AI services. Built telemetry pipelines, CI/CD, and infra-as-code. Mentored team on perf and reliability.",
    },
    {
      title: "Senior Data/Platform Engineer",
      body:
        "Owned ingestion → modeling → APIs. Optimized queries, caching layers, and observability. Drove 60% cost reduction.",
    },
    {
      title: "Robotics / Embedded R&D",
      body:
        "Rapid prototyped edge inference on Jetson. Firmware tuning, sensor fusion, and control loops for mobile platforms.",
    },
  ];

  // container
  const grid = document.createElement("div");
  grid.className = "exp-grid";

  data.forEach(({ title, body }) => {
    const card = document.createElement("article");
    card.className = "exp-card";
    card.innerHTML = `
      <h4 class="exp-title">${title}</h4>
      <p class="exp-body">${body}</p>
    `;
    grid.appendChild(card);
  });

  mount.innerHTML = "";
  mount.appendChild(header);
  mount.appendChild(grid);

  // header
  mount.style.opacity = 0;
  const hSpan = document.createElement("span");
  hSpan.dataset.full = header.textContent;
  hSpan.textContent = "";
  header.textContent = "";
  header.appendChild(hSpan);

  // cursor line (This like to break!)
  const scrollLine = document.createElement("p");
  scrollLine.innerHTML =
    '<span class="sig">></span> <span class="cmd"> echo "Press Enter to Continue...." </span>';
  scrollLine.style.marginBottom = "-25px";
  scrollLine.style.marginTop = "50px";
  mount.appendChild(scrollLine);

  moveCursorAfter(scrollLine.querySelector(".cmd"));
  mount.style.opacity = 1;
  await typeAcross([hSpan], 48);
}

async function showProjects() {
  /**
   * Projects: draggable, throwable nodes with click-to-open.
   * Physics loop stays the same; we only replaced per-node pointer handlers.
   */
  const mount = document.getElementById("projects-section");
  if (!mount) return;

  // ---------- header ----------
  const header = document.createElement("h3");
  header.className = "pane-title";
  header.textContent = '$ g++ projects.cpp -o projects && ./projects ';

  const wrap = document.createElement("div");
  wrap.className = "proj-wrap";

  const NS = "http://www.w3.org/2000/svg";
  const W = 1500, H = 494.5;
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "proj-svg hidden"); // hidden until typing ends
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

  // centralize links (swap these to your final targets)
  const links = {
    ai: "https://github.com/ShadowMP252",
    sys: "https://github.com/ShadowMP252",
    emb: "https://github.com/ShadowMP252",
    rob: "https://github.com/ShadowMP252",
    web: "https://github.com/ShadowMP252",
    soft: "https://github.com/ShadowMP252",
    data: "https://github.com/ShadowMP252",
    engine: "https://github.com/ShadowMP252"
  };

  const nodes = [
    { id:"ai",      x:200, y:200, r:70,  label:"AI" },
    { id:"sys",     x:370, y:150, r:55,  label:"Systems" },
    { id:"emb",     x:610, y:190, r:55,  label:"Embedded\nSystems" },
    { id:"rob",     x:800, y:180, r:70,  label:"Robotics" },
    { id:"web",     x:160, y:360, r:70,  label:"Web" },
    { id:"soft",    x:370, y:340, r:60,  label:"Software" },
    { id:"data",    x:610, y:350, r:70,  label:"Data" },
    { id:"engine",  x:360, y:440, r:60,  label:"Engines" },
  ].map(n => ({...n, vx:0, vy:0}));

  const nodeEls = nodes.map((n) => {
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "proj-node");
    // helps touch devices not pan the page during drag
    g.style.touchAction = "none";

    const c = document.createElementNS(NS, "circle");
    c.setAttribute("r", n.r);
    c.setAttribute("cx", n.x);
    c.setAttribute("cy", n.y);
    g.appendChild(c);

    // multiline label
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

    // ----- unified drag with "throw" + click-to-open -----
    let dragging = false;
    let moved = false;         // did we move enough to count as drag?
    let px = 0, py = 0, pt = 0; // previous pointer pos/time (client coords + ms)
    let t0 = 0;                // click timing start (ms)

    function endPointer(e){
      if (!dragging) return;
      dragging = false;
      g.classList.remove("dragging");
      try { g.releasePointerCapture(e.pointerId); } catch {}

      // If it was effectively a click, open link and cancel any throw
      const clickish = !moved && (performance.now() - t0 < 250);
      if (clickish && links[n.id]) {
        n.vx = 0; n.vy = 0;
        window.open(links[n.id], "_blank");
        return;
      }
      // else: keep last n.vx/n.vy → physics loop handles the throw
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

      // pause motion while dragging (we’ll restore via throw on release)
      n.vx = 0;
      n.vy = 0;
    });

    g.addEventListener("pointermove", (e) => {
      if (!dragging) return;

      // map client movement to SVG viewBox units
      const rect = svg.getBoundingClientRect();
      const sx = W / rect.width;
      const sy = H / rect.height;

      const dx = (e.clientX - px) * sx;
      const dy = (e.clientY - py) * sy;

      if (!moved && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) moved = true;

      // update position with wall-safe clamping
      n.x = Math.max(n.r, Math.min(W - n.r, n.x + dx));
      n.y = Math.max(n.r, Math.min(H - n.r, n.y + dy));

      // continuously estimate velocity for smooth throw
      const now = performance.now();
      const dt = Math.max(1, now - pt); // ms
      n.vx = (dx / dt) * 16;            // scale to ~60fps units
      n.vy = (dy / dt) * 16;

      px = e.clientX; py = e.clientY; pt = now;
    });

    g.addEventListener("pointerup", endPointer);
    g.addEventListener("pointercancel", endPointer);
    g.addEventListener("lostpointercapture", endPointer);

    return { g, c, texts, lineGap };
  });

  // ---------- physics (unchanged) ----------
  const damp   = 0.992;  // light damping
  const e      = 0.96;   // node↔node restitution
  const eWall  = 0.985;  // very bouncy walls
  const jitter = 0.004;  // tiny random kick (reduced to kill “seizure”)
  const accel  = 0.09;   // micro‑acceleration (a bit higher)

  // seed some initial motion
  nodes.forEach(n => {
    n.vx = (Math.random() - 0.5) * 10;
    n.vy = (Math.random() - 0.5) * 10;
  });

  function step() {
    nodes.forEach(n => {
      // micro‑accel + tiny jitter to avoid sticking
      n.vx += (Math.random() - 0.5) * accel + (Math.random() - 0.5) * jitter;
      n.vy += (Math.random() - 0.5) * accel + (Math.random() - 0.5) * jitter;

      n.vx *= damp;
      n.vy *= damp;

      // clamp speed
      const vmax = 14;
      const s = Math.hypot(n.vx, n.vy);
      if (s > vmax) { n.vx *= vmax / s; n.vy *= vmax / s; }

      n.x += n.vx; n.y += n.vy;
    });

    // walls
    nodes.forEach(n => {
      if (n.x < n.r)     { n.x = n.r;       n.vx =  Math.abs(n.vx) * eWall; }
      if (n.x > W-n.r)   { n.x = W-n.r;     n.vx = -Math.abs(n.vx) * eWall; }
      if (n.y < n.r)     { n.y = n.r;       n.vy =  Math.abs(n.vy) * eWall; }
      if (n.y > H-n.r)   { n.y = H-n.r;     n.vy = -Math.abs(n.vy) * eWall; }
    });

    // collisions
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        resolveCollision(nodes[i], nodes[j], e);
      }
    }
  }

  function resolveCollision(a, b, restitution) {
    const dx = b.x - a.x, dy = b.y - a.y;
    let d = Math.hypot(dx, dy);
    if (!d) return;
    const minDist = a.r + b.r;
    if (d >= minDist) return;

    const nx = dx / d, ny = dy / d;

    const rvx = b.vx - a.vx;
    const rvy = b.vy - a.vy;
    const velAlongNormal = rvx * nx + rvy * ny;

    const j = -(1 + restitution) * velAlongNormal / 2;
    a.vx -= j * nx; a.vy -= j * ny;
    b.vx += j * nx; b.vy += j * ny;

    // split overlap
    const overlap = (minDist - d) + 0.001;
    a.x -= overlap * 0.5 * nx; a.y -= overlap * 0.5 * ny;
    b.x += overlap * 0.5 * nx; b.y += overlap * 0.5 * ny;
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

  let loopStarted = false;
  function loop() {
    step(); draw();
    requestAnimationFrame(loop);
  }

  // ---------- mount & reveal ----------
  mount.innerHTML = "";
  mount.appendChild(header);
  wrap.appendChild(svg);
  mount.appendChild(wrap);

  // type header, THEN reveal nodes & start loop (once)
  mount.style.opacity = 0;
  const hSpan = document.createElement("span");
  hSpan.dataset.full = header.textContent;
  hSpan.textContent = "";
  header.textContent = "";
  header.appendChild(hSpan);

  const scrollLine = document.createElement("p");
  scrollLine.innerHTML = '<span class="sig">></span> <span class="cmd"> echo "Press Enter to Continue...." </span>';
  scrollLine.style.margin = "50px 0 -25px";
  mount.appendChild(scrollLine);
  moveCursorAfter(scrollLine.querySelector(".cmd"));

  mount.style.opacity = 1;
  await typeAcross([hSpan], 48);

  // reveal circles/text after typing
  svg.classList.remove("hidden");

  if (!loopStarted) {
    loopStarted = true;
    requestAnimationFrame(loop);
  }
}

async function showVideo() {
  const mount = document.getElementById("video-section");
  if (!mount) return;

  // ----- header -----
  const header = document.createElement("h3");
  header.className = "pane-title";
  header.textContent = '$ mpv ~/videos/developing.mp4 ';

  // ----- body -----
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

  // mount
  mount.innerHTML = "";
  mount.appendChild(header);
  mount.appendChild(wrap);
  mount.style.opacity = 0;

  const hSpan = document.createElement("span");
  hSpan.dataset.full = header.textContent;
  hSpan.textContent = "";
  header.textContent = "";
  header.appendChild(hSpan);

  const scrollLine = document.createElement("p");
  scrollLine.innerHTML =
    '<span class="sig">></span> <span class="cmd"> echo "Use Space=Play/Pause, ←/→=Seek, Enter = Continue" </span>';
  scrollLine.style.margin = "50px 0 -25px";
  mount.appendChild(scrollLine);
  moveCursorAfter(scrollLine.querySelector(".cmd"));

  mount.style.opacity = 1;
  await typeAcross([hSpan], 48);

  // ----- keyboard shortcuts -----
  // give video focus on click so Space works naturally
  vid.tabIndex = 0;
  wrap.addEventListener("click", () => vid.focus());

  document.addEventListener("keydown", onKeys);
  function onKeys(e) {
    // don't hijack when typing in inputs
    const tag = e.target.tagName;
    const interactive = /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/i.test(tag);
    if (interactive) return;

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
        vid.currentTime = Math.min(vid.duration || Infinity, vid.currentTime + 5);
        break;
      case "m":
        vid.muted = !vid.muted;
        break;
      case "f":
        if (!document.fullscreenElement) wrap.requestFullscreen?.();
        else document.exitFullscreen?.();
        break;
      default:
        break;
    }
  }

  // clean up listeners if this section is ever removed
  const observer = new MutationObserver(() => {
    if (!document.body.contains(mount)) {
      document.removeEventListener("keydown", onKeys);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

async function showBlogs() {
  const mount = document.getElementById("blog-section");
  if (!mount) return;

  // ----- header -----
  const header = document.createElement("h3");
  header.className = "pane-title";
  header.textContent = "$ ./blogPosts ";

  // ----- data (swap with real posts later) -----
  const posts = [
    {
      title: "Designing Terminal UX",
      sub: "Case study",
      blurb:
        "How I built a scroll‑locked terminal with typewriter prompts and physics-driven nodes.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Repo", href: "#" },
      ],
    },
    {
      title: "Physics Nodes",
      sub: "Dev log",
      blurb:
        "Collision tuning, throw velocities, and why tiny jitter fixes sticky overlaps.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Notes", href: "#" },
      ],
    },
    {
      title: "Video Pane",
      sub: "Implementation",
      blurb:
        "Keyboard controls (space/←/→/m/f) and keeping layout stable with box-sizing.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Demo", href: "#" },
      ],
    },
    {
      title: "Architecture Threads",
      sub: "Opinion",
      blurb:
        "Why systems thinking beats feature frenzy—and how to ship clean interfaces.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Slides", href: "#" },
      ],
    },
    {
      title: "Embedded Notes",
      sub: "R&D",
      blurb:
        "Edge inference patterns and timing budgets that actually hold up on device.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Benchmarks", href: "#" },
      ],
    },
    {
      title: "Data Pipelines",
      sub: "Playbook",
      blurb:
        "Ingestion → modeling → APIs with observability from day one. No heroics needed.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Code", href: "#" },
      ],
    },
    {
      title: "Architecture Threads",
      sub: "Opinion",
      blurb:
        "Why systems thinking beats feature frenzy—and how to ship clean interfaces.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Slides", href: "#" },
      ],
    },
    {
      title: "Embedded Notes",
      sub: "R&D",
      blurb:
        "Edge inference patterns and timing budgets that actually hold up on device.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Benchmarks", href: "#" },
      ],
    },
    {
      title: "Data Pipelines",
      sub: "Playbook",
      blurb:
        "Ingestion → modeling → APIs with observability from day one. No heroics needed.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Code", href: "#" },
      ],
    },
    {
      title: "Architecture Threads",
      sub: "Opinion",
      blurb:
        "Why systems thinking beats feature frenzy—and how to ship clean interfaces.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Slides", href: "#" },
      ],
    },
    {
      title: "Embedded Notes",
      sub: "R&D",
      blurb:
        "Edge inference patterns and timing budgets that actually hold up on device.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Benchmarks", href: "#" },
      ],
    },
    {
      title: "Data Pipelines",
      sub: "Playbook",
      blurb:
        "Ingestion → modeling → APIs with observability from day one. No heroics needed.",
      links: [
        { label: "Read more", href: "#" },
        { label: "Code", href: "#" },
      ],
    },
  ];

  // ----- grid -----
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
      </div>
    `;
    grid.appendChild(card);
  });

  // ----- mount & type header -----
  mount.innerHTML = "";
  mount.appendChild(header);
  mount.appendChild(grid);
  mount.style.opacity = 0;

  const hSpan = document.createElement("span");
  hSpan.dataset.full = header.textContent;
  hSpan.textContent = "";
  header.textContent = "";
  header.appendChild(hSpan);

  const scrollLine = document.createElement("p");
  scrollLine.innerHTML =
    '<span class="sig">></span> <span class="cmd"> echo "Press Enter to Continue...." </span>';
  scrollLine.style.margin = "36px 0 -25px";
  mount.appendChild(scrollLine);
  moveCursorAfter(scrollLine.querySelector(".cmd"));

  mount.style.opacity = 1;
  await typeAcross([hSpan], 48);
}

document.addEventListener("DOMContentLoaded", () => {
  animatePane();
  startMusic();
});
