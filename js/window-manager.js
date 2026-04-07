// Window Manager - handles window creation, dragging, resizing, z-order, snap, Alt+Tab
const WindowManager = (() => {
  let windows = [];
  let zIndexCounter = 100;
  let activeWindowId = null;
  let altTabActive = false;
  let altTabIndex = 0;
  let dragState = null;
  let resizeState = null;
  let idCounter = 0;

  const container = () => document.getElementById('windows-container');
  const snapPreview = () => document.getElementById('snap-preview');

  function createWindow({ title, icon, width = 600, height = 400, minWidth = 300, minHeight = 200, content, appId, onClose, resizable = true }) {
    const id = 'win-' + (++idCounter);
    const el = document.createElement('div');
    el.className = 'mini-window opening focused';
    el.id = id;
    el.style.width = width + 'px';
    el.style.height = height + 'px';

    // Center with slight random offset
    const maxX = window.innerWidth - width;
    const maxY = window.innerHeight - 48 - height;
    const cx = Math.max(0, maxX / 2 + (Math.random() - 0.5) * 100);
    const cy = Math.max(0, maxY / 2 + (Math.random() - 0.5) * 60);
    el.style.left = cx + 'px';
    el.style.top = cy + 'px';

    el.innerHTML = `
      <div class="window-titlebar">
        <div class="window-titlebar-icon">${icon || ''}</div>
        <div class="window-title">${title}</div>
        <div class="window-controls">
          <button class="window-btn minimize" title="Minimize">─</button>
          <button class="window-btn maximize" title="Maximize">□</button>
          <button class="window-btn close" title="Close">✕</button>
        </div>
      </div>
      <div class="window-body"></div>
      ${resizable ? `
      <div class="resize-handle resize-n"></div>
      <div class="resize-handle resize-s"></div>
      <div class="resize-handle resize-e"></div>
      <div class="resize-handle resize-w"></div>
      <div class="resize-handle resize-nw"></div>
      <div class="resize-handle resize-ne"></div>
      <div class="resize-handle resize-sw"></div>
      <div class="resize-handle resize-se"></div>
      ` : ''}
    `;

    const body = el.querySelector('.window-body');
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      body.appendChild(content);
    }

    container().appendChild(el);

    const win = {
      id,
      el,
      appId,
      title,
      icon,
      width, height,
      minWidth, minHeight,
      resizable,
      maximized: false,
      minimized: false,
      prevBounds: null,
      onClose,
      _unsaved: false,
      body
    };

    windows.push(win);
    focusWindow(id);

    // Remove opening animation class
    setTimeout(() => el.classList.remove('opening'), 150);

    // Title bar events
    const titlebar = el.querySelector('.window-titlebar');
    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.window-controls')) return;
      startDrag(e, win);
    });
    titlebar.addEventListener('dblclick', (e) => {
      if (e.target.closest('.window-controls')) return;
      toggleMaximize(win);
    });

    // Window controls
    el.querySelector('.window-btn.minimize').addEventListener('click', () => minimizeWindow(win));
    el.querySelector('.window-btn.maximize').addEventListener('click', () => toggleMaximize(win));
    el.querySelector('.window-btn.close').addEventListener('click', () => closeWindow(win));

    // Focus on click
    el.addEventListener('mousedown', () => focusWindow(id));

    // Resize handles
    if (resizable) {
      el.querySelectorAll('.resize-handle').forEach(handle => {
        handle.addEventListener('mousedown', (e) => startResize(e, win, handle));
      });
    }

    // Notify taskbar
    if (typeof Taskbar !== 'undefined') Taskbar.addWindow(win);

    return {
      id,
      el,
      body,
      minimize: () => minimizeWindow(win),
      maximize: () => toggleMaximize(win),
      close: () => closeWindow(win),
      focus: () => focusWindow(id),
      setTitle: (t) => {
        win.title = t;
        el.querySelector('.window-title').textContent = t;
        if (typeof Taskbar !== 'undefined') Taskbar.updateWindow(win);
      },
      setUnsaved: (v) => { win._unsaved = v; },
      getBody: () => body
    };
  }

  function focusWindow(id) {
    const win = windows.find(w => w.id === id);
    if (!win || win.minimized) return;

    activeWindowId = id;
    zIndexCounter++;
    win.el.style.zIndex = zIndexCounter;

    windows.forEach(w => {
      w.el.classList.toggle('focused', w.id === id);
    });

    if (typeof Taskbar !== 'undefined') Taskbar.setActive(id);
  }

  function minimizeWindow(win) {
    win.minimized = true;
    win.el.classList.add('minimizing');
    setTimeout(() => {
      win.el.style.display = 'none';
      win.el.classList.remove('minimizing');
    }, 200);

    // Focus next window
    const visibleWindows = windows.filter(w => !w.minimized && w.id !== win.id);
    if (visibleWindows.length > 0) {
      // Focus the one with highest z-index
      const top = visibleWindows.reduce((a, b) =>
        parseInt(a.el.style.zIndex || 0) > parseInt(b.el.style.zIndex || 0) ? a : b
      );
      focusWindow(top.id);
    } else {
      activeWindowId = null;
      if (typeof Taskbar !== 'undefined') Taskbar.setActive(null);
    }
    if (typeof Taskbar !== 'undefined') Taskbar.updateWindow(win);
  }

  function restoreWindow(win) {
    win.minimized = false;
    win.el.style.display = '';
    win.el.classList.add('opening');
    setTimeout(() => win.el.classList.remove('opening'), 150);
    focusWindow(win.id);
    if (typeof Taskbar !== 'undefined') Taskbar.updateWindow(win);
  }

  function toggleMaximize(win) {
    if (!win.resizable) return;
    if (win.maximized) {
      // Restore
      win.maximized = false;
      win.el.classList.remove('maximized');
      win.el.classList.add('snapping');
      if (win.prevBounds) {
        win.el.style.left = win.prevBounds.left + 'px';
        win.el.style.top = win.prevBounds.top + 'px';
        win.el.style.width = win.prevBounds.width + 'px';
        win.el.style.height = win.prevBounds.height + 'px';
      }
      setTimeout(() => win.el.classList.remove('snapping'), 200);
    } else {
      // Maximize
      win.prevBounds = {
        left: parseInt(win.el.style.left),
        top: parseInt(win.el.style.top),
        width: win.el.offsetWidth,
        height: win.el.offsetHeight
      };
      win.maximized = true;
      win.el.classList.add('maximized', 'snapping');
      win.el.style.left = '0px';
      win.el.style.top = '0px';
      win.el.style.width = '100%';
      win.el.style.height = (window.innerHeight - 48) + 'px';
      setTimeout(() => win.el.classList.remove('snapping'), 200);
    }
  }

  function closeWindow(win) {
    if (win._unsaved && win.onClose) {
      // Show save dialog
      showDialog(win, 'Save changes?', 'Do you want to save changes before closing?', [
        { label: 'Save', primary: true, action: () => { if (win.onClose) win.onClose('save'); removeWindow(win); } },
        { label: "Don't Save", action: () => { removeWindow(win); } },
        { label: 'Cancel', action: () => {} }
      ]);
      return;
    }
    if (win.onClose) win.onClose('close');
    removeWindow(win);
  }

  function removeWindow(win) {
    win.el.classList.add('closing');
    setTimeout(() => {
      win.el.remove();
      windows = windows.filter(w => w.id !== win.id);
      if (activeWindowId === win.id) {
        const vis = windows.filter(w => !w.minimized);
        if (vis.length > 0) {
          const top = vis.reduce((a, b) =>
            parseInt(a.el.style.zIndex || 0) > parseInt(b.el.style.zIndex || 0) ? a : b
          );
          focusWindow(top.id);
        } else {
          activeWindowId = null;
          if (typeof Taskbar !== 'undefined') Taskbar.setActive(null);
        }
      }
      if (typeof Taskbar !== 'undefined') Taskbar.removeWindow(win.id);
    }, 150);
  }

  function showDialog(win, title, message, buttons) {
    const overlay = document.createElement('div');
    overlay.className = 'mini-dialog-overlay';
    overlay.innerHTML = `
      <div class="mini-dialog">
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="mini-dialog-buttons"></div>
      </div>
    `;
    const btnContainer = overlay.querySelector('.mini-dialog-buttons');
    buttons.forEach(btn => {
      const b = document.createElement('button');
      b.textContent = btn.label;
      if (btn.primary) b.className = 'primary';
      b.addEventListener('click', () => {
        overlay.remove();
        btn.action();
      });
      btnContainer.appendChild(b);
    });
    win.body.appendChild(overlay);
  }

  // Dragging
  function startDrag(e, win) {
    if (win.maximized) return;
    e.preventDefault();
    dragState = {
      win,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: parseInt(win.el.style.left),
      startTop: parseInt(win.el.style.top)
    };
    win.el.classList.add('dragging');
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
  }

  function onDrag(e) {
    if (!dragState) return;
    const { win, startX, startY, startLeft, startTop } = dragState;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const newLeft = startLeft + dx;
    const newTop = Math.max(0, startTop + dy);

    win.el.style.left = newLeft + 'px';
    win.el.style.top = newTop + 'px';

    // Snap zones
    const sp = snapPreview();
    const maxY = window.innerHeight - 48;
    if (e.clientY <= 5) {
      // Snap to maximize
      sp.style.left = '4px';
      sp.style.top = '4px';
      sp.style.width = (window.innerWidth - 8) + 'px';
      sp.style.height = (maxY - 8) + 'px';
      sp.classList.remove('hidden');
      dragState.snapZone = 'max';
    } else if (e.clientX <= 5) {
      // Snap left
      sp.style.left = '4px';
      sp.style.top = '4px';
      sp.style.width = (window.innerWidth / 2 - 8) + 'px';
      sp.style.height = (maxY - 8) + 'px';
      sp.classList.remove('hidden');
      dragState.snapZone = 'left';
    } else if (e.clientX >= window.innerWidth - 5) {
      // Snap right
      sp.style.left = (window.innerWidth / 2 + 4) + 'px';
      sp.style.top = '4px';
      sp.style.width = (window.innerWidth / 2 - 8) + 'px';
      sp.style.height = (maxY - 8) + 'px';
      sp.classList.remove('hidden');
      dragState.snapZone = 'right';
    } else {
      sp.classList.add('hidden');
      dragState.snapZone = null;
    }
  }

  function stopDrag() {
    if (!dragState) return;
    const { win, snapZone } = dragState;
    const maxY = window.innerHeight - 48;

    win.el.classList.remove('dragging');

    if (snapZone) {
      win.prevBounds = {
        left: parseInt(win.el.style.left),
        top: parseInt(win.el.style.top),
        width: win.el.offsetWidth,
        height: win.el.offsetHeight
      };
      win.el.classList.add('snapping');
      if (snapZone === 'max') {
        win.maximized = true;
        win.el.classList.add('maximized');
        win.el.style.left = '0px';
        win.el.style.top = '0px';
        win.el.style.width = '100%';
        win.el.style.height = maxY + 'px';
      } else if (snapZone === 'left') {
        win.el.style.left = '0px';
        win.el.style.top = '0px';
        win.el.style.width = (window.innerWidth / 2) + 'px';
        win.el.style.height = maxY + 'px';
      } else if (snapZone === 'right') {
        win.el.style.left = (window.innerWidth / 2) + 'px';
        win.el.style.top = '0px';
        win.el.style.width = (window.innerWidth / 2) + 'px';
        win.el.style.height = maxY + 'px';
      }
      setTimeout(() => win.el.classList.remove('snapping'), 200);
      snapPreview().classList.add('hidden');
    }

    dragState = null;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
  }

  // Resizing
  function startResize(e, win, handle) {
    if (win.maximized) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = win.el.getBoundingClientRect();
    const direction = handle.className.replace('resize-handle resize-', '');

    resizeState = {
      win,
      direction,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: rect.left,
      startTop: rect.top,
      startWidth: rect.width,
      startHeight: rect.height
    };

    win.el.classList.add('resizing');
    document.addEventListener('mousemove', onResize);
    document.addEventListener('mouseup', stopResize);
  }

  function onResize(e) {
    if (!resizeState) return;
    const { win, direction, startX, startY, startLeft, startTop, startWidth, startHeight } = resizeState;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newLeft = startLeft;
    let newTop = startTop;
    let newWidth = startWidth;
    let newHeight = startHeight;

    if (direction.includes('e')) newWidth = Math.max(win.minWidth, startWidth + dx);
    if (direction.includes('w')) {
      newWidth = Math.max(win.minWidth, startWidth - dx);
      newLeft = startLeft + startWidth - newWidth;
    }
    if (direction.includes('s')) newHeight = Math.max(win.minHeight, startHeight + dy);
    if (direction.includes('n')) {
      newHeight = Math.max(win.minHeight, startHeight - dy);
      newTop = startTop + startHeight - newHeight;
    }

    win.el.style.left = newLeft + 'px';
    win.el.style.top = Math.max(0, newTop) + 'px';
    win.el.style.width = newWidth + 'px';
    win.el.style.height = newHeight + 'px';
  }

  function stopResize() {
    if (!resizeState) return;
    resizeState.win.el.classList.remove('resizing');
    resizeState = null;
    document.removeEventListener('mousemove', onResize);
    document.removeEventListener('mouseup', stopResize);
  }

  // Alt+Tab
  function showAltTab() {
    const overlay = document.getElementById('alt-tab-overlay');
    const nonMinWindows = windows.filter(w => !w.minimized);
    if (nonMinWindows.length === 0) return;

    altTabActive = true;
    altTabIndex = 0;

    overlay.innerHTML = '';
    nonMinWindows.forEach((w, i) => {
      const item = document.createElement('div');
      item.className = 'alt-tab-item' + (i === 0 ? ' active' : '');
      item.innerHTML = `${w.icon || ''}<span>${w.title}</span>`;
      item.dataset.winId = w.id;
      overlay.appendChild(item);
    });
    overlay.classList.remove('hidden');
  }

  function cycleAltTab() {
    const items = document.querySelectorAll('.alt-tab-item');
    if (items.length === 0) return;
    items[altTabIndex].classList.remove('active');
    altTabIndex = (altTabIndex + 1) % items.length;
    items[altTabIndex].classList.add('active');
  }

  function commitAltTab() {
    const items = document.querySelectorAll('.alt-tab-item');
    if (items.length > 0 && items[altTabIndex]) {
      const winId = items[altTabIndex].dataset.winId;
      const win = windows.find(w => w.id === winId);
      if (win) {
        if (win.minimized) restoreWindow(win);
        else focusWindow(win.id);
      }
    }
    document.getElementById('alt-tab-overlay').classList.add('hidden');
    altTabActive = false;
  }

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'Tab') {
      e.preventDefault();
      if (!altTabActive) showAltTab();
      else cycleAltTab();
    }
    if (e.altKey && e.key === 'F4') {
      e.preventDefault();
      const win = windows.find(w => w.id === activeWindowId);
      if (win) closeWindow(win);
    }
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      // Show desktop - minimize all
      const anyVisible = windows.some(w => !w.minimized);
      if (anyVisible) {
        windows.forEach(w => { if (!w.minimized) minimizeWindow(w); });
      } else {
        windows.forEach(w => { if (w.minimized) restoreWindow(w); });
      }
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'Escape') {
      e.preventDefault();
      if (typeof Apps !== 'undefined') Apps.open('task-manager');
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'Alt' && altTabActive) {
      commitAltTab();
    }
  });

  function getWindows() { return windows; }
  function getActiveId() { return activeWindowId; }

  function toggleByTaskbar(winId) {
    const win = windows.find(w => w.id === winId);
    if (!win) return;
    if (win.minimized) {
      restoreWindow(win);
    } else if (win.id === activeWindowId) {
      minimizeWindow(win);
    } else {
      focusWindow(win.id);
    }
  }

  function closeById(id) {
    const win = windows.find(w => w.id === id);
    if (win) closeWindow(win);
  }

  return {
    createWindow, focusWindow, minimizeWindow, restoreWindow,
    toggleMaximize, closeWindow, showDialog,
    getWindows, getActiveId, toggleByTaskbar, closeById
  };
})();
