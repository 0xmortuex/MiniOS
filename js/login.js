/* ── Login / Lock Screen Module ── */
const Login = (function () {
  let clockInterval = null;

  /* ── Avatar SVGs (monochrome #cdd6f4) ── */
  function getAvatarSVG(id) {
    const c = '#cdd6f4';
    const svgs = {
      user: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="22" r="12" fill="${c}"/>
        <path d="M10 58c0-14 10-22 22-22s22 8 22 22" fill="${c}"/>
      </svg>`,

      cat: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 18l8 14h-2z" fill="${c}"/>
        <path d="M52 18l-8 14h2z" fill="${c}"/>
        <ellipse cx="32" cy="38" rx="18" ry="16" fill="${c}"/>
        <circle cx="24" cy="34" r="3" fill="#1e1e2e"/>
        <circle cx="40" cy="34" r="3" fill="#1e1e2e"/>
        <ellipse cx="32" cy="40" rx="2.5" ry="1.5" fill="#1e1e2e"/>
        <line x1="14" y1="38" x2="24" y2="36" stroke="#1e1e2e" stroke-width="1.2"/>
        <line x1="14" y1="42" x2="24" y2="40" stroke="#1e1e2e" stroke-width="1.2"/>
        <line x1="50" y1="38" x2="40" y2="36" stroke="#1e1e2e" stroke-width="1.2"/>
        <line x1="50" y1="42" x2="40" y2="40" stroke="#1e1e2e" stroke-width="1.2"/>
      </svg>`,

      robot: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="20" width="36" height="32" rx="6" fill="${c}"/>
        <rect x="22" y="30" width="8" height="6" rx="1" fill="#1e1e2e"/>
        <rect x="34" y="30" width="8" height="6" rx="1" fill="#1e1e2e"/>
        <rect x="26" y="42" width="12" height="4" rx="1" fill="#1e1e2e"/>
        <line x1="32" y1="12" x2="32" y2="20" stroke="${c}" stroke-width="2"/>
        <circle cx="32" cy="10" r="3" fill="${c}"/>
        <rect x="6" y="32" width="6" height="10" rx="2" fill="${c}"/>
        <rect x="52" y="32" width="6" height="10" rx="2" fill="${c}"/>
      </svg>`,

      alien: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="32" cy="36" rx="22" ry="24" fill="${c}"/>
        <ellipse cx="22" cy="32" rx="6" ry="8" fill="#1e1e2e"/>
        <ellipse cx="42" cy="32" rx="6" ry="8" fill="#1e1e2e"/>
        <ellipse cx="32" cy="46" rx="3" ry="2" fill="#1e1e2e"/>
      </svg>`,

      skull: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="32" cy="30" rx="20" ry="22" fill="${c}"/>
        <circle cx="24" cy="28" r="5" fill="#1e1e2e"/>
        <circle cx="40" cy="28" r="5" fill="#1e1e2e"/>
        <path d="M26 42 v6" stroke="#1e1e2e" stroke-width="2"/>
        <path d="M32 42 v6" stroke="#1e1e2e" stroke-width="2"/>
        <path d="M38 42 v6" stroke="#1e1e2e" stroke-width="2"/>
        <rect x="22" y="50" width="20" height="6" rx="2" fill="${c}"/>
      </svg>`,

      star: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="32,4 39,24 60,24 43,37 49,58 32,46 15,58 21,37 4,24 25,24" fill="${c}"/>
      </svg>`
    };

    return svgs[id] || svgs.user;
  }

  /* ── Helpers ── */
  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function formatTime() {
    const d = new Date();
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function formatDate() {
    const d = new Date();
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }

  function startClock(timeEl, dateEl) {
    function tick() {
      timeEl.textContent = formatTime();
      dateEl.textContent = formatDate();
    }
    tick();
    clockInterval = setInterval(tick, 1000);
  }

  function stopClock() {
    if (clockInterval) {
      clearInterval(clockInterval);
      clockInterval = null;
    }
  }

  /* ── Build login screen DOM ── */
  function buildScreen() {
    let screen = document.getElementById('login-screen');
    if (screen) {
      screen.classList.remove('fade-out');
      screen.style.display = '';
      return screen;
    }

    screen = document.createElement('div');
    screen.id = 'login-screen';

    const avatarId = localStorage.getItem('minios_avatar') || 'user';
    const username = localStorage.getItem('minios_username') || 'User';

    screen.innerHTML = `
      <div class="login-clock">
        <div class="login-clock-time"></div>
        <div class="login-clock-date"></div>
      </div>
      <div class="login-avatar">${getAvatarSVG(avatarId)}</div>
      <div class="login-username">${username}</div>
      <div class="login-password-row">
        <input class="login-password-input" type="password" placeholder="Password" autocomplete="off" />
        <button class="login-submit-btn" aria-label="Sign in">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>`;

    document.body.appendChild(screen);
    return screen;
  }

  /* ── Attempt login ── */
  function tryLogin(screen, onSuccess) {
    const input = screen.querySelector('.login-password-input');
    const stored = localStorage.getItem('minios_password') || '';
    const value = input.value;

    if (!stored || value === stored) {
      stopClock();
      screen.classList.add('fade-out');
      setTimeout(function () {
        screen.style.display = 'none';
        if (onSuccess) onSuccess();
      }, 500);
    } else {
      input.classList.add('shake');
      input.value = '';
      setTimeout(function () {
        input.classList.remove('shake');
      }, 500);
    }
  }

  /* ── Public API ── */

  function show(onSuccess) {
    const screen = buildScreen();

    const timeEl = screen.querySelector('.login-clock-time');
    const dateEl = screen.querySelector('.login-clock-date');
    startClock(timeEl, dateEl);

    const input = screen.querySelector('.login-password-input');
    const btn = screen.querySelector('.login-submit-btn');

    // Remove old listeners by replacing elements
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') tryLogin(screen, onSuccess);
    });
    newBtn.addEventListener('click', function () {
      tryLogin(screen, onSuccess);
    });

    // Focus password field after a brief delay (let transition start)
    setTimeout(function () {
      newInput.focus();
    }, 100);
  }

  function lock() {
    var desktop = document.getElementById('desktop');
    var taskbar = document.getElementById('taskbar');
    if (desktop) desktop.classList.add('hidden');
    if (taskbar) taskbar.classList.add('hidden');

    show(function () {
      if (desktop) desktop.classList.remove('hidden');
      if (taskbar) taskbar.classList.remove('hidden');
    });
  }

  return {
    show: show,
    lock: lock,
    getAvatarSVG: getAvatarSVG
  };
})();
