// File Explorer Application
const FileExplorerApp = {
  open(startPath) {
    let currentPath = startPath || '/';
    let viewMode = 'grid'; // grid or list
    let selectedItem = null;
    let navHistory = [currentPath];
    let navIndex = 0;

    const win = WindowManager.createWindow({
      title: 'Files - ' + (currentPath === '/' ? 'Root' : FileSystem.getFileName(currentPath)),
      icon: AppIcons.get('file-explorer'),
      width: 720,
      height: 480,
      minWidth: 450,
      minHeight: 300,
      appId: 'file-explorer'
    });

    const body = win.getBody();

    function render() {
      const items = FileSystem.listDir(currentPath);
      const pathParts = currentPath.split('/').filter(Boolean);

      body.innerHTML = `
        <div class="app-toolbar">
          <button class="nav-back" title="Back">&larr;</button>
          <button class="nav-forward" title="Forward">&rarr;</button>
          <button class="nav-up" title="Up">&uarr;</button>
          <div class="separator"></div>
          <button class="new-folder" title="New Folder">+ Folder</button>
          <div class="separator"></div>
          <button class="view-toggle" title="Toggle View">${viewMode === 'grid' ? '☰' : '⊞'}</button>
        </div>
        <div class="file-explorer">
          <div class="fe-sidebar">
            <div class="fe-sidebar-item${currentPath === '/Desktop' ? ' active' : ''}" data-path="/Desktop">
              ${AppIcons.getSmall('folder')} Desktop
            </div>
            <div class="fe-sidebar-item${currentPath === '/Documents' ? ' active' : ''}" data-path="/Documents">
              ${AppIcons.getSmall('folder')} Documents
            </div>
            <div class="fe-sidebar-item${currentPath === '/Pictures' ? ' active' : ''}" data-path="/Pictures">
              ${AppIcons.getSmall('folder')} Pictures
            </div>
            <div class="fe-sidebar-item${currentPath === '/Music' ? ' active' : ''}" data-path="/Music">
              ${AppIcons.getSmall('folder')} Music
            </div>
            <div class="fe-sidebar-item${currentPath === '/Recycle Bin' ? ' active' : ''}" data-path="/Recycle Bin">
              ${AppIcons.getSmall('recycle-bin')} Recycle Bin
            </div>
          </div>
          <div class="fe-main">
            <div class="fe-breadcrumb">
              <span data-path="/">/</span>
              ${pathParts.map((p, i) => {
                const path = '/' + pathParts.slice(0, i + 1).join('/');
                return `<span class="separator">›</span><span data-path="${path}">${p}</span>`;
              }).join('')}
            </div>
            <div class="fe-content ${viewMode}-view">
              ${items.length === 0 ? '<div style="padding:20px;color:var(--text-muted);font-size:13px;">This folder is empty</div>' : ''}
              ${items.map(item => `
                <div class="fe-item" data-path="${item.path}" data-type="${item.type}" data-name="${item.name}">
                  ${item.type === 'folder' ? AppIcons.getSmall('folder') : AppIcons.getSmall(getFileIcon(item.name))}
                  <span class="fe-item-name">${item.name}</span>
                  ${viewMode === 'list' ? `
                    <span class="fe-item-size">${item.type === 'folder' ? '' : formatSize(item.size)}</span>
                    <span class="fe-item-date">${formatDate(item.modified)}</span>
                  ` : ''}
                </div>
              `).join('')}
            </div>
            <div class="app-statusbar">
              <span>${items.length} item${items.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      `;

      setupEvents();
    }

    function setupEvents() {
      // Sidebar navigation
      body.querySelectorAll('.fe-sidebar-item').forEach(el => {
        el.addEventListener('click', () => navigateTo(el.dataset.path));
      });

      // Breadcrumb navigation
      body.querySelectorAll('.fe-breadcrumb span[data-path]').forEach(el => {
        el.addEventListener('click', () => navigateTo(el.dataset.path));
      });

      // Toolbar buttons
      body.querySelector('.nav-back').addEventListener('click', () => {
        if (navIndex > 0) { navIndex--; currentPath = navHistory[navIndex]; render(); updateTitle(); }
      });
      body.querySelector('.nav-forward').addEventListener('click', () => {
        if (navIndex < navHistory.length - 1) { navIndex++; currentPath = navHistory[navIndex]; render(); updateTitle(); }
      });
      body.querySelector('.nav-up').addEventListener('click', () => {
        if (currentPath !== '/') navigateTo(FileSystem.getParentPath(currentPath));
      });
      body.querySelector('.new-folder').addEventListener('click', () => {
        const name = prompt('Folder name:', 'New Folder');
        if (name) { FileSystem.createFolder(currentPath + '/' + name); render(); }
      });
      body.querySelector('.view-toggle').addEventListener('click', () => {
        viewMode = viewMode === 'grid' ? 'list' : 'grid';
        render();
      });

      // File items
      body.querySelectorAll('.fe-item').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          body.querySelectorAll('.fe-item').forEach(i => i.classList.remove('selected'));
          el.classList.add('selected');
          selectedItem = el.dataset.path;
        });

        el.addEventListener('dblclick', () => {
          if (el.dataset.type === 'folder') {
            navigateTo(el.dataset.path);
          } else {
            openFile(el.dataset.path);
          }
        });

        el.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const path = el.dataset.path;
          const isFolder = el.dataset.type === 'folder';
          ContextMenu.show(e.clientX, e.clientY, [
            { label: 'Open', action: () => isFolder ? navigateTo(path) : openFile(path) },
            { separator: true },
            { label: 'Rename', action: () => {
              const newName = prompt('New name:', el.dataset.name);
              if (newName) { FileSystem.rename(path, newName); render(); }
            }},
            { label: 'Delete', action: () => { FileSystem.deleteFile(path); render(); } },
            { separator: true },
            { label: 'Copy', action: () => { localStorage.setItem('minios_clipboard', JSON.stringify({ op: 'copy', path })); } },
            { label: 'Cut', action: () => { localStorage.setItem('minios_clipboard', JSON.stringify({ op: 'cut', path })); } }
          ]);
        });
      });

      // Right-click empty space
      const content = body.querySelector('.fe-content');
      content.addEventListener('contextmenu', (e) => {
        if (e.target.closest('.fe-item')) return;
        e.preventDefault();
        ContextMenu.show(e.clientX, e.clientY, [
          { label: 'New Text File', action: () => {
            const name = prompt('File name:', 'untitled.txt');
            if (name) { FileSystem.writeFile(currentPath + '/' + name, ''); render(); }
          }},
          { label: 'New Folder', action: () => {
            const name = prompt('Folder name:', 'New Folder');
            if (name) { FileSystem.createFolder(currentPath + '/' + name); render(); }
          }},
          { separator: true },
          { label: 'Paste', action: () => {
            try {
              const clip = JSON.parse(localStorage.getItem('minios_clipboard'));
              if (clip) {
                if (clip.op === 'copy') FileSystem.copy(clip.path, currentPath);
                else if (clip.op === 'cut') { FileSystem.move(clip.path, currentPath); localStorage.removeItem('minios_clipboard'); }
                render();
              }
            } catch {}
          }},
          { separator: true },
          { label: viewMode === 'grid' ? 'List View' : 'Grid View', action: () => { viewMode = viewMode === 'grid' ? 'list' : 'grid'; render(); } }
        ]);
      });

      // Click empty to deselect
      content.addEventListener('click', (e) => {
        if (!e.target.closest('.fe-item')) {
          body.querySelectorAll('.fe-item').forEach(i => i.classList.remove('selected'));
          selectedItem = null;
        }
      });
    }

    function navigateTo(path) {
      currentPath = path;
      navHistory = navHistory.slice(0, navIndex + 1);
      navHistory.push(path);
      navIndex = navHistory.length - 1;
      render();
      updateTitle();
    }

    function updateTitle() {
      const name = currentPath === '/' ? 'Root' : FileSystem.getFileName(currentPath);
      win.setTitle('Files - ' + name);
    }

    function openFile(path) {
      const ext = FileSystem.getFileExtension(path);
      if (['txt', 'md', 'js', 'css', 'html', 'json'].includes(ext)) {
        Apps.open('notepad', path);
      } else if (['svg', 'png', 'jpg'].includes(ext)) {
        Apps.open('image-viewer', path);
      } else {
        Apps.open('notepad', path);
      }
    }

    function getFileIcon(name) {
      const ext = name.split('.').pop().toLowerCase();
      if (['svg', 'png', 'jpg', 'jpeg', 'gif'].includes(ext)) return 'image-file';
      return 'text-file';
    }

    function formatSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      return (bytes / 1024).toFixed(1) + ' KB';
    }

    function formatDate(ts) {
      if (!ts) return '';
      const d = new Date(ts);
      return d.toLocaleDateString();
    }

    render();
  }
};
