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
  await wait(3000);

  hr.style.opacity = 0;

  for (const p of prompts) {
    p.style.opacity = 0;
  }
}
function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

document.addEventListener("DOMContentLoaded", animatePane);
