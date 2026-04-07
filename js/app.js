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
    'image-file': '<svg viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" fill="#45475a"/><circle cx="10" cy="9" r="2" fill="#f9e2af"/><path d="M4 18l5-5 3 3 3-5 5 7H4z" fill="#a6e3a1" opacity="0.6"/></svg>'
  };

  function get(id) {
    return icons[id] || icons['text-file'];
  }

  function getSmall(id) {
    const svg = get(id);
    // Return small version with inline width/height
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
    { id: 'settings', name: 'Settings' },
    { id: 'browser', name: 'Browser' },
    { id: 'music-player', name: 'Music Player' },
    { id: 'image-viewer', name: 'Image Viewer' }
  ];

  function open(appId, arg) {
    switch (appId) {
      case 'file-explorer': FileExplorerApp.open(arg); break;
      case 'notepad': NotepadApp.open(arg); break;
      case 'calculator': CalculatorApp.open(); break;
      case 'terminal': TerminalApp.open(); break;
      case 'settings': SettingsApp.open(); break;
      case 'browser': BrowserApp.open(); break;
      case 'music-player': MusicPlayerApp.open(); break;
      case 'image-viewer': ImageViewerApp.open(arg); break;
      default: console.warn('Unknown app:', appId);
    }
  }

  function getAppList() {
    return appList;
  }

  function openTaskManager() {
    const win = WindowManager.createWindow({
      title: 'Task Manager',
      icon: AppIcons.get('settings'),
      width: 400,
      height: 300,
      minWidth: 300,
      minHeight: 200,
      appId: 'task-manager'
    });

    function render() {
      const windows = WindowManager.getWindows();
      const body = win.getBody();
      body.innerHTML = `
        <div class="task-manager">
          <table>
            <thead><tr><th>Application</th><th>Status</th><th></th></tr></thead>
            <tbody>
              ${windows.map(w => `
                <tr>
                  <td>${w.title}</td>
                  <td>${w.minimized ? 'Minimized' : 'Running'}</td>
                  <td><button class="end-task-btn" data-id="${w.id}">End Task</button></td>
                </tr>
              `).join('')}
              ${windows.length === 0 ? '<tr><td colspan="3" style="text-align:center;color:var(--text-muted);">No running applications</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      `;

      body.querySelectorAll('.end-task-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          WindowManager.closeById(btn.dataset.id);
          setTimeout(render, 200);
        });
      });
    }

    render();
  }

  return { open, getAppList, openTaskManager };
})();

// Apply saved accent color on load
(function() {
  const accent = localStorage.getItem('minios_accent');
  if (accent) document.documentElement.style.setProperty('--accent', accent);
})();

// Init - start boot sequence
document.addEventListener('DOMContentLoaded', () => {
  Boot.run();
});
