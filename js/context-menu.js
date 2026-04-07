// Context Menu System
const ContextMenu = (() => {
  let currentMenu = null;

  function show(x, y, items) {
    close();
    const menu = document.createElement('div');
    menu.className = 'context-menu';

    items.forEach(item => {
      if (item.separator) {
        const sep = document.createElement('div');
        sep.className = 'context-menu-separator';
        menu.appendChild(sep);
        return;
      }

      const el = document.createElement('div');
      el.className = 'context-menu-item' + (item.disabled ? ' disabled' : '') + (item.submenu ? ' has-submenu' : '');

      let html = '';
      if (item.icon) html += item.icon;
      html += `<span>${item.label}</span>`;
      if (item.shortcut) html += `<span class="shortcut">${item.shortcut}</span>`;
      el.innerHTML = html;

      if (item.submenu) {
        const sub = document.createElement('div');
        sub.className = 'context-submenu';
        item.submenu.forEach(si => {
          const sel = document.createElement('div');
          sel.className = 'context-menu-item';
          sel.innerHTML = `<span>${si.label}</span>`;
          sel.addEventListener('click', (e) => { e.stopPropagation(); close(); si.action(); });
          sub.appendChild(sel);
        });
        el.appendChild(sub);
      } else if (item.action) {
        el.addEventListener('click', () => { close(); item.action(); });
      }

      menu.appendChild(el);
    });

    document.body.appendChild(menu);

    // Position: make sure it fits in viewport
    const rect = menu.getBoundingClientRect();
    if (x + rect.width > window.innerWidth) x = window.innerWidth - rect.width - 4;
    if (y + rect.height > window.innerHeight) y = window.innerHeight - rect.height - 4;
    menu.style.left = Math.max(0, x) + 'px';
    menu.style.top = Math.max(0, y) + 'px';

    currentMenu = menu;
  }

  function close() {
    if (currentMenu) {
      currentMenu.remove();
      currentMenu = null;
    }
  }

  // Close on click outside or Escape
  document.addEventListener('click', () => close());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  // Desktop right-click
  document.addEventListener('contextmenu', (e) => {
    // Only handle on desktop background
    const desktop = document.getElementById('desktop-icons');
    if (!desktop) return;

    // Check if right-click is on desktop area (not on windows, taskbar, etc.)
    if (e.target.closest('.mini-window') || e.target.closest('#taskbar') || e.target.closest('#start-menu')) return;

    if (e.target.closest('.desktop-icon')) {
      e.preventDefault();
      const iconEl = e.target.closest('.desktop-icon');
      const appId = iconEl.dataset.appId;
      show(e.clientX, e.clientY, [
        { label: 'Open', action: () => { appId === 'recycle-bin' ? Apps.open('file-explorer', '/Recycle Bin') : Apps.open(appId); } },
        { separator: true },
        { label: 'Rename', disabled: true },
        { label: 'Properties', disabled: true }
      ]);
      return;
    }

    if (e.target.closest('#desktop') || e.target.closest('#desktop-icons') || e.target.closest('#desktop-wallpaper')) {
      e.preventDefault();
      show(e.clientX, e.clientY, [
        {
          label: 'New', submenu: [
            { label: 'Text File', action: () => {
              const name = prompt('File name:', 'untitled.txt');
              if (name) { FileSystem.writeFile('/Desktop/' + name, ''); Desktop.refresh(); }
            }},
            { label: 'Folder', action: () => {
              const name = prompt('Folder name:', 'New Folder');
              if (name) { FileSystem.createFolder('/Desktop/' + name); Desktop.refresh(); }
            }}
          ]
        },
        { separator: true },
        { label: 'Change Wallpaper', action: () => Apps.open('settings') },
        { label: 'Display Settings', action: () => Apps.open('settings') },
        { separator: true },
        { label: 'Refresh Desktop', action: () => Desktop.refresh() },
        { label: 'Open Terminal Here', action: () => Apps.open('terminal') }
      ]);
    }
  });

  return { show, close };
})();
