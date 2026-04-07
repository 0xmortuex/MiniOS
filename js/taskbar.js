// Taskbar - start menu, system tray, clock, window buttons
const Taskbar = (() => {
  let windowButtons = {};
  let clockInterval = null;

  function init() {
    setupClock();
    setupStartButton();
    setupTray();
    setupPower();
    setupStartMenu();
  }

  function setupClock() {
    const clockEl = document.getElementById('tray-clock');
    function update() {
      const now = new Date();
      const is24h = localStorage.getItem('minios_24h') === 'true';
      let h = now.getHours();
      let ampm = '';
      if (!is24h) {
        ampm = h >= 12 ? ' PM' : ' AM';
        h = h % 12 || 12;
      }
      const m = String(now.getMinutes()).padStart(2, '0');
      clockEl.innerHTML = `${h}:${m}${ampm}`;
      clockEl.title = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    update();
    clockInterval = setInterval(update, 10000);
  }

  function setupStartButton() {
    const btn = document.getElementById('start-button');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleStartMenu();
    });
  }

  function toggleStartMenu() {
    const menu = document.getElementById('start-menu');
    const btn = document.getElementById('start-button');
    const isOpen = !menu.classList.contains('hidden');
    if (isOpen) {
      menu.classList.add('hidden');
      btn.classList.remove('active');
    } else {
      menu.classList.remove('hidden');
      btn.classList.add('active');
      document.getElementById('start-search-input').value = '';
      document.getElementById('start-search-input').focus();
      filterStartApps('');
      closePowerMenu();
    }
  }

  function closeStartMenu() {
    document.getElementById('start-menu').classList.add('hidden');
    document.getElementById('start-button').classList.remove('active');
  }

  function setupStartMenu() {
    const pinned = document.getElementById('pinned-apps');
    const allList = document.getElementById('all-apps-list');
    const searchInput = document.getElementById('start-search-input');

    const apps = Apps.getAppList();
    const pinnedApps = ['file-explorer', 'notepad', 'calculator', 'terminal', 'browser', 'settings', 'music-player', 'image-viewer'];

    // Pinned
    pinnedApps.forEach(appId => {
      const app = apps.find(a => a.id === appId);
      if (!app) return;
      const item = document.createElement('div');
      item.className = 'start-app-item';
      item.dataset.appId = appId;
      item.innerHTML = `${AppIcons.get(appId)}<span>${app.name}</span>`;
      item.addEventListener('click', () => { Apps.open(appId); closeStartMenu(); });
      pinned.appendChild(item);
    });

    // All apps
    function renderAllApps(filter) {
      allList.innerHTML = '';
      apps.filter(a => a.name.toLowerCase().includes(filter.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(app => {
          const item = document.createElement('div');
          item.className = 'start-all-item';
          item.innerHTML = `${AppIcons.get(app.id)}<span>${app.name}</span>`;
          item.addEventListener('click', () => { Apps.open(app.id); closeStartMenu(); });
          allList.appendChild(item);
        });
    }
    renderAllApps('');

    searchInput.addEventListener('input', () => renderAllApps(searchInput.value));

    // User
    const username = localStorage.getItem('minios_username') || 'User';
    document.getElementById('start-username').textContent = username;
    document.getElementById('start-user-avatar').textContent = username.charAt(0).toUpperCase();

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#start-menu') && !e.target.closest('#start-button')) {
        closeStartMenu();
      }
      if (!e.target.closest('#notifications-dropdown') && !e.target.closest('#tray-notifications')) {
        document.getElementById('notifications-dropdown').classList.add('hidden');
      }
      if (!e.target.closest('#power-menu') && !e.target.closest('#start-power')) {
        closePowerMenu();
      }
    });

    // Escape to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeStartMenu();
        closePowerMenu();
        document.getElementById('notifications-dropdown').classList.add('hidden');
      }
    });
  }

  function filterStartApps(query) {
    const allList = document.getElementById('all-apps-list');
    const apps = Apps.getAppList();
    allList.innerHTML = '';
    apps.filter(a => a.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(app => {
        const item = document.createElement('div');
        item.className = 'start-all-item';
        item.innerHTML = `${AppIcons.get(app.id)}<span>${app.name}</span>`;
        item.addEventListener('click', () => { Apps.open(app.id); closeStartMenu(); });
        allList.appendChild(item);
      });
  }

  function setupTray() {
    document.getElementById('tray-notifications').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('notifications-dropdown').classList.toggle('hidden');
    });

    document.getElementById('tray-volume').addEventListener('click', () => {
      // Toggle mute visual feedback
      const btn = document.getElementById('tray-volume');
      btn.classList.toggle('muted');
    });
  }

  function setupPower() {
    document.getElementById('start-power').addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = document.getElementById('power-menu');
      menu.classList.toggle('hidden');
    });

    document.getElementById('power-restart').addEventListener('click', () => {
      closePowerMenu();
      closeStartMenu();
      Boot.restart();
    });

    document.getElementById('power-shutdown').addEventListener('click', () => {
      closePowerMenu();
      closeStartMenu();
      Boot.shutdown();
    });
  }

  function closePowerMenu() {
    document.getElementById('power-menu').classList.add('hidden');
  }

  // Window taskbar buttons
  function addWindow(win) {
    const container = document.getElementById('taskbar-windows');
    const btn = document.createElement('button');
    btn.className = 'taskbar-btn';
    btn.dataset.winId = win.id;
    btn.innerHTML = `${win.icon || ''}<span>${win.title}</span>`;
    btn.title = win.title;
    btn.addEventListener('click', () => WindowManager.toggleByTaskbar(win.id));
    btn.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      ContextMenu.show(e.clientX, e.clientY, [
        { label: 'Minimize', action: () => WindowManager.minimizeWindow(win) },
        { label: 'Maximize', action: () => WindowManager.toggleMaximize(win) },
        { separator: true },
        { label: 'Close', action: () => WindowManager.closeById(win.id) }
      ]);
    });
    container.appendChild(btn);
    windowButtons[win.id] = btn;
  }

  function removeWindow(winId) {
    if (windowButtons[winId]) {
      windowButtons[winId].remove();
      delete windowButtons[winId];
    }
  }

  function updateWindow(win) {
    if (windowButtons[win.id]) {
      windowButtons[win.id].querySelector('span').textContent = win.title;
      windowButtons[win.id].title = win.title;
    }
  }

  function setActive(winId) {
    Object.keys(windowButtons).forEach(id => {
      windowButtons[id].classList.toggle('active', id === winId);
    });
  }

  function refreshUsername() {
    const username = localStorage.getItem('minios_username') || 'User';
    document.getElementById('start-username').textContent = username;
    document.getElementById('start-user-avatar').textContent = username.charAt(0).toUpperCase();
  }

  return {
    init, addWindow, removeWindow, updateWindow, setActive,
    toggleStartMenu, closeStartMenu, refreshUsername
  };
})();
