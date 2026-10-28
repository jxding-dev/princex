// 불씨 파티클
(() => {
  const cv = document.getElementById('embers');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return cv.remove();
  const ctx = cv.getContext('2d');
  let w, h, dpr;
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = cv.width = innerWidth * dpr;
    h = cv.height = innerHeight * dpr;
  };
  addEventListener('resize', resize);
  resize();

  const make = fromBottom => ({
    x: Math.random() * w,
    y: fromBottom ? h + 10 : Math.random() * h,
    r: (Math.random() * 1.8 + .6) * dpr,
    vy: (Math.random() * .5 + .25) * dpr,
    sway: Math.random() * 6.283,
    a: Math.random() * .7 + .3,
  });
  const ps = Array.from({ length: Math.round(innerWidth / 18) }, () => make(false));

  (function frame() {
    ctx.clearRect(0, 0, w, h);
    ps.forEach((p, i) => {
      p.y -= p.vy;
      p.sway += .015;
      p.x += Math.sin(p.sway) * .4 * dpr;
      p.a -= .0008;
      if (p.y < -10 || p.a <= 0) ps[i] = make(true);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      g.addColorStop(0, `rgba(255,190,100,${p.a})`);
      g.addColorStop(1, 'rgba(255,100,30,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, 6.283);
      ctx.fill();
    });
    requestAnimationFrame(frame);
  })();
})();
