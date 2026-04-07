// App Icons - all inline SVGs
const AppIcons = (() => {
  const icons = {
    'file-explorer': '<svg viewBox="0 0 48 48"><rect x="4" y="12" width="40" height="28" rx="3" fill="#89b4fa" opacity="0.85"/><path d="M4 15a3 3 0 013-3h12l4 4h18a3 3 0 013 3v21a3 3 0 01-3 3H7a3 3 0 01-3-3V15z" fill="#89b4fa"/></svg>',
    'terminal': '<svg viewBox="0 0 48 48"><rect x="4" y="8" width="40" height="32" rx="4" fill="#1e1e2e" stroke="#6c7086" stroke-width="1.5"/><path d="M12 20l6 4-6 4" stroke="#a6e3a1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="22" y1="28" x2="32" y2="28" stroke="#6c7086" stroke-width="2.5" stroke-linecap="round"/></svg>',
    'notepad': '<svg viewBox="0 0 48 48"><rect x="8" y="4" width="32" height="40" rx="3" fill="#313244"/><rect x="8" y="4" width="32" height="8" rx="3" fill="#45475a"/><line x1="14" y1="18" x2="34" y2="18" stroke="#6c7086" stroke-width="1.5"/><line x1="14" y1="24" x2="34" y2="24" stroke="#6c7086" stroke-width="1.5"/><line x1="14" y1="30" x2="28" y2="30" stroke="#6c7086" stroke-width="1.5"/><line x1="14" y1="36" x2="24" y2="36" stroke="#6c7086" stroke-width="1.5"/></svg>',
    'calculator': '<svg viewBox="0 0 48 48"><rect x="8" y="4" width="32" height="40" rx="4" fill="#313244"/><rect x="12" y="8" width="24" height="10" rx="2" fill="#1e1e2e"/><circle cx="16" cy="24" r="2.5" fill="#89b4fa"/><circle cx="24" cy="24" r="2.5" fill="#89b4fa"/><circle cx="32" cy="24" r="2.5" fill="#89b4fa"/><circle cx="16" cy="32" r="2.5" fill="#cdd6f4"/><circle cx="24" cy="32" r="2.5" fill="#cdd6f4"/><circle cx="32" cy="32" r="2.5" fill="#cdd6f4"/><circle cx="16" cy="40" r="2.5" fill="#cdd6f4"/><circle cx="24" cy="40" r="2.5" fill="#cdd6f4"/><circle cx="32" cy="40" r="2.5" fill="#a6e3a1"/></svg>',
    'settings': '<svg viewBox="0 0 48 48"><path d="M24 16a8 8 0 100 16 8 8 0 000-16z" fill="none" stroke="#89b4fa" stroke-width="2.5"/><path d="M38.6 27.2l2.5 1.4a1 1 0 01.4 1.3l-2.5 4.3a1 1 0 01-1.2.4l-2.9-1.2a11 11 0 01-2.7 1.6l-.4 3.1a1 1 0 01-1 .9h-5a1 1 0 01-1-.8l-.4-3.1a11 11 0 01-2.7-1.6l-2.9 1.2a1 1 0 01-1.2-.4l-2.5-4.3a1 1 0 01.4-1.3l2.5-1.4a9 9 0 010-3.3l-2.5-1.4a1 1 0 01-.4-1.3l2.5-4.3a1 1 0 011.2-.4l2.9 1.2a11 11 0 012.7-1.6l.4-3.1a1 1 0 011-.9h5a1 1 0 011 .8l.4 3.1a11 11 0 012.7 1.6l2.9-1.2a1 1 0 011.2.4l2.5 4.3a1 1 0 01-.4 1.3l-2.5 1.4a9 9 0 010 3.3z" fill="none" stroke="#6c7086" stroke-width="1.5"/></svg>',
    'browser': '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="18" fill="none" stroke="#89b4fa" stroke-width="2.5"/><ellipse cx="24" cy="24" rx="8" ry="18" fill="none" stroke="#89b4fa" stroke-width="1.5"/><line x1="6" y1="24" x2="42" y2="24" stroke="#89b4fa" stroke-width="1.5"/><line x1="24" y1="6" x2="24" y2="42" stroke="#89b4fa" stroke-width="1.5"/></svg>',
    'music-player': '<svg viewBox="0 0 48 48"><rect x="6" y="6" width="36" height="36" rx="8" fill="#313244"/><circle cx="24" cy="24" r="10" fill="none" stroke="#89b4fa" stroke-width="2"/><circle cx="24" cy="24" r="3" fill="#89b4fa"/><path d="M24 14v10l6 4" fill="none" stroke="#cba6f7" stroke-width="1.5" stroke-linecap="round"/></svg>',
    'image-viewer': '<svg viewBox="0 0 48 48"><rect x="4" y="8" width="40" height="32" rx="3" fill="#313244"/><circle cx="16" cy="20" r="4" fill="#f9e2af"/><path d="M4 36l12-10 8 6 8-12 12 16H4z" fill="#a6e3a1" opacity="0.6"/></svg>',
    'recycle-bin': '<svg viewBox="0 0 48 48"><path d="M12 16h24l-2 24H14L12 16z" fill="#45475a"/><rect x="10" y="12" width="28" height="4" rx="1" fill="#6c7086"/><path d="M18 12V9a3 3 0 013-3h6a3 3 0 013 3v3" fill="none" stroke="#6c7086" stroke-width="1.5"/><line x1="20" y1="20" x2="20" y2="36" stroke="#6c7086" stroke-width="1.5"/><line x1="24" y1="20" x2="24" y2="36" stroke="#6c7086" stroke-width="1.5"/><line x1="28" y1="20" x2="28" y2="36" stroke="#6c7086" stroke-width="1.5"/></svg>',
    'folder': '<svg viewBox="0 0 24 24"><path d="M2 6a2 2 0 012-2h5l2 2h7a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" fill="#89b4fa"/></svg>',
    'text-file': '<svg viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" fill="#45475a"/><line x1="8" y1="8" x2="16" y2="8" stroke="#6c7086" stroke-width="1"/><line x1="8" y1="11" x2="16" y2="11" stroke="#6c7086" stroke-width="1"/><line x1="8" y1="14" x2="13" y2="14" stroke="#6c7086" stroke-width="1"/></svg>',
    'image-file': '<svg viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" fill="#45475a"/><circle cx="10" cy="9" r="2" fill="#f9e2af"/><path d="M4 18l5-5 3 3 3-5 5 7H4z" fill="#a6e3a1" opacity="0.6"/></svg>',
    'paint': '<svg viewBox="0 0 48 48"><rect x="6" y="6" width="36" height="36" rx="4" fill="#313244"/><path d="M14 34V20l6-6h8l6 6v14" fill="none" stroke="#89b4fa" stroke-width="2"/><circle cx="18" cy="28" r="3" fill="#ff6b6b"/><circle cx="26" cy="24" r="3" fill="#51cf66"/><circle cx="32" cy="30" r="3" fill="#ffd43b"/><path d="M14 36h20" stroke="#6c7086" stroke-width="2" stroke-linecap="round"/></svg>',
    'task-manager': '<svg viewBox="0 0 48 48"><rect x="6" y="6" width="36" height="36" rx="4" fill="#313244"/><rect x="10" y="12" width="28" height="3" rx="1" fill="#6c7086"/><rect x="10" y="18" width="20" height="3" rx="1" fill="#89b4fa"/><rect x="10" y="24" width="24" height="3" rx="1" fill="#a6e3a1"/><rect x="10" y="30" width="14" height="3" rx="1" fill="#f9e2af"/><rect x="10" y="36" width="18" height="3" rx="1" fill="#f38ba8"/></svg>',
    'app-store': '<svg viewBox="0 0 48 48"><rect x="6" y="6" width="36" height="36" rx="8" fill="#313244"/><path d="M24 14l3 6h7l-5.5 4 2 7L24 26l-6.5 5 2-7L14 20h7z" fill="#89b4fa"/></svg>'
  };

  function get(id) {
    return icons[id] || icons['text-file'];
  }

  function getSmall(id) {
    const svg = get(id);
    return svg.replace('<svg ', '<svg width="16" height="16" ');
  }

  return { get, getSmall };
})();

