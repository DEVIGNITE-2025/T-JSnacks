(() => {
  const LINE_DIST = 130;
  const PARTICLE_COUNT_FACTOR = 0.00008;
  const MIN_PARTICLES = 30;
  const MAX_PARTICLES = 120;
  const DOT_RADIUS = 2;
  const SPEED = 0.35;
  const COLOR = "200, 170, 60";
  const LINE_ALPHA = 0.18;
  const DOT_ALPHA = 0.45;

  class ParticleNetwork {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.particles = [];
      this.raf = null;
      this.running = false;
    }

    resize() {
      const section = this.canvas.parentElement;
      const rect = section.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.w = rect.width;
      this.h = rect.height;
      this.canvas.width = this.w * dpr;
      this.canvas.height = this.h * dpr;
      this.canvas.style.width = this.w + "px";
      this.canvas.style.height = this.h + "px";
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    init() {
      this.resize();
      const area = this.w * this.h;
      const count = Math.max(MIN_PARTICLES, Math.min(MAX_PARTICLES, Math.round(area * PARTICLE_COUNT_FACTOR)));
      this.particles = [];
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.w,
          y: Math.random() * this.h,
          vx: (Math.random() - 0.5) * SPEED * 2,
          vy: (Math.random() - 0.5) * SPEED * 2,
        });
      }
    }

    start() {
      if (this.running) return;
      this.running = true;
      this.loop();
    }

    stop() {
      this.running = false;
      if (this.raf) {
        cancelAnimationFrame(this.raf);
        this.raf = null;
      }
    }

    loop() {
      if (!this.running) return;
      this.update();
      this.draw();
      this.raf = requestAnimationFrame(() => this.loop());
    }

    update() {
      const w = this.w;
      const h = this.h;
      for (const p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > w) { p.x = w; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > h) { p.y = h; p.vy *= -1; }
      }
    }

    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      const pts = this.particles;
      const dist2 = LINE_DIST * LINE_DIST;

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < dist2) {
            const alpha = LINE_ALPHA * (1 - d2 / dist2);
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(${COLOR}, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${COLOR}, ${DOT_ALPHA})`;
        ctx.fill();
      }
    }
  }

  const ids = ["particlesHero", "particlesProducts", "particlesContact"];
  const networks = [];

  const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!motionOk) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const net = networks.find((n) => n.canvas === entry.target);
        if (!net) continue;
        if (entry.isIntersecting) {
          net.start();
        } else {
          net.stop();
        }
      }
    },
    { threshold: 0 }
  );

  for (const id of ids) {
    const canvas = document.getElementById(id);
    if (!canvas) continue;
    const net = new ParticleNetwork(canvas);
    net.init();
    networks.push(net);
    observer.observe(canvas);
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      for (const net of networks) {
        net.init();
      }
    }, 200);
  });
})();
