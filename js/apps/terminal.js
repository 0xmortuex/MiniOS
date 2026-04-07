// Terminal Application
const TerminalApp = {
  open() {
    let cwd = '/';
    let commandHistory = [];
    let historyIndex = -1;

    const win = WindowManager.createWindow({
      title: 'Terminal',
      icon: AppIcons.get('terminal'),
      width: 680,
      height: 440,
      minWidth: 400,
      minHeight: 250,
      appId: 'terminal'
    });

    const body = win.getBody();
    body.innerHTML = '<div class="terminal"></div>';
    const terminal = body.querySelector('.terminal');

    function getUsername() {
      return localStorage.getItem('minios_username') || 'user';
    }

    function getPrompt() {
      const p = cwd === '/' ? '/' : cwd;
      return `<span class="terminal-prompt">${getUsername()}@minios</span>:<span class="terminal-path">${p}</span>$ `;
    }

    function resolvePath(input) {
      if (!input) return cwd;
      if (input === '~') return '/';
      if (input.startsWith('/')) return FileSystem.normalizePath(input);
      return FileSystem.normalizePath(cwd + '/' + input);
    }

    function writeLine(html, className) {
      const line = document.createElement('div');
      line.className = 'terminal-line' + (className ? ' ' + className : '');
      line.innerHTML = html;
      terminal.appendChild(line);
    }

    function writeOutput(text, className) {
      text.split('\n').forEach(line => writeLine(escapeHtml(line), className));
    }

    const commands = {
      help() {
        writeLine('Available commands:', 'terminal-info');
        const cmds = [
          ['help', 'Show this help message'],
          ['ls [path]', 'List directory contents'],
          ['cd [path]', 'Change directory'],
          ['cat [file]', 'Display file contents'],
          ['touch [name]', 'Create empty file'],
          ['mkdir [name]', 'Create directory'],
          ['rm [name]', 'Remove file/folder'],
          ['mv [src] [dst]', 'Move or rename'],
          ['cp [src] [dst]', 'Copy file/folder'],
          ['pwd', 'Print working directory'],
          ['echo [text]', 'Print text (supports > redirect)'],
          ['clear', 'Clear terminal'],
          ['date', 'Show date and time'],
          ['whoami', 'Show current user'],
          ['neofetch', 'System information'],
          ['history', 'Command history'],
          ['open [file]', 'Open file in app'],
          ['exit', 'Close terminal']
        ];
        cmds.forEach(([cmd, desc]) => {
          writeLine(`  <span class="terminal-info">${cmd.padEnd(18)}</span> ${desc}`);
        });
      },

      ls(args) {
        const path = resolvePath(args[0]);
        if (!FileSystem.exists(path) || !FileSystem.isFolder(path)) {
          writeLine(`ls: cannot access '${args[0] || path}': No such directory`, 'terminal-error');
          return;
        }
        const items = FileSystem.listDir(path);
        if (items.length === 0) {
          writeLine('(empty)', 'terminal-info');
          return;
        }
        const lines = items.map(i => {
          const color = i.type === 'folder' ? 'terminal-info' : '';
          const suffix = i.type === 'folder' ? '/' : '';
          return `<span class="${color}">${escapeHtml(i.name)}${suffix}</span>`;
        });
        writeLine(lines.join('  '));
      },

      cd(args) {
        const target = args[0];
        if (!target || target === '~') { cwd = '/'; return; }
        const path = resolvePath(target);
        if (!FileSystem.exists(path) || !FileSystem.isFolder(path)) {
          writeLine(`cd: no such directory: ${target}`, 'terminal-error');
          return;
        }
        cwd = path;
      },

      cat(args) {
        if (!args[0]) { writeLine('cat: missing file operand', 'terminal-error'); return; }
        const path = resolvePath(args[0]);
        const content = FileSystem.readFile(path);
        if (content === null) {
          writeLine(`cat: ${args[0]}: No such file`, 'terminal-error');
          return;
        }
        writeOutput(content);
      },

      touch(args) {
        if (!args[0]) { writeLine('touch: missing file operand', 'terminal-error'); return; }
        const path = resolvePath(args[0]);
        if (!FileSystem.exists(path)) {
          FileSystem.writeFile(path, '');
        }
      },

      mkdir(args) {
        if (!args[0]) { writeLine('mkdir: missing operand', 'terminal-error'); return; }
        const path = resolvePath(args[0]);
        if (FileSystem.exists(path)) {
          writeLine(`mkdir: cannot create directory '${args[0]}': File exists`, 'terminal-error');
          return;
        }
        FileSystem.createFolder(path);
      },

      rm(args) {
        if (!args[0]) { writeLine('rm: missing operand', 'terminal-error'); return; }
        const path = resolvePath(args[0]);
        if (!FileSystem.exists(path)) {
          writeLine(`rm: cannot remove '${args[0]}': No such file or directory`, 'terminal-error');
          return;
        }
        FileSystem.deleteFile(path);
        writeLine(`Moved to Recycle Bin: ${args[0]}`, 'terminal-success');
      },

      mv(args) {
        if (args.length < 2) { writeLine('mv: missing destination', 'terminal-error'); return; }
        const src = resolvePath(args[0]);
        const dst = resolvePath(args[1]);
        if (!FileSystem.exists(src)) {
          writeLine(`mv: cannot stat '${args[0]}': No such file`, 'terminal-error');
          return;
        }
        if (FileSystem.isFolder(dst)) {
          FileSystem.move(src, dst);
        } else {
          FileSystem.rename(src, args[1]);
        }
      },

      cp(args) {
        if (args.length < 2) { writeLine('cp: missing destination', 'terminal-error'); return; }
        const src = resolvePath(args[0]);
        const dstDir = resolvePath(args[1]);
        if (!FileSystem.exists(src)) {
          writeLine(`cp: cannot stat '${args[0]}': No such file`, 'terminal-error');
          return;
        }
        FileSystem.copy(src, FileSystem.isFolder(dstDir) ? dstDir : FileSystem.getParentPath(dstDir));
      },

      pwd() {
        writeLine(cwd);
      },

      echo(args, raw) {
        // Check for redirect
        const redirectIdx = raw.indexOf('>');
        if (redirectIdx !== -1) {
          const text = raw.substring(0, redirectIdx).replace(/^echo\s+/, '').trim().replace(/^["']|["']$/g, '');
          const file = raw.substring(redirectIdx + 1).trim();
          const path = resolvePath(file);
          FileSystem.writeFile(path, text);
          return;
        }
        const text = args.join(' ').replace(/^["']|["']$/g, '');
        writeLine(escapeHtml(text));
      },

      clear() {
        terminal.innerHTML = '';
      },

      date() {
        writeLine(new Date().toString());
      },

      whoami() {
        writeLine(getUsername());
      },

      neofetch() {
        const uptime = Boot.getUptime();
        const mins = Math.floor(uptime / 60);
        const secs = uptime % 60;
        const ascii = [
          '  __  __ _       _  ___  ____  ',
          ' |  \\/  (_)_ __ (_)/ _ \\/ ___| ',
          ' | |\\/| | | \'_ \\| | | | \\___ \\ ',
          ' | |  | | | | | | | |_| |___) |',
          ' |_|  |_|_|_| |_|_|\\___/|____/ ',
        ];
        const info = [
          `<span class="terminal-info">${getUsername()}</span>@<span class="terminal-info">minios</span>`,
          '─────────────────',
          `<span class="terminal-info">OS:</span> MiniOS v1.0`,
          `<span class="terminal-info">Host:</span> Browser`,
          `<span class="terminal-info">Resolution:</span> ${window.innerWidth}x${window.innerHeight}`,
          `<span class="terminal-info">Uptime:</span> ${mins}m ${secs}s`,
          `<span class="terminal-info">Shell:</span> miniterm`,
          `<span class="terminal-info">DE:</span> MiniOS Desktop`,
          `<span class="terminal-info">WM:</span> WindowManager.js`,
          `<span class="terminal-info">Theme:</span> Dark`,
        ];
        ascii.forEach((line, i) => {
          const infoLine = info[i] || '';
          writeLine(`<span class="terminal-neofetch">${escapeHtml(line)}</span>  ${infoLine}`);
        });
        // Remaining info lines
        for (let i = ascii.length; i < info.length; i++) {
          writeLine('                                  ' + info[i]);
        }
      },

      history() {
        commandHistory.forEach((cmd, i) => {
          writeLine(`  ${String(i + 1).padStart(4)}  ${escapeHtml(cmd)}`);
        });
      },

      open(args) {
        if (!args[0]) { writeLine('open: missing file', 'terminal-error'); return; }
        const path = resolvePath(args[0]);
        if (!FileSystem.exists(path)) {
          writeLine(`open: ${args[0]}: No such file`, 'terminal-error');
          return;
        }
        const ext = FileSystem.getFileExtension(path);
        if (ext === 'txt' || ext === 'md' || ext === 'js' || ext === 'css' || ext === 'html' || ext === 'json') {
          Apps.open('notepad', path);
        } else if (ext === 'svg' || ext === 'png' || ext === 'jpg') {
          Apps.open('image-viewer', path);
        } else {
          Apps.open('notepad', path);
        }
      },

      exit() {
        win.close();
      }
    };

    function executeCommand(input) {
      const raw = input.trim();
      if (!raw) return;

      commandHistory.push(raw);
      historyIndex = commandHistory.length;

      // Parse command
      const parts = raw.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
      const cmd = parts[0];
      const args = parts.slice(1).map(a => a.replace(/^"|"$/g, ''));

      if (commands[cmd]) {
        commands[cmd](args, raw);
      } else {
        writeLine(`${cmd}: command not found`, 'terminal-error');
      }
    }

    function createPromptLine() {
      const line = document.createElement('div');
      line.className = 'terminal-input-line';
      line.innerHTML = getPrompt();

      const input = document.createElement('input');
      input.className = 'terminal-input';
      input.type = 'text';
      input.spellcheck = false;
      line.appendChild(input);
      terminal.appendChild(line);

      input.focus();

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const value = input.value;
          // Replace input with static text
          line.innerHTML = getPrompt() + escapeHtml(value);
          executeCommand(value);
          createPromptLine();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (historyIndex > 0) {
            historyIndex--;
            input.value = commandHistory[historyIndex];
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            input.value = commandHistory[historyIndex];
          } else {
            historyIndex = commandHistory.length;
            input.value = '';
          }
        } else if (e.key === 'Tab') {
          e.preventDefault();
          tabComplete(input);
        } else if (e.key === 'l' && e.ctrlKey) {
          e.preventDefault();
          commands.clear();
          createPromptLine();
        }
        e.stopPropagation();
      });

      terminal.scrollTop = terminal.scrollHeight;
    }

    function tabComplete(input) {
      const val = input.value;
      const parts = val.split(' ');
      const partial = parts[parts.length - 1];

      if (parts.length === 1) {
        // Complete command
        const matches = Object.keys(commands).filter(c => c.startsWith(partial));
        if (matches.length === 1) {
          input.value = matches[0] + ' ';
        } else if (matches.length > 1) {
          writeLine(matches.join('  '), 'terminal-info');
        }
      } else {
        // Complete filename
        const dir = partial.includes('/') ? resolvePath(partial.substring(0, partial.lastIndexOf('/'))) : cwd;
        const prefix = partial.includes('/') ? partial.substring(partial.lastIndexOf('/') + 1) : partial;
        const items = FileSystem.listDir(dir);
        const matches = items.filter(i => i.name.startsWith(prefix));
        if (matches.length === 1) {
          const completed = matches[0].name + (matches[0].type === 'folder' ? '/' : '');
          parts[parts.length - 1] = partial.includes('/') ?
            partial.substring(0, partial.lastIndexOf('/') + 1) + completed : completed;
          input.value = parts.join(' ');
        } else if (matches.length > 1) {
          writeLine(matches.map(m => m.name).join('  '), 'terminal-info');
        }
      }
    }

    // Click terminal to focus input
    terminal.addEventListener('click', () => {
      const input = terminal.querySelector('.terminal-input:last-of-type');
      if (input) input.focus();
    });

    // Welcome
    writeLine('MiniOS Terminal v1.0', 'terminal-info');
    writeLine('Type "help" for available commands.\n');
    createPromptLine();
  }
};