// Apps Registry & Orchestrator
const Apps = (() => {
  const appList = [
    { id: 'file-explorer', name: 'File Explorer' },
    { id: 'notepad', name: 'Notepad' },
    { id: 'calculator', name: 'Calculator' },
    { id: 'terminal', name: 'Terminal' },
    { id: 'paint', name: 'Paint' },
    { id: 'music-player', name: 'Music Player' },
    { id: 'browser', name: 'Browser' },
    { id: 'image-viewer', name: 'Image Viewer' },
    { id: 'task-manager', name: 'Task Manager' },
    { id: 'app-store', name: 'App Store' },
    { id: 'settings', name: 'Settings' }
  ];

  function open(appId, arg) {
    switch (appId) {
      case 'file-explorer': FileExplorerApp.open(arg); break;
      case 'notepad': NotepadApp.open(arg); break;
      case 'calculator': CalculatorApp.open(); break;
      case 'terminal': TerminalApp.open(); break;
      case 'settings': SettingsApp.open(); break;
      case 'browser': BrowserApp.open(); break;
      case 'music-player':
        if (typeof MusicPlayerAppV2 !== 'undefined') MusicPlayerAppV2.open();
        else MusicPlayerApp.open();
        break;
      case 'image-viewer': ImageViewerApp.open(arg); break;
      case 'paint': PaintApp.open(); break;
      case 'task-manager':
        if (typeof TaskManagerApp !== 'undefined') TaskManagerApp.open();
        else openTaskManager();
        break;
      case 'app-store':
        if (typeof AppStoreApp !== 'undefined') AppStoreApp.open();
        break;
      default:
        // Check store apps
        if (typeof StoreApps !== 'undefined' && StoreApps.getInstalled) {
          const installed = StoreApps.getInstalled();
          if (installed.find(a => a.id === appId)) {
            StoreApps.openApp(appId);
            return;
          }
        }
        console.warn('Unknown app:', appId);
    }
  }

  function getAppList() {
    // Include installed store apps
    const list = [...appList];
    if (typeof StoreApps !== 'undefined' && StoreApps.getInstalled) {
      StoreApps.getInstalled().forEach(app => {
        if (!list.find(a => a.id === app.id)) {
          list.push({ id: app.id, name: app.name });
        }
      });
    }
    return list;
  }

  // Legacy fallback task manager
  function openTaskManager() {
    const win = WindowManager.createWindow({
      title: 'Task Manager',
      icon: AppIcons.get('task-manager'),
      width: 400, height: 300, minWidth: 300, minHeight: 200, appId: 'task-manager'
    });
    const body = win.getBody();
    const windows = WindowManager.getWindows();
    body.innerHTML = `<div class="task-manager"><table><thead><tr><th>Application</th><th>Status</th><th></th></tr></thead><tbody>${windows.map(w => `<tr><td>${w.title}</td><td>${w.minimized ? 'Minimized' : 'Running'}</td><td><button class="end-task-btn" data-id="${w.id}">End Task</button></td></tr>`).join('')}</tbody></table></div>`;
    body.querySelectorAll('.end-task-btn').forEach(btn => {
      btn.addEventListener('click', () => { WindowManager.closeById(btn.dataset.id); });
    });
  }

  return { open, getAppList, openTaskManager };
})();

