// Virtual File System - persisted to localStorage
const FileSystem = (() => {
  const STORAGE_KEY = 'minios_fs';
  let fs = {};

  function load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        fs = JSON.parse(data);
      } else {
        initDefault();
      }
    } catch (e) {
      console.warn('Failed to load filesystem, initializing default', e);
      initDefault();
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fs));
    } catch (e) {
      console.warn('Failed to save filesystem - localStorage may be full', e);
    }
  }

  function initDefault() {
    fs = {};
    // Create default folders
    createFolder('/Desktop');
    createFolder('/Documents');
    createFolder('/Documents/Projects');
    createFolder('/Pictures');
    createFolder('/Music');
    createFolder('/Recycle Bin');

    // Create default files
    writeFile('/Desktop/readme.txt', 'Welcome to MiniOS!\n\nThis is a fully functional desktop operating system simulation.\nBuilt with vanilla HTML, CSS, and JavaScript — zero dependencies.\n\nTry opening the Terminal, Calculator, or File Explorer!');
    writeFile('/Desktop/notes.txt', 'My Notes\n========\n\n- MiniOS supports drag & drop windows\n- Right-click for context menus\n- Use Alt+Tab to switch windows\n- Try the Terminal for a command-line experience\n- Music Player generates sounds with Web Audio API');
    writeFile('/Documents/hello.txt', 'Hello, World!\n\nThis file lives in your virtual Documents folder.\nYou can edit it with Notepad, view it in Terminal with `cat`, or manage it in File Explorer.');
    writeFile('/Pictures/abstract.svg', `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#89b4fa"/><stop offset="100%" stop-color="#cba6f7"/></linearGradient></defs>
  <rect width="200" height="200" fill="#181825"/>
  <circle cx="60" cy="80" r="40" fill="url(#g1)" opacity="0.7"/>
  <circle cx="140" cy="120" r="50" fill="#a6e3a1" opacity="0.5"/>
  <rect x="80" y="40" width="60" height="60" rx="10" fill="#f9e2af" opacity="0.6" transform="rotate(30 110 70)"/>
</svg>`);
    writeFile('/Pictures/landscape.svg', `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="#0c0c1d"/>
  <ellipse cx="100" cy="200" rx="120" ry="60" fill="#1a1040"/>
  <circle cx="150" cy="40" r="15" fill="#f9e2af" opacity="0.9"/>
  <polygon points="60,200 90,120 120,200" fill="#2a2a3c"/>
  <polygon points="100,200 140,100 180,200" fill="#1e1e2e"/>
  <circle cx="30" cy="30" r="2" fill="#fff" opacity="0.5"/>
  <circle cx="70" cy="50" r="1.5" fill="#fff" opacity="0.4"/>
  <circle cx="120" cy="25" r="1" fill="#fff" opacity="0.6"/>
  <circle cx="170" cy="60" r="1.5" fill="#fff" opacity="0.3"/>
</svg>`);
    save();
  }

  function normalizePath(path) {
    if (!path.startsWith('/')) path = '/' + path;
    // Remove trailing slash (except root)
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    // Resolve .. and .
    const parts = path.split('/').filter(Boolean);
    const resolved = [];
    for (const p of parts) {
      if (p === '..') resolved.pop();
      else if (p !== '.') resolved.push(p);
    }
    return '/' + resolved.join('/');
  }

  function getParentPath(path) {
    path = normalizePath(path);
    const idx = path.lastIndexOf('/');
    return idx === 0 ? '/' : path.substring(0, idx);
  }

  function getFileName(path) {
    path = normalizePath(path);
    return path.split('/').pop();
  }

  function exists(path) {
    path = normalizePath(path);
    return fs[path] !== undefined;
  }

  function isFolder(path) {
    path = normalizePath(path);
    return fs[path] && fs[path].type === 'folder';
  }

  function readFile(path) {
    path = normalizePath(path);
    if (!fs[path] || fs[path].type === 'folder') return null;
    return fs[path].content;
  }

  function writeFile(path, content) {
    path = normalizePath(path);
    const now = Date.now();
    fs[path] = {
      type: 'file',
      content: content || '',
      size: (content || '').length,
      modified: now,
      created: fs[path] ? fs[path].created : now
    };
    save();
  }

  function createFolder(path) {
    path = normalizePath(path);
    if (fs[path]) return;
    fs[path] = {
      type: 'folder',
      modified: Date.now(),
      created: Date.now()
    };
    save();
  }

  function deleteFile(path, permanent) {
    path = normalizePath(path);
    if (!fs[path]) return false;

    if (!permanent && !path.startsWith('/Recycle Bin')) {
      // Move to recycle bin
      const name = getFileName(path);
      let dest = '/Recycle Bin/' + name;
      let counter = 1;
      while (fs[dest]) {
        dest = `/Recycle Bin/${name}_${counter}`;
        counter++;
      }
      fs[dest] = { ...fs[path] };
      // Also move children if folder
      if (fs[path].type === 'folder') {
        const prefix = path + '/';
        const keys = Object.keys(fs).filter(k => k.startsWith(prefix));
        for (const k of keys) {
          const relative = k.substring(path.length);
          fs[dest + relative] = { ...fs[k] };
          delete fs[k];
        }
      }
      delete fs[path];
    } else {
      // Permanent delete
      if (fs[path].type === 'folder') {
        const prefix = path + '/';
        const keys = Object.keys(fs).filter(k => k.startsWith(prefix));
        for (const k of keys) delete fs[k];
      }
      delete fs[path];
    }
    save();
    return true;
  }

  function listDir(path) {
    path = normalizePath(path);
    const prefix = path === '/' ? '/' : path + '/';
    const items = [];
    const seen = new Set();

    for (const key of Object.keys(fs)) {
      if (key === path) continue;
      if (!key.startsWith(prefix)) continue;

      const rest = key.substring(prefix.length);
      const slashIdx = rest.indexOf('/');
      const name = slashIdx === -1 ? rest : rest.substring(0, slashIdx);

      if (seen.has(name)) continue;
      seen.add(name);

      const fullPath = prefix + name;
      const entry = fs[fullPath];
      if (!entry) continue;

      items.push({
        name,
        path: fullPath,
        type: entry.type,
        size: entry.size || 0,
        modified: entry.modified,
        created: entry.created
      });
    }

    // Sort: folders first, then alphabetical
    items.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });

    return items;
  }

  function rename(path, newName) {
    path = normalizePath(path);
    if (!fs[path]) return false;
    const parent = getParentPath(path);
    const newPath = normalizePath(parent + '/' + newName);

    if (fs[path].type === 'folder') {
      fs[newPath] = { ...fs[path] };
      const prefix = path + '/';
      const keys = Object.keys(fs).filter(k => k.startsWith(prefix));
      for (const k of keys) {
        const relative = k.substring(path.length);
        fs[newPath + relative] = { ...fs[k] };
        delete fs[k];
      }
      delete fs[path];
    } else {
      fs[newPath] = { ...fs[path] };
      delete fs[path];
    }
    save();
    return true;
  }

  function move(src, destFolder) {
    src = normalizePath(src);
    destFolder = normalizePath(destFolder);
    if (!fs[src]) return false;

    const name = getFileName(src);
    const newPath = destFolder + '/' + name;

    if (fs[src].type === 'folder') {
      fs[newPath] = { ...fs[src] };
      const prefix = src + '/';
      const keys = Object.keys(fs).filter(k => k.startsWith(prefix));
      for (const k of keys) {
        const relative = k.substring(src.length);
        fs[newPath + relative] = { ...fs[k] };
        delete fs[k];
      }
      delete fs[src];
    } else {
      fs[newPath] = { ...fs[src] };
      delete fs[src];
    }
    save();
    return true;
  }

  function copy(src, destFolder) {
    src = normalizePath(src);
    destFolder = normalizePath(destFolder);
    if (!fs[src]) return false;

    const name = getFileName(src);
    let newPath = destFolder + '/' + name;
    let counter = 1;
    while (fs[newPath]) {
      const ext = name.lastIndexOf('.');
      if (ext > 0) {
        newPath = destFolder + '/' + name.substring(0, ext) + ` (${counter})` + name.substring(ext);
      } else {
        newPath = destFolder + '/' + name + ` (${counter})`;
      }
      counter++;
    }

    fs[newPath] = { ...fs[src], modified: Date.now() };

    if (fs[src].type === 'folder') {
      const prefix = src + '/';
      const keys = Object.keys(fs).filter(k => k.startsWith(prefix));
      for (const k of keys) {
        const relative = k.substring(src.length);
        fs[newPath + relative] = { ...fs[k], modified: Date.now() };
      }
    }
    save();
    return true;
  }

  function getFileExtension(path) {
    const name = getFileName(path);
    const dot = name.lastIndexOf('.');
    return dot > 0 ? name.substring(dot + 1).toLowerCase() : '';
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    initDefault();
  }

  load();

  return {
    readFile, writeFile, createFolder, deleteFile, listDir,
    exists, isFolder, rename, move, copy,
    normalizePath, getParentPath, getFileName, getFileExtension,
    reset, load, save
  };
})();
