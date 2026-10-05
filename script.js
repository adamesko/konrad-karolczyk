// --- tło: sieć cząsteczek reagująca na mysz ---
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
const mouse = { x: -9999, y: -9999 };
let w, h, dots;

function resize() {
  w = canvas.width = innerWidth;
  h = canvas.height = innerHeight;
  const n = Math.min(120, Math.floor((w * h) / 14000));
  dots = Array.from({ length: n }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
  }));
}
addEventListener("resize", resize);
resize();

function frame() {
  ctx.clearRect(0, 0, w, h);
  for (const d of dots) {
    d.x += d.vx; d.y += d.vy;
    if (d.x < 0 || d.x > w) d.vx *= -1;
    if (d.y < 0 || d.y > h) d.vy *= -1;
    const dx = d.x - mouse.x, dy = d.y - mouse.y, dist = Math.hypot(dx, dy);
    if (dist < 140) { d.x += (dx / dist) * 2; d.y += (dy / dist) * 2; }
    ctx.fillStyle = "rgba(0,240,255,.8)";
    ctx.beginPath(); ctx.arc(d.x, d.y, 1.6, 0, 7); ctx.fill();
  }
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const d = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
      if (d < 120) {
        ctx.strokeStyle = `rgba(255,43,214,${(1 - d / 120) * 0.35})`;
        ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y); ctx.stroke();
      }
    }
  }
  requestAnimationFrame(frame);
}
frame();

// --- poświata za kursorem ---
const glow = document.getElementById("glow");
addEventListener("pointermove", (e) => {
  mouse.x = e.clientX; mouse.y = e.clientY;
  glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
});

// --- maszyna do pisania ---
const lines = [
  "Fajny gość.",
  "Naprawdę fajny gość.",
  "Legenda w swoim własnym czasie.",
  "Fakt naukowo niepodważalny.",
];
const typed = document.getElementById("typed");
let li = 0, ci = 0, del = false;
(function type() {
  const line = lines[li];
  typed.textContent = line.slice(0, ci);
  if (!del && ci === line.length) { del = true; return setTimeout(type, 1600); }
  if (del && ci === 0) { del = false; li = (li + 1) % lines.length; }
  ci += del ? -1 : 1;
  setTimeout(type, del ? 35 : 80);
})();

// --- konfetti ---
const confetti = [];
function boom(x, y) {
  const colors = ["#00f0ff", "#ff2bd6", "#7c4dff", "#ffe14d"];
  for (let i = 0; i < 90; i++) {
    const a = Math.random() * Math.PI * 2, s = 3 + Math.random() * 9;
    confetti.push({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 4,
      r: 3 + Math.random() * 4, c: colors[i % colors.length], life: 100 + Math.random() * 60,
    });
  }
}
const fx = document.createElement("canvas");
Object.assign(fx.style, { position: "fixed", inset: 0, zIndex: 9, pointerEvents: "none" });
document.body.appendChild(fx);
const fctx = fx.getContext("2d");
function fxLoop() {
  fx.width = innerWidth; fx.height = innerHeight;
  for (let i = confetti.length - 1; i >= 0; i--) {
    const p = confetti[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.25; p.vx *= 0.99; p.life--;
    fctx.fillStyle = p.c; fctx.globalAlpha = Math.max(0, p.life / 100);
    fctx.fillRect(p.x, p.y, p.r, p.r * 1.6);
    if (p.life <= 0) confetti.splice(i, 1);
  }
  requestAnimationFrame(fxLoop);
}
fxLoop();
document.getElementById("party").addEventListener("click", (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  boom(r.left + r.width / 2, r.top + r.height / 2);
  setTimeout(() => boom(innerWidth * 0.25, innerHeight * 0.4), 200);
  setTimeout(() => boom(innerWidth * 0.75, innerHeight * 0.4), 400);
});
addEventListener("click", (e) => { if (!e.target.closest("#party")) boom(e.clientX, e.clientY); });

// --- tilt 3D na kartach ---
document.querySelectorAll(".tilt").forEach((el) => {
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${x * 18}deg) rotateX(${-y * 18}deg) scale(1.03)`;
  });
  el.addEventListener("pointerleave", () => (el.style.transform = ""));
});

// --- pojawianie przy scrollu + liczniki ---
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add("in");
    io.unobserve(en.target);
  });
}, { threshold: 0.2 });
document.querySelectorAll(".card").forEach((c, i) => { c.style.transitionDelay = i * 120 + "ms"; io.observe(c); });

const countIO = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    const el = en.target, to = +el.dataset.to, t0 = performance.now();
    (function tick(t) {
      const p = Math.min(1, (t - t0) / 1800);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
    countIO.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll(".num").forEach((n) => countIO.observe(n));
