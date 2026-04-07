// Boot Sequence
const Boot = (() => {
  const bootMessages = [
    '[OK] Starting MiniOS kernel...',
    '[OK] Loading file system...',
    '[OK] Initializing window manager...',
    '[OK] Mounting virtual drives...',
    '[OK] Loading system configuration...',
    '[OK] Starting network services...',
    '[OK] Starting desktop environment...',
  ];

  let bootStartTime = Date.now();

  function run() {
    bootStartTime = Date.now();
    const screen = document.getElementById('boot-screen');
    screen.classList.remove('hidden', 'fade-out');
    screen.innerHTML = '';

    const hasBooted = localStorage.getItem('minios_has_booted');

    if (hasBooted) {
      // Quick boot
      screen.innerHTML = `
        <div class="boot-logo">Mini<span>OS</span></div>
        <div class="boot-spinner"></div>
      `;
      setTimeout(() => transitionToDesktop(), 1200);
    } else {
      // Full boot
      screen.innerHTML = `
        <div class="boot-logo">Mini<span>OS</span></div>
        <div class="boot-spinner"></div>
        <div class="boot-log"></div>
      `;

      const log = screen.querySelector('.boot-log');
      bootMessages.forEach((msg, i) => {
        setTimeout(() => {
          const line = document.createElement('div');
          line.className = 'boot-log-line';
          line.innerHTML = msg.replace('[OK]', '<span class="ok">[OK]</span>');
          log.appendChild(line);

          if (i === bootMessages.length - 1) {
            setTimeout(() => transitionToDesktop(), 600);
          }
        }, 800 + i * 200);
      });

      localStorage.setItem('minios_has_booted', 'true');
    }
  }

  function transitionToDesktop() {
    const screen = document.getElementById('boot-screen');
    screen.classList.add('fade-out');

    document.getElementById('desktop').classList.remove('hidden');
    document.getElementById('taskbar').classList.remove('hidden');

    setTimeout(() => {
      screen.classList.add('hidden');
      initDesktop();
    }, 500);
  }

  function initDesktop() {
    Desktop.init();
    Taskbar.init();
  }

  function restart() {
    // Hide everything
    document.getElementById('desktop').classList.add('hidden');
    document.getElementById('taskbar').classList.add('hidden');
    document.getElementById('start-menu').classList.add('hidden');

    // Close all windows
    const wins = WindowManager.getWindows().slice();
    wins.forEach(w => WindowManager.closeById(w.id));

    // Re-run boot
    localStorage.removeItem('minios_has_booted');
    setTimeout(() => run(), 300);
  }

  function shutdown() {
    const screen = document.getElementById('shutdown-screen');
    screen.classList.remove('hidden');
    setTimeout(() => screen.classList.add('visible'), 10);

    setTimeout(() => {
      document.getElementById('desktop').classList.add('hidden');
      document.getElementById('taskbar').classList.add('hidden');
      document.getElementById('start-menu').classList.add('hidden');
      document.getElementById('shutdown-text').textContent = "It's safe to close this tab.";
    }, 2000);
  }

  function getUptime() {
    return Math.floor((Date.now() - bootStartTime) / 1000);
  }

  return { run, restart, shutdown, getUptime };
})();
