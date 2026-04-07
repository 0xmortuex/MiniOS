// Desktop - icons, wallpaper, selection rectangle
const Desktop = (() => {
  const defaultIcons = [
    { id: 'file-explorer', name: 'Files', appId: 'file-explorer', col: 0, row: 0 },
    { id: 'terminal', name: 'Terminal', appId: 'terminal', col: 0, row: 1 },
    { id: 'notepad', name: 'Notepad', appId: 'notepad', col: 0, row: 2 },
    { id: 'calculator', name: 'Calculator', appId: 'calculator', col: 0, row: 3 },
    { id: 'paint', name: 'Paint', appId: 'paint', col: 0, row: 4 },
    { id: 'music-player', name: 'Music', appId: 'music-player', col: 0, row: 5 },
    { id: 'settings', name: 'Settings', appId: 'settings', col: 1, row: 0 },
    { id: 'recycle-bin', name: 'Recycle Bin', appId: 'recycle-bin', col: 1, row: 1 }
  ];

  let icons = [];
  let selectedIcons = [];
  let selectionStart = null;

  const GRID_W = 90;
  const GRID_H = 100;
  const PADDING = 16;

  function init() {
    const saved = loadIconPositions();
    // If saved icons exist but are missing new default icons, reset
    if (saved && saved.length < defaultIcons.length) {
      icons = defaultIcons.map(ic => ({ ...ic }));
      saveIconPositions();
    } else {
      icons = saved || defaultIcons.map(ic => ({ ...ic }));
    }
    render();
    setupSelection();
    applyWallpaper();
  }

  function loadIconPositions() {
    try {
      const data = localStorage.getItem('minios_desktop_icons');
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  }

  function saveIconPositions() {
    localStorage.setItem('minios_desktop_icons', JSON.stringify(icons));
  }

  function render() {
    const container = document.getElementById('desktop-icons');
    container.innerHTML = '';

    icons.forEach(ic => {
      const el = document.createElement('div');
      el.className = 'desktop-icon';
      el.dataset.appId = ic.appId;
      el.dataset.iconId = ic.id;
      el.style.left = (PADDING + ic.col * GRID_W) + 'px';
      el.style.top = (PADDING + ic.row * GRID_H) + 'px';
      el.innerHTML = `${AppIcons.get(ic.appId)}<span class="icon-label">${ic.name}</span>`;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        clearSelection();
        el.classList.add('selected');
        selectedIcons = [ic.id];
      });

      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        if (ic.appId === 'recycle-bin') {
          Apps.open('file-explorer', '/Recycle Bin');
        } else {
          Apps.open(ic.appId);
        }
      });

      // Drag icon
      let dragStartX, dragStartY, iconStartLeft, iconStartTop, dragging = false;
      el.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        iconStartLeft = parseInt(el.style.left);
        iconStartTop = parseInt(el.style.top);
        dragging = false;

        const onMove = (me) => {
          const dx = me.clientX - dragStartX;
          const dy = me.clientY - dragStartY;
          if (!dragging && Math.abs(dx) + Math.abs(dy) < 5) return;
          dragging = true;
          el.style.left = (iconStartLeft + dx) + 'px';
          el.style.top = (iconStartTop + dy) + 'px';
        };
        const onUp = () => {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          if (dragging) {
            // Snap to grid
            const rawCol = Math.round((parseInt(el.style.left) - PADDING) / GRID_W);
            const rawRow = Math.round((parseInt(el.style.top) - PADDING) / GRID_H);
            ic.col = Math.max(0, rawCol);
            ic.row = Math.max(0, rawRow);
            el.style.left = (PADDING + ic.col * GRID_W) + 'px';
            el.style.top = (PADDING + ic.row * GRID_H) + 'px';
            saveIconPositions();
          }
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });

      container.appendChild(el);
    });
  }

  function clearSelection() {
    document.querySelectorAll('.desktop-icon.selected').forEach(el => el.classList.remove('selected'));
    selectedIcons = [];
  }

  function setupSelection() {
    const desktop = document.getElementById('desktop-icons');
    const selRect = document.getElementById('selection-rect');

    desktop.addEventListener('mousedown', (e) => {
      if (e.target.closest('.desktop-icon') || e.button !== 0) return;
      clearSelection();
      selectionStart = { x: e.clientX, y: e.clientY };
      selRect.style.left = e.clientX + 'px';
      selRect.style.top = e.clientY + 'px';
      selRect.style.width = '0px';
      selRect.style.height = '0px';

      const onMove = (me) => {
        const x = Math.min(selectionStart.x, me.clientX);
        const y = Math.min(selectionStart.y, me.clientY);
        const w = Math.abs(me.clientX - selectionStart.x);
        const h = Math.abs(me.clientY - selectionStart.y);
        selRect.style.left = x + 'px';
        selRect.style.top = y + 'px';
        selRect.style.width = w + 'px';
        selRect.style.height = h + 'px';
        selRect.classList.remove('hidden');

        // Check which icons are inside
        const rect = { x, y, w, h };
        document.querySelectorAll('.desktop-icon').forEach(ic => {
          const icRect = ic.getBoundingClientRect();
          const overlap = !(icRect.right < rect.x || icRect.left > rect.x + rect.w ||
                           icRect.bottom < rect.y || icRect.top > rect.y + rect.h);
          ic.classList.toggle('selected', overlap);
        });
      };
      const onUp = () => {
        selRect.classList.add('hidden');
        selectionStart = null;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    // Click empty desktop to clear selection
    desktop.addEventListener('click', (e) => {
      if (!e.target.closest('.desktop-icon')) {
        clearSelection();
      }
    });
  }

  function applyWallpaper() {
    const wallpapers = [
      'linear-gradient(135deg, #0c0c1d 0%, #1a1040 40%, #0d1933 70%, #0a0a15 100%)',
      'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)',
      'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 40%, #1a0a2e 100%)',
      'linear-gradient(135deg, #0a1628 0%, #0f3460 40%, #16213e 70%, #0a1628 100%)'
    ];
    const idx = parseInt(localStorage.getItem('minios_wallpaper') || '0');
    document.getElementById('desktop-wallpaper').style.background = wallpapers[idx] || wallpapers[0];
    document.documentElement.style.setProperty('--wallpaper', wallpapers[idx] || wallpapers[0]);
  }

  function getWallpapers() {
    return [
      'linear-gradient(135deg, #0c0c1d 0%, #1a1040 40%, #0d1933 70%, #0a0a15 100%)',
      'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)',
      'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 40%, #1a0a2e 100%)',
      'linear-gradient(135deg, #0a1628 0%, #0f3460 40%, #16213e 70%, #0a1628 100%)'
    ];
  }

  function setWallpaper(idx) {
    localStorage.setItem('minios_wallpaper', idx);
    applyWallpaper();
  }

  function refresh() {
    render();
  }

  return { init, refresh, applyWallpaper, setWallpaper, getWallpapers, clearSelection };
})();