// ── Virtual Desktops ──
const VirtualDesktops = (() => {
  let desktops = [{ id: 1, name: 'Desktop 1', windowIds: [] }];
  let activeDesktopId = 1;
  let nextId = 2;
  const MAX_DESKTOPS = 4;

  function getActive() { return desktops.find(d => d.id === activeDesktopId); }
  function getAll() { return desktops; }
  function getActiveId() { return activeDesktopId; }

  function create() {
    if (desktops.length >= MAX_DESKTOPS) return null;
    const d = { id: nextId++, name: 'Desktop ' + (desktops.length + 1), windowIds: [] };
    desktops.push(d);
    return d;
  }

  function remove(id) {
    if (desktops.length <= 1 || id === activeDesktopId) return;
    const desk = desktops.find(d => d.id === id);
    if (!desk) return;
    // Move windows to desktop 1
    const d1 = desktops[0];
    desk.windowIds.forEach(wid => {
      if (!d1.windowIds.includes(wid)) d1.windowIds.push(wid);
    });
    desktops = desktops.filter(d => d.id !== id);
    // Show moved windows if on desktop 1
    if (activeDesktopId === d1.id) {
      desk.windowIds.forEach(wid => {
        const w = WindowManager.getWindows().find(x => x.id === wid);
        if (w && w.minimized === false) w.el.style.display = '';
      });
    }
  }

  function switchTo(id) {
    if (id === activeDesktopId) return;
    const oldDesk = getActive();
    const newDesk = desktops.find(d => d.id === id);
    if (!newDesk) return;

    // Hide old desktop windows
    if (oldDesk) {
      oldDesk.windowIds.forEach(wid => {
        const w = WindowManager.getWindows().find(x => x.id === wid);
        if (w) w.el.style.display = 'none';
      });
    }

    activeDesktopId = id;

    // Show new desktop windows
    newDesk.windowIds.forEach(wid => {
      const w = WindowManager.getWindows().find(x => x.id === wid);
      if (w && !w.minimized) w.el.style.display = '';
      else if (w && w.minimized) w.el.style.display = 'none';
    });

    // Update taskbar to only show current desktop windows
    if (typeof Taskbar !== 'undefined') Taskbar.refreshForDesktop();
  }

  function assignWindow(winId) {
    const desk = getActive();
    if (desk && !desk.windowIds.includes(winId)) {
      desk.windowIds.push(winId);
    }
  }

  function unassignWindow(winId) {
    desktops.forEach(d => {
      d.windowIds = d.windowIds.filter(id => id !== winId);
    });
  }

  function getDesktopForWindow(winId) {
    return desktops.find(d => d.windowIds.includes(winId));
  }

  function isWindowOnActiveDesktop(winId) {
    const desk = getActive();
    return desk ? desk.windowIds.includes(winId) : true;
  }

  // Overview
  function showOverview() {
    const overlay = document.getElementById('desktop-overview');
    overlay.classList.remove('hidden');
    overlay.innerHTML = '';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);z-index:9500;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;';

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:12px;align-items:center;';

    desktops.forEach(d => {
      const card = document.createElement('div');
      card.style.cssText = `width:180px;height:110px;background:rgba(30,30,46,0.9);border:2px solid ${d.id === activeDesktopId ? 'var(--accent)' : 'rgba(255,255,255,0.1)'};border-radius:8px;cursor:pointer;position:relative;display:flex;align-items:center;justify-content:center;transition:border-color 0.15s;`;
      card.innerHTML = `<span style="font-size:13px;color:var(--text);">${d.name}</span><span style="font-size:10px;color:var(--text-muted);position:absolute;bottom:6px;right:8px;">${d.windowIds.length} window${d.windowIds.length !== 1 ? 's' : ''}</span>`;

      if (desktops.length > 1 && d.id !== activeDesktopId) {
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = 'position:absolute;top:4px;right:4px;width:20px;height:20px;background:rgba(230,69,83,0.3);border:none;border-radius:50%;color:#e64553;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;';
        closeBtn.addEventListener('click', (e) => { e.stopPropagation(); remove(d.id); showOverview(); });
        card.appendChild(closeBtn);
      }

      card.addEventListener('click', () => { switchTo(d.id); hideOverview(); });
      row.appendChild(card);
    });

    // Add button
    if (desktops.length < MAX_DESKTOPS) {
      const addBtn = document.createElement('div');
      addBtn.style.cssText = 'width:60px;height:110px;background:rgba(255,255,255,0.04);border:2px dashed rgba(255,255,255,0.15);border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:28px;color:var(--text-muted);transition:background 0.15s;';
      addBtn.textContent = '+';
      addBtn.addEventListener('click', () => { create(); showOverview(); });
      addBtn.addEventListener('mouseenter', () => { addBtn.style.background = 'rgba(255,255,255,0.08)'; });
      addBtn.addEventListener('mouseleave', () => { addBtn.style.background = 'rgba(255,255,255,0.04)'; });
      row.appendChild(addBtn);
    }

    overlay.appendChild(row);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) hideOverview(); });
  }

  function hideOverview() {
    document.getElementById('desktop-overview').classList.add('hidden');
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl+Meta+Left/Right - switch desktops
    if (e.ctrlKey && e.metaKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      const idx = desktops.findIndex(d => d.id === activeDesktopId);
      if (e.key === 'ArrowLeft' && idx > 0) switchTo(desktops[idx - 1].id);
      if (e.key === 'ArrowRight' && idx < desktops.length - 1) switchTo(desktops[idx + 1].id);
    }
    // Ctrl+Meta+D - new desktop
    if (e.ctrlKey && e.metaKey && e.key === 'd') {
      e.preventDefault();
      create();
    }
    // Ctrl+Meta+F4 - close current desktop
    if (e.ctrlKey && e.metaKey && e.key === 'F4') {
      e.preventDefault();
      if (desktops.length > 1) {
        const next = desktops.find(d => d.id !== activeDesktopId);
        if (next) { remove(activeDesktopId); switchTo(next.id); }
      }
    }
    // Win+L - lock
    if (e.metaKey && e.key === 'l') {
      e.preventDefault();
      if (typeof Login !== 'undefined') Login.lock();
    }
  });

  return {
    getActive, getAll, getActiveId, create, remove, switchTo,
    assignWindow, unassignWindow, getDesktopForWindow, isWindowOnActiveDesktop,
    showOverview, hideOverview
  };
})();

// Apply saved accent color on load
(function() {
  const accent = localStorage.getItem('minios_accent');
  if (accent) document.documentElement.style.setProperty('--accent', accent);
})();

// Init - show login then boot
document.addEventListener('DOMContentLoaded', () => {
  Login.show(() => {
    Boot.run();
  });
});
