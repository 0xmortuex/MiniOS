// Notepad Application
const NotepadApp = {
  open(filePath) {
    let currentPath = filePath || null;
    let originalContent = '';
    let content = '';

    if (filePath) {
      content = FileSystem.readFile(filePath) || '';
      originalContent = content;
    }

    const title = currentPath ? FileSystem.getFileName(currentPath) : 'Untitled';

    const win = WindowManager.createWindow({
      title: 'Notepad - ' + title,
      icon: AppIcons.get('notepad'),
      width: 650,
      height: 450,
      minWidth: 300,
      minHeight: 200,
      appId: 'notepad',
      onClose: (action) => {
        if (action === 'save') save();
      }
    });

    const body = win.getBody();
    body.innerHTML = `
      <div class="app-menubar">
        <div class="app-menubar-item" data-menu="file">File</div>
        <div class="app-menubar-item" data-menu="edit">Edit</div>
        <div class="app-menubar-item" data-menu="view">View</div>
      </div>
      <textarea class="notepad-textarea" spellcheck="false">${escapeHtml(content)}</textarea>
      <div class="app-statusbar">
        <span class="notepad-status-info">Ln 1, Col 1</span>
        <span class="notepad-char-count">${content.length} characters</span>
      </div>
    `;

    const textarea = body.querySelector('.notepad-textarea');
    const statusInfo = body.querySelector('.notepad-status-info');
    const charCount = body.querySelector('.notepad-char-count');

    textarea.addEventListener('input', () => {
      content = textarea.value;
      const dirty = content !== originalContent;
      win.setUnsaved(dirty);
      const t = currentPath ? FileSystem.getFileName(currentPath) : 'Untitled';
      win.setTitle('Notepad - ' + t + (dirty ? '*' : ''));
      charCount.textContent = content.length + ' characters';
    });

    textarea.addEventListener('keyup', updateCursorPos);
    textarea.addEventListener('click', updateCursorPos);

    function updateCursorPos() {
      const val = textarea.value.substring(0, textarea.selectionStart);
      const lines = val.split('\n');
      const ln = lines.length;
      const col = lines[lines.length - 1].length + 1;
      statusInfo.textContent = `Ln ${ln}, Col ${col}`;
    }

    function save() {
      if (!currentPath) {
        saveAs();
        return;
      }
      FileSystem.writeFile(currentPath, content);
      originalContent = content;
      win.setUnsaved(false);
      win.setTitle('Notepad - ' + FileSystem.getFileName(currentPath));
    }

    function saveAs() {
      const name = prompt('Save as:', currentPath ? FileSystem.getFileName(currentPath) : 'untitled.txt');
      if (!name) return;
      const dir = currentPath ? FileSystem.getParentPath(currentPath) : '/Documents';
      currentPath = dir + '/' + name;
      save();
    }

    function openFile() {
      showFilePicker(body, '/Documents', (path) => {
        currentPath = path;
        content = FileSystem.readFile(path) || '';
        originalContent = content;
        textarea.value = content;
        win.setUnsaved(false);
        win.setTitle('Notepad - ' + FileSystem.getFileName(path));
      });
    }

    function newFile() {
      currentPath = null;
      content = '';
      originalContent = '';
      textarea.value = '';
      win.setUnsaved(false);
      win.setTitle('Notepad - Untitled');
    }

    // Menu actions
    body.querySelectorAll('.app-menubar-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const menu = item.dataset.menu;
        const rect = item.getBoundingClientRect();
        const menuItems = {
          file: [
            { label: 'New', shortcut: 'Ctrl+N', action: newFile },
            { label: 'Open...', shortcut: 'Ctrl+O', action: openFile },
            { separator: true },
            { label: 'Save', shortcut: 'Ctrl+S', action: save },
            { label: 'Save As...', action: saveAs }
          ],
          edit: [
            { label: 'Undo', shortcut: 'Ctrl+Z', action: () => document.execCommand('undo') },
            { label: 'Redo', shortcut: 'Ctrl+Y', action: () => document.execCommand('redo') },
            { separator: true },
            { label: 'Cut', shortcut: 'Ctrl+X', action: () => document.execCommand('cut') },
            { label: 'Copy', shortcut: 'Ctrl+C', action: () => document.execCommand('copy') },
            { label: 'Paste', shortcut: 'Ctrl+V', action: () => { textarea.focus(); document.execCommand('paste'); } },
            { separator: true },
            { label: 'Select All', shortcut: 'Ctrl+A', action: () => textarea.select() }
          ],
          view: [
            { label: 'Word Wrap', action: () => { textarea.style.whiteSpace = textarea.style.whiteSpace === 'pre' ? 'pre-wrap' : 'pre'; } },
            { label: 'Increase Font', action: () => { const s = parseInt(getComputedStyle(textarea).fontSize); textarea.style.fontSize = (s + 1) + 'px'; } },
            { label: 'Decrease Font', action: () => { const s = parseInt(getComputedStyle(textarea).fontSize); textarea.style.fontSize = Math.max(8, s - 1) + 'px'; } }
          ]
        };
        ContextMenu.show(rect.left, rect.bottom, menuItems[menu] || []);
      });
    });

    // Keyboard shortcuts (within the window)
    body.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); save(); }
      if (e.ctrlKey && e.key === 'n') { e.preventDefault(); newFile(); }
      if (e.ctrlKey && e.key === 'o') { e.preventDefault(); openFile(); }
    });

    textarea.focus();
  }
};

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showFilePicker(parentEl, startDir, onSelect) {
  const items = FileSystem.listDir(startDir);
  const textFiles = items.filter(i => i.type === 'file');

  const overlay = document.createElement('div');
  overlay.className = 'mini-dialog-overlay';
  overlay.innerHTML = `
    <div class="mini-dialog" style="min-width:350px;">
      <h3>Open File</h3>
      <div class="file-picker">
        <div class="file-picker-list">
          ${textFiles.map(f => `<div class="file-picker-item" data-path="${f.path}">${AppIcons.getSmall('text-file')}<span>${f.name}</span></div>`).join('')}
          ${textFiles.length === 0 ? '<div style="padding:12px;color:var(--text-muted);font-size:13px;">No files found</div>' : ''}
        </div>
        <div class="mini-dialog-buttons">
          <button class="cancel-btn">Cancel</button>
          <button class="open-btn primary" disabled>Open</button>
        </div>
      </div>
    </div>
  `;

  let selected = null;
  overlay.querySelectorAll('.file-picker-item').forEach(item => {
    item.addEventListener('click', () => {
      overlay.querySelectorAll('.file-picker-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      selected = item.dataset.path;
      overlay.querySelector('.open-btn').disabled = false;
    });
    item.addEventListener('dblclick', () => {
      overlay.remove();
      onSelect(item.dataset.path);
    });
  });

  overlay.querySelector('.cancel-btn').addEventListener('click', () => overlay.remove());
  overlay.querySelector('.open-btn').addEventListener('click', () => {
    if (selected) { overlay.remove(); onSelect(selected); }
  });

  parentEl.appendChild(overlay);
}
