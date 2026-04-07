// App Store + Installable Mini-Apps

// ── Helpers ──
function getInstalledApps() {
  try { return JSON.parse(localStorage.getItem('minios_installed_apps') || '[]'); }
  catch { return []; }
}
function setInstalledApps(list) {
  localStorage.setItem('minios_installed_apps', JSON.stringify(list));
}
function isInstalled(id) { return getInstalledApps().includes(id); }

// ── Store App Definitions ──
const storeApps = [
  {
    id: 'snake', name: 'Snake', category: 'Games',
    desc: 'Classic snake game',
    icon: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="20" width="8" height="8" rx="1" fill="#a6e3a1"/><rect x="12" y="20" width="8" height="8" rx="1" fill="#a6e3a1"/><rect x="20" y="20" width="8" height="8" rx="1" fill="#a6e3a1"/><rect x="20" y="12" width="8" height="8" rx="1" fill="#a6e3a1"/><rect x="28" y="12" width="8" height="8" rx="1" fill="#94e2d5"/><circle cx="33" cy="15" r="1.5" fill="#1e1e2e"/><rect x="36" y="28" width="6" height="6" rx="3" fill="#f38ba8"/></svg>'
  },
  {
    id: 'minesweeper', name: 'Minesweeper', category: 'Games',
    desc: 'Find the mines',
    icon: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="32" height="32" rx="3" fill="#585b70"/><circle cx="24" cy="24" r="7" fill="#313244"/><circle cx="24" cy="24" r="4" fill="#f38ba8"/><line x1="24" y1="10" x2="24" y2="17" stroke="#f38ba8" stroke-width="2"/><line x1="24" y1="31" x2="24" y2="38" stroke="#f38ba8" stroke-width="2"/><line x1="10" y1="24" x2="17" y2="24" stroke="#f38ba8" stroke-width="2"/><line x1="31" y1="24" x2="38" y2="24" stroke="#f38ba8" stroke-width="2"/></svg>'
  },
  {
    id: '2048', name: '2048', category: 'Games',
    desc: 'Sliding tile puzzle',
    icon: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="40" height="40" rx="4" fill="#cba6f7" opacity="0.2"/><rect x="6" y="6" width="16" height="16" rx="3" fill="#f2b179"/><rect x="26" y="6" width="16" height="16" rx="3" fill="#edc53f"/><rect x="6" y="26" width="16" height="16" rx="3" fill="#ede0c8"/><rect x="26" y="26" width="16" height="16" rx="3" fill="#f67c5f"/><text x="14" y="18" text-anchor="middle" fill="#1e1e2e" font-size="10" font-weight="bold">8</text><text x="34" y="18" text-anchor="middle" fill="#1e1e2e" font-size="8" font-weight="bold">1024</text><text x="14" y="38" text-anchor="middle" fill="#1e1e2e" font-size="10" font-weight="bold">4</text><text x="34" y="38" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">32</text></svg>'
  },
  {
    id: 'sticky-notes', name: 'Sticky Notes', category: 'Utilities',
    desc: 'Quick notes on desktop',
    icon: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="6" width="36" height="36" rx="3" fill="#f9e2af"/><path d="M30 42L42 30V42H30Z" fill="#e6c87a"/><line x1="12" y1="16" x2="32" y2="16" stroke="#7c6f50" stroke-width="1.5" opacity="0.4"/><line x1="12" y1="22" x2="30" y2="22" stroke="#7c6f50" stroke-width="1.5" opacity="0.4"/><line x1="12" y1="28" x2="26" y2="28" stroke="#7c6f50" stroke-width="1.5" opacity="0.4"/></svg>'
  },
  {
    id: 'clock-widget', name: 'Clock', category: 'Utilities',
    desc: 'Analog clock widget',
    icon: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="20" fill="#313244" stroke="#cdd6f4" stroke-width="2"/><circle cx="24" cy="24" r="1.5" fill="#cdd6f4"/><line x1="24" y1="24" x2="24" y2="12" stroke="#cdd6f4" stroke-width="2.5" stroke-linecap="round"/><line x1="24" y1="24" x2="32" y2="20" stroke="#cdd6f4" stroke-width="2" stroke-linecap="round"/><line x1="24" y1="24" x2="28" y2="30" stroke="#f38ba8" stroke-width="1" stroke-linecap="round"/></svg>'
  },
  {
    id: 'system-monitor', name: 'System Monitor', category: 'Utilities',
    desc: 'CPU & Memory monitor',
    icon: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="8" width="40" height="32" rx="3" fill="#313244" stroke="#585b70" stroke-width="1.5"/><polyline points="8,32 14,28 20,30 26,20 32,22 38,14" fill="none" stroke="#a6e3a1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="8,34 14,32 20,33 26,28 32,30 38,26" fill="none" stroke="#89b4fa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/></svg>'
  }
];

