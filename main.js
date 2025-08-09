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
}
function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function showSkills() {
  const mount = document.getElementById("skills-section");

  const header = document.createElement("h3");
  header.className = "pane-title";
  header.textContent = "> ./skills ";

  const line = document.createElement("p");
  line.className = "prompt";
  line.innerHTML = '<span class="sig">$</span> listing skills...';

  const ul = document.createElement("ul");
  ul.style.listStyle = "square";
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
  mount.appendChild(line);
  mount.appendChild(ul);
  mount.appendChild(table);
  mount.style.opacity = 0;

  const hSpan = document.createElement("span");
  hSpan.dataset.full = header.textContent;
  hSpan.textContent = "";
  header.textContent = "";
  header.appendChild(hSpan);
    
    const scrollLine = document.createElement("p");
    scrollLine.innerHTML = '<span class="sig">></span> <span class="cmd"> echo "Please Scroll Down" </span> ';
    scrollLine.style.marginBottom = "-25px";
    scrollLine.style.marginTop= "50px";
    mount.appendChild(scrollLine);

    // place cursor after the command span
     const cmd = scrollLine.querySelector('.cmd');
    moveCursorAfter(cmd);     
    mount.style.opacity = 1;
  await typeAcross([hSpan], 48);

}

document.addEventListener("DOMContentLoaded", animatePane);

