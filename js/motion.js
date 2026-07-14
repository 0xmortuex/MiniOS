// Motion System - shared reduced-motion gating, pointer-origin tracking, and
// a tasteful rAF-driven wallpaper parallax. Everything here animates only
// transform/opacity and is skipped entirely under prefers-reduced-motion.
const MotionSystem = (() => {
  let lastPointer = { x: window.innerWidth / 2, y: window.innerHeight - 24 };

  function reduced() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // Track the last pointer-down position anywhere in the document so window
  // open/close animations can scale from the point that triggered them
  // (desktop icon dblclick, taskbar button, start menu item, etc.)
  document.addEventListener('mousedown', (e) => {
    lastPointer = { x: e.clientX, y: e.clientY };
  }, true);

  function getLastPointer() {
    return lastPointer;
  }

  // Subtle wallpaper parallax - transform-only, rAF-batched, disabled under
  // reduced motion. Purely decorative flourish.
  function initParallax() {
    if (reduced()) return;
    const wallpaper = document.getElementById('desktop-wallpaper');
    if (!wallpaper) return;

    let targetX = 0, targetY = 0, curX = 0, curY = 0, ticking = false;

    function tick() {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      wallpaper.style.transform = `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0) scale(1.02)`;
      if (Math.abs(targetX - curX) > 0.05 || Math.abs(targetY - curY) > 0.05) {
        requestAnimationFrame(tick);
      } else {
        ticking = false;
      }
    }

    document.addEventListener('mousemove', (e) => {
      const desktop = document.getElementById('desktop');
      if (!desktop || desktop.classList.contains('hidden')) return;
      targetX = ((e.clientX / window.innerWidth) - 0.5) * 14;
      targetY = ((e.clientY / window.innerHeight) - 0.5) * 14;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(tick);
      }
    }, { passive: true });
  }

  initParallax();

  return { reduced, getLastPointer, initParallax };
})();