// ── App Store Application ──
const AppStoreApp = {
  open() {
    const win = WindowManager.createWindow({
      title: 'MiniOS Store',
      icon: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="40" height="40" rx="6" fill="#89b4fa"/><path d="M16 16h16v4H16zM16 24h16v4H16zM16 32h10v4H16z" fill="#1e1e2e" opacity="0.6"/></svg>',
      width: 540,
      height: 460,
      minWidth: 440,
      minHeight: 380,
      appId: 'appstore'
    });
    const body = win.getBody();

    let activeCategory = 'All';
    let searchQuery = '';

    function render() {
      const filtered = storeApps.filter(app => {
        const matchCat = activeCategory === 'All' || app.category === activeCategory;
        const matchSearch = !searchQuery || app.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
      });

      body.innerHTML = `
        <div class="appstore">
          <div class="appstore-header">
            <h2>MiniOS Store</h2>
            <input class="appstore-search" type="text" placeholder="Search apps..." value="${searchQuery}">
          </div>
          <div class="appstore-categories">
            ${['All', 'Games', 'Utilities'].map(c =>
              `<button class="appstore-cat-btn ${activeCategory === c ? 'active' : ''}" data-cat="${c}">${c}</button>`
            ).join('')}
          </div>
          <div class="appstore-grid">
            ${filtered.map(app => {
              const installed = isInstalled(app.id);
              return `
                <div class="appstore-card" data-id="${app.id}">
                  <div class="appstore-card-icon">${app.icon}</div>
                  <div class="appstore-card-name">${app.name}</div>
                  <div class="appstore-card-desc">${app.desc}</div>
                  <div class="appstore-card-actions">
                    <button class="appstore-install-btn ${installed ? 'installed' : ''}" data-id="${app.id}">
                      <span class="progress-fill"></span>
                      <span class="btn-label">${installed ? 'Installed \u2713' : 'Install'}</span>
                    </button>
                    ${installed ? `<button class="appstore-uninstall-link" data-uninstall="${app.id}">Uninstall</button>` : ''}
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      `;

      // Search
      body.querySelector('.appstore-search').addEventListener('input', e => {
        searchQuery = e.target.value;
        render();
      });

      // Category buttons
      body.querySelectorAll('.appstore-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          activeCategory = btn.dataset.cat;
          render();
        });
      });

      // Install buttons
      body.querySelectorAll('.appstore-install-btn:not(.installed)').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          btn.classList.add('installing');
          setTimeout(() => {
            const list = getInstalledApps();
            if (!list.includes(id)) { list.push(id); setInstalledApps(list); }
            render();
          }, 1550);
        });
      });

      // Uninstall links
      body.querySelectorAll('.appstore-uninstall-link').forEach(link => {
        link.addEventListener('click', () => {
          const id = link.dataset.uninstall;
          const list = getInstalledApps().filter(a => a !== id);
          setInstalledApps(list);
          render();
        });
      });
    }

    render();
  }
};

// ── Snake App ──
const SnakeApp = {
  open() {
    const win = WindowManager.createWindow({
      title: 'Snake',
      icon: storeApps[0].icon,
      width: 380,
      height: 440,
      minWidth: 380,
      minHeight: 440,
      appId: 'snake',
      resizable: false
    });
    const body = win.getBody();

    const COLS = 20, ROWS = 20, CELL = 16;
    const W = COLS * CELL, H = ROWS * CELL;
    let snake, dir, nextDir, food, score, highScore, gameOver, running, interval;

    highScore = parseInt(localStorage.getItem('minios_snake_hi') || '0');

    body.style.cssText = 'display:flex;flex-direction:column;align-items:center;background:#1e1e2e;height:100%;padding:8px 0;';
    body.innerHTML = `
      <div style="display:flex;justify-content:space-between;width:${W}px;margin-bottom:6px;font-size:13px;color:#cdd6f4;">
        <span>Score: <b id="sn-score">0</b></span>
        <span>Best: <b id="sn-hi">${highScore}</b></span>
      </div>
      <canvas id="sn-canvas" width="${W}" height="${H}" style="border:1px solid #585b70;border-radius:4px;background:#181825;"></canvas>
      <button id="sn-start" style="margin-top:8px;padding:6px 24px;border:none;border-radius:6px;background:#a6e3a1;color:#1e1e2e;font-weight:600;cursor:pointer;font-size:13px;">Start</button>
    `;

    const canvas = body.querySelector('#sn-canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = body.querySelector('#sn-score');
    const hiEl = body.querySelector('#sn-hi');
    const startBtn = body.querySelector('#sn-start');

    function init() {
      const cx = Math.floor(COLS / 2), cy = Math.floor(ROWS / 2);
      snake = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
      dir = { x: 1, y: 0 }; nextDir = { x: 1, y: 0 };
      score = 0; gameOver = false; running = true;
      placeFood();
      scoreEl.textContent = '0';
      startBtn.textContent = 'Restart';
    }

    function placeFood() {
      let pos;
      do {
        pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
      } while (snake.some(s => s.x === pos.x && s.y === pos.y));
      food = pos;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      // grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      for (let i = 0; i <= COLS; i++) { ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, H); ctx.stroke(); }
      for (let i = 0; i <= ROWS; i++) { ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(W, i * CELL); ctx.stroke(); }
      // food
      ctx.fillStyle = '#f38ba8';
      ctx.beginPath();
      ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      // snake
      snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? '#94e2d5' : '#a6e3a1';
        ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
      });
      if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#f38ba8';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', W / 2, H / 2);
        ctx.font = '13px sans-serif';
        ctx.fillStyle = '#cdd6f4';
        ctx.fillText('Press Start to play again', W / 2, H / 2 + 24);
      }
    }

    function tick() {
      if (gameOver || !running) return;
      dir = { ...nextDir };
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS || snake.some(s => s.x === head.x && s.y === head.y)) {
        gameOver = true;
        running = false;
        if (score > highScore) { highScore = score; localStorage.setItem('minios_snake_hi', String(highScore)); hiEl.textContent = highScore; }
        draw();
        return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score++;
        scoreEl.textContent = score;
        placeFood();
        // speed up
        clearInterval(interval);
        interval = setInterval(tick, Math.max(60, 120 - score * 2));
      } else {
        snake.pop();
      }
      draw();
    }

    function handleKey(e) {
      const map = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 } };
      const d = map[e.key];
      if (d && (d.x + dir.x !== 0 || d.y + dir.y !== 0)) { nextDir = d; e.preventDefault(); }
    }

    startBtn.addEventListener('click', () => {
      init(); clearInterval(interval);
      interval = setInterval(tick, 120);
      draw();
    });

    document.addEventListener('keydown', handleKey);
    win.onClose = () => { clearInterval(interval); document.removeEventListener('keydown', handleKey); };

    // initial draw
    snake = [{ x: 10, y: 10 }]; food = { x: 15, y: 10 }; score = 0; gameOver = false; running = false;
    draw();
  }
};

// ── Minesweeper App ──
const MinesweeperApp = {
  open() {
    const win = WindowManager.createWindow({
      title: 'Minesweeper',
      icon: storeApps[1].icon,
      width: 320,
      height: 380,
      minWidth: 320,
      minHeight: 380,
      appId: 'minesweeper',
      resizable: false
    });
    const body = win.getBody();

    const ROWS = 9, COLS = 9, MINES = 10, CELL = 28;
    let board, revealed, flagged, mineCount, timerVal, timerInterval, gameOver, won, firstClick;

    const NUM_COLORS = ['', '#89b4fa', '#a6e3a1', '#f38ba8', '#cba6f7', '#fab387', '#94e2d5', '#f5c2e7', '#cdd6f4'];

    body.style.cssText = 'display:flex;flex-direction:column;align-items:center;background:#1e1e2e;height:100%;padding:8px;';
    body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;width:${COLS * CELL}px;margin-bottom:6px;">
        <span style="font-size:14px;color:#f38ba8;font-weight:600;" id="ms-mines">${MINES}</span>
        <button id="ms-new" style="padding:3px 12px;border:none;border-radius:4px;background:#89b4fa;color:#1e1e2e;font-size:12px;font-weight:600;cursor:pointer;">New Game</button>
        <span style="font-size:14px;color:#cdd6f4;font-family:monospace;" id="ms-timer">000</span>
      </div>
      <div id="ms-grid" style="display:grid;grid-template-columns:repeat(${COLS},${CELL}px);grid-template-rows:repeat(${ROWS},${CELL}px);gap:1px;background:#313244;border:1px solid #585b70;border-radius:4px;overflow:hidden;"></div>
      <div id="ms-msg" style="margin-top:6px;font-size:13px;color:#cdd6f4;height:18px;"></div>
    `;

    const gridEl = body.querySelector('#ms-grid');
    const minesEl = body.querySelector('#ms-mines');
    const timerEl = body.querySelector('#ms-timer');
    const msgEl = body.querySelector('#ms-msg');
    const newBtn = body.querySelector('#ms-new');

    function initGame() {
      board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
      revealed = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
      flagged = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
      mineCount = MINES; timerVal = 0; gameOver = false; won = false; firstClick = true;
      clearInterval(timerInterval);
      minesEl.textContent = MINES;
      timerEl.textContent = '000';
      msgEl.textContent = '';
      renderGrid();
    }

    function placeMines(safeR, safeC) {
      let placed = 0;
      while (placed < MINES) {
        const r = Math.floor(Math.random() * ROWS), c = Math.floor(Math.random() * COLS);
        if (board[r][c] === -1 || (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1)) continue;
        board[r][c] = -1; placed++;
      }
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (board[r][c] === -1) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === -1) count++;
        }
        board[r][c] = count;
      }
    }

    function reveal(r, c) {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || revealed[r][c] || flagged[r][c]) return;
      revealed[r][c] = true;
      if (board[r][c] === 0) {
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) reveal(r + dr, c + dc);
      }
    }

    function checkWin() {
      let unrevealed = 0;
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (!revealed[r][c]) unrevealed++;
      }
      if (unrevealed === MINES) { won = true; gameOver = true; clearInterval(timerInterval); msgEl.textContent = 'You Win!'; msgEl.style.color = '#a6e3a1'; }
    }

    function renderGrid() {
      gridEl.innerHTML = '';
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('div');
        cell.style.cssText = `width:${CELL}px;height:${CELL}px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;cursor:pointer;user-select:none;`;
        if (revealed[r][c]) {
          cell.style.background = '#45475a';
          if (board[r][c] === -1) {
            cell.style.background = '#f38ba8';
            cell.textContent = '\u25cf';
            cell.style.color = '#1e1e2e';
          } else if (board[r][c] > 0) {
            cell.textContent = board[r][c];
            cell.style.color = NUM_COLORS[board[r][c]] || '#cdd6f4';
          }
        } else {
          cell.style.background = '#585b70';
          if (flagged[r][c]) { cell.textContent = '\u2691'; cell.style.color = '#f38ba8'; }
          if (gameOver && board[r][c] === -1 && !flagged[r][c]) {
            cell.style.background = '#f38ba8'; cell.textContent = '\u25cf'; cell.style.color = '#1e1e2e';
          }
        }
        cell.addEventListener('click', () => onLeftClick(r, c));
        cell.addEventListener('contextmenu', (e) => { e.preventDefault(); onRightClick(r, c); });
        gridEl.appendChild(cell);
      }
    }

    function onLeftClick(r, c) {
      if (gameOver || flagged[r][c]) return;
      if (firstClick) {
        firstClick = false;
        placeMines(r, c);
        timerInterval = setInterval(() => { timerVal++; timerEl.textContent = String(timerVal).padStart(3, '0'); }, 1000);
      }
      if (board[r][c] === -1) {
        gameOver = true; clearInterval(timerInterval);
        revealed[r][c] = true;
        msgEl.textContent = 'Game Over!'; msgEl.style.color = '#f38ba8';
        renderGrid(); return;
      }
      reveal(r, c);
      checkWin();
      renderGrid();
    }

    function onRightClick(r, c) {
      if (gameOver || revealed[r][c]) return;
      flagged[r][c] = !flagged[r][c];
      mineCount += flagged[r][c] ? -1 : 1;
      minesEl.textContent = mineCount;
      renderGrid();
    }

    newBtn.addEventListener('click', initGame);
    win.onClose = () => { clearInterval(timerInterval); };
    initGame();
  }
};

// ── 2048 App ──
const Game2048App = {
  open() {
    const win = WindowManager.createWindow({
      title: '2048',
      icon: storeApps[2].icon,
      width: 340,
      height: 420,
      minWidth: 340,
      minHeight: 420,
      appId: '2048',
      resizable: false
    });
    const body = win.getBody();

    const SIZE = 4;
    const TILE_COLORS = { 2:'#eee4da',4:'#ede0c8',8:'#f2b179',16:'#f59563',32:'#f67c5f',64:'#f65e3b',128:'#edcf72',256:'#edcc61',512:'#edc850',1024:'#edc53f',2048:'#edc22e' };
    let grid, score, gameOverFlag, wonFlag;

    body.style.cssText = 'display:flex;flex-direction:column;align-items:center;background:#1e1e2e;height:100%;padding:10px;';
    body.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;width:280px;margin-bottom:8px;">
        <span style="font-size:22px;font-weight:700;color:#edc22e;">2048</span>
        <span style="font-size:13px;color:#cdd6f4;">Score: <b id="g2-score">0</b></span>
        <button id="g2-new" style="padding:4px 12px;border:none;border-radius:4px;background:#89b4fa;color:#1e1e2e;font-size:12px;font-weight:600;cursor:pointer;">New</button>
      </div>
      <div id="g2-board" style="display:grid;grid-template-columns:repeat(4,64px);grid-template-rows:repeat(4,64px);gap:6px;background:#313244;border-radius:8px;padding:8px;"></div>
      <div id="g2-msg" style="margin-top:8px;font-size:14px;color:#cdd6f4;height:20px;"></div>
    `;

    const boardEl = body.querySelector('#g2-board');
    const scoreEl = body.querySelector('#g2-score');
    const msgEl = body.querySelector('#g2-msg');
    const newBtn = body.querySelector('#g2-new');

    function init() {
      grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
      score = 0; gameOverFlag = false; wonFlag = false;
      addRandom(); addRandom();
      scoreEl.textContent = '0'; msgEl.textContent = '';
      renderBoard();
    }

    function addRandom() {
      const empty = [];
      for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (grid[r][c] === 0) empty.push([r, c]);
      if (!empty.length) return;
      const [r, c] = empty[Math.floor(Math.random() * empty.length)];
      grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }

    function slide(row) {
      let arr = row.filter(v => v);
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) { arr[i] *= 2; score += arr[i]; arr[i + 1] = 0; }
      }
      arr = arr.filter(v => v);
      while (arr.length < SIZE) arr.push(0);
      return arr;
    }

    function move(direction) {
      if (gameOverFlag) return;
      const oldGrid = grid.map(r => [...r]);
      if (direction === 'left') {
        for (let r = 0; r < SIZE; r++) grid[r] = slide(grid[r]);
      } else if (direction === 'right') {
        for (let r = 0; r < SIZE; r++) grid[r] = slide(grid[r].reverse()).reverse();
      } else if (direction === 'up') {
        for (let c = 0; c < SIZE; c++) {
          let col = []; for (let r = 0; r < SIZE; r++) col.push(grid[r][c]);
          col = slide(col); for (let r = 0; r < SIZE; r++) grid[r][c] = col[r];
        }
      } else if (direction === 'down') {
        for (let c = 0; c < SIZE; c++) {
          let col = []; for (let r = 0; r < SIZE; r++) col.push(grid[r][c]);
          col = slide(col.reverse()).reverse(); for (let r = 0; r < SIZE; r++) grid[r][c] = col[r];
        }
      }
      const changed = grid.some((row, r) => row.some((v, c) => v !== oldGrid[r][c]));
      if (changed) {
        addRandom();
        scoreEl.textContent = score;
        if (!wonFlag && grid.some(row => row.some(v => v === 2048))) { wonFlag = true; msgEl.textContent = 'You reached 2048!'; msgEl.style.color = '#edc22e'; }
        if (isGameOver()) { gameOverFlag = true; msgEl.textContent = 'Game Over!'; msgEl.style.color = '#f38ba8'; }
        renderBoard();
      }
    }

    function isGameOver() {
      for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === 0) return false;
        if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return false;
        if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return false;
      }
      return true;
    }

    function renderBoard() {
      boardEl.innerHTML = '';
      for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
        const val = grid[r][c];
        const tile = document.createElement('div');
        const bg = val ? (TILE_COLORS[val] || '#3c3a32') : '#45475a';
        const fg = val >= 8 ? '#fff' : '#1e1e2e';
        const fs = val >= 1024 ? '18px' : val >= 128 ? '22px' : '26px';
        tile.style.cssText = `width:64px;height:64px;display:flex;align-items:center;justify-content:center;border-radius:6px;font-size:${fs};font-weight:700;background:${bg};color:${fg};`;
        if (val) tile.textContent = val;
        boardEl.appendChild(tile);
      }
    }

    function handleKey(e) {
      const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
      if (map[e.key]) { e.preventDefault(); move(map[e.key]); }
    }

    document.addEventListener('keydown', handleKey);
    newBtn.addEventListener('click', init);
    win.onClose = () => { document.removeEventListener('keydown', handleKey); };
    init();
  }
};

// ── Sticky Notes App ──
const StickyNotesApp = {
  _counter: 0,
  open() {
    const noteId = ++this._counter;
    const COLORS = ['#f9e2af', '#a6e3a1', '#f5c2e7', '#89b4fa'];
    let colorIndex = (noteId - 1) % COLORS.length;
    const filePath = `/Documents/sticky-${noteId}.txt`;

    const win = WindowManager.createWindow({
      title: 'Sticky Note',
      icon: storeApps[3].icon,
      width: 250,
      height: 250,
      minWidth: 180,
      minHeight: 150,
      appId: 'sticky-notes'
    });
    const body = win.getBody();

    let savedText = '';
    try { savedText = FileSystem.readFile(filePath) || ''; } catch (e) {}

    body.style.cssText = 'display:flex;flex-direction:column;height:100%;';
    body.innerHTML = `
      <div id="sn-toolbar" style="display:flex;gap:6px;padding:6px 8px;background:rgba(0,0,0,0.15);flex-shrink:0;align-items:center;">
        ${COLORS.map((c, i) => `<div data-ci="${i}" style="width:18px;height:18px;border-radius:50%;background:${c};cursor:pointer;border:2px solid ${i === colorIndex ? '#1e1e2e' : 'transparent'};"></div>`).join('')}
      </div>
      <textarea id="sn-text" style="flex:1;border:none;outline:none;resize:none;padding:10px;font-size:13px;font-family:sans-serif;background:${COLORS[colorIndex]};color:#1e1e2e;line-height:1.4;">${savedText}</textarea>
    `;

    const textarea = body.querySelector('#sn-text');
    const toolbar = body.querySelector('#sn-toolbar');

    textarea.addEventListener('input', () => {
      try { FileSystem.writeFile(filePath, textarea.value); } catch (e) {}
    });

    toolbar.addEventListener('click', (e) => {
      const circle = e.target.closest('[data-ci]');
      if (!circle) return;
      colorIndex = parseInt(circle.dataset.ci);
      textarea.style.background = COLORS[colorIndex];
      toolbar.querySelectorAll('[data-ci]').forEach(d => {
        d.style.border = parseInt(d.dataset.ci) === colorIndex ? '2px solid #1e1e2e' : '2px solid transparent';
      });
    });
  }
};

// ── Clock Widget App ──
const ClockWidgetApp = {
  open() {
    const win = WindowManager.createWindow({
      title: 'Clock',
      icon: storeApps[4].icon,
      width: 200,
      height: 220,
      minWidth: 200,
      minHeight: 220,
      appId: 'clock-widget',
      resizable: false
    });
    const body = win.getBody();

    body.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;background:#1e1e2e;height:100%;padding:8px;';
    body.innerHTML = `
      <svg id="clk-svg" width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="64" fill="#313244" stroke="#585b70" stroke-width="2"/>
        ${Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30 - 90) * Math.PI / 180;
          const x1 = 70 + Math.cos(angle) * 54, y1 = 70 + Math.sin(angle) * 54;
          const x2 = 70 + Math.cos(angle) * 60, y2 = 70 + Math.sin(angle) * 60;
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#cdd6f4" stroke-width="${i % 3 === 0 ? 2.5 : 1}" stroke-linecap="round"/>`;
        }).join('')}
        <line id="clk-h" x1="70" y1="70" x2="70" y2="35" stroke="#cdd6f4" stroke-width="3.5" stroke-linecap="round"/>
        <line id="clk-m" x1="70" y1="70" x2="70" y2="22" stroke="#cdd6f4" stroke-width="2.5" stroke-linecap="round"/>
        <line id="clk-s" x1="70" y1="70" x2="70" y2="18" stroke="#f38ba8" stroke-width="1" stroke-linecap="round"/>
        <circle cx="70" cy="70" r="3" fill="#cdd6f4"/>
      </svg>
      <div id="clk-digital" style="margin-top:6px;font-size:16px;color:#cdd6f4;font-family:monospace;font-weight:600;"></div>
    `;

    const hourHand = body.querySelector('#clk-h');
    const minHand = body.querySelector('#clk-m');
    const secHand = body.querySelector('#clk-s');
    const digitalEl = body.querySelector('#clk-digital');

    function setHand(el, angle, len) {
      const rad = (angle - 90) * Math.PI / 180;
      el.setAttribute('x2', 70 + Math.cos(rad) * len);
      el.setAttribute('y2', 70 + Math.sin(rad) * len);
    }

    function update() {
      const now = new Date();
      const h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds();
      setHand(hourHand, h * 30 + m * 0.5, 32);
      setHand(minHand, m * 6 + s * 0.1, 44);
      setHand(secHand, s * 6, 50);
      digitalEl.textContent = now.toLocaleTimeString();
    }

    update();
    const interval = setInterval(update, 1000);
    win.onClose = () => { clearInterval(interval); };
  }
};

// ── System Monitor App ──
const SystemMonitorApp = {
  open() {
    const win = WindowManager.createWindow({
      title: 'System Monitor',
      icon: storeApps[5].icon,
      width: 220,
      height: 140,
      minWidth: 220,
      minHeight: 140,
      appId: 'system-monitor',
      resizable: false
    });
    const body = win.getBody();

    body.style.cssText = 'display:flex;flex-direction:column;justify-content:center;gap:10px;padding:12px;background:#1e1e2e;height:100%;font-family:monospace;';
    body.innerHTML = `
      <div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:#cdd6f4;margin-bottom:3px;"><span>CPU</span><span id="sm-cpu-val">0%</span></div>
        <div style="height:10px;background:#313244;border-radius:4px;overflow:hidden;"><div id="sm-cpu-bar" style="height:100%;width:0%;background:#a6e3a1;border-radius:4px;transition:width 0.4s;"></div></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:#cdd6f4;margin-bottom:3px;"><span>Memory</span><span id="sm-mem-val">0/512 MB</span></div>
        <div style="height:10px;background:#313244;border-radius:4px;overflow:hidden;"><div id="sm-mem-bar" style="height:100%;width:0%;background:#89b4fa;border-radius:4px;transition:width 0.4s;"></div></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:#6c7086;">
        <span>Processes: <span id="sm-procs">0</span></span>
        <span>Uptime: <span id="sm-up">0m</span></span>
      </div>
    `;

    const cpuVal = body.querySelector('#sm-cpu-val');
    const cpuBar = body.querySelector('#sm-cpu-bar');
    const memVal = body.querySelector('#sm-mem-val');
    const memBar = body.querySelector('#sm-mem-bar');
    const procsEl = body.querySelector('#sm-procs');
    const upEl = body.querySelector('#sm-up');
    const startTime = Date.now();

    function update() {
      // Try to get real data from TaskManagerApp's approach
      let cpu, memUsed, procs;
      const totalMem = 512;
      try {
        const openWindows = document.querySelectorAll('.window').length;
        procs = openWindows + 4; // system processes
        cpu = Math.min(100, Math.round(procs * 3.2 + Math.random() * 8));
        memUsed = Math.min(totalMem, Math.round(procs * 25 + 80 + Math.random() * 20));
      } catch (e) {
        cpu = Math.round(10 + Math.random() * 30);
        memUsed = Math.round(120 + Math.random() * 80);
        procs = 6;
      }

      cpuVal.textContent = cpu + '%';
      cpuBar.style.width = cpu + '%';
      cpuBar.style.background = cpu > 80 ? '#f38ba8' : cpu > 50 ? '#fab387' : '#a6e3a1';
      memVal.textContent = `${memUsed}/${totalMem} MB`;
      memBar.style.width = (memUsed / totalMem * 100) + '%';
      procsEl.textContent = procs;
      const upMins = Math.floor((Date.now() - startTime) / 60000);
      upEl.textContent = upMins < 60 ? upMins + 'm' : Math.floor(upMins / 60) + 'h ' + (upMins % 60) + 'm';
    }

    update();
    const interval = setInterval(update, 2000);
    win.onClose = () => { clearInterval(interval); };
  }
};

// ── Store Apps Registry ──
const StoreApps = {
  openApp(id) {
    switch (id) {
      case 'snake': SnakeApp.open(); break;
      case 'minesweeper': MinesweeperApp.open(); break;
      case '2048': Game2048App.open(); break;
      case 'sticky-notes': StickyNotesApp.open(); break;
      case 'clock-widget': ClockWidgetApp.open(); break;
      case 'system-monitor': SystemMonitorApp.open(); break;
      default: console.warn('Unknown store app:', id);
    }
  },
  getInstalled() {
    const ids = getInstalledApps();
    return storeApps.filter(app => ids.includes(app.id));
  },
  getStoreAppList() {
    return storeApps.map(app => ({ ...app, installed: isInstalled(app.id) }));
  }
};
