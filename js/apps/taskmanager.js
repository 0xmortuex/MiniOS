const TaskManagerApp = {
  open() {
    const win = WindowManager.createWindow({
      title: 'Task Manager',
      icon: AppIcons.get('task-manager'),
      width: 550,
      height: 420,
      minWidth: 450,
      minHeight: 350,
      appId: 'task-manager'
    });
    const body = win.getBody();

    const APP_STATS = {
      'notepad':        { cpu: 0.1, mem: 12 },
      'calculator':     { cpu: 0.1, mem: 8 },
      'terminal':       { cpu: 0.3, mem: 28 },
      'file-explorer':  { cpu: 0.5, mem: 45 },
      'browser':        { cpu: 1.2, mem: 120 },
      'settings':       { cpu: 0.2, mem: 18 },
      'music-player':   { cpu: 0.4, mem: 35 },
      'image-viewer':   { cpu: 0.3, mem: 22 },
      'paint':          { cpu: 0.6, mem: 55 },
      'task-manager':   { cpu: 0.2, mem: 15 }
    };
    const DEFAULT_STATS = { cpu: 0.2, mem: 20 };
    const TOTAL_MEMORY = 512;

    let activeTab = 'processes';
    let selectedPid = null;
    let pidCounter = 100;
    let pidMap = new Map();
    let cpuHistory = new Array(60).fill(0);
    let currentProcesses = [];
    let sortColumn = 'pid';
    let sortAsc = true;

    // Build the UI shell
    body.style.cssText = 'display:flex;flex-direction:column;height:100%;overflow:hidden;user-select:none;';
    body.innerHTML = `
      <div class="tm-tabbar" style="display:flex;background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.06);flex-shrink:0;">
        <button class="tm-tab active" data-tab="processes" style="flex:1;padding:8px 0;border:none;background:none;color:var(--text);cursor:pointer;font-size:12px;border-bottom:2px solid var(--accent);outline:none;">Processes</button>
        <button class="tm-tab" data-tab="performance" style="flex:1;padding:8px 0;border:none;background:none;color:var(--text-muted);cursor:pointer;font-size:12px;border-bottom:2px solid transparent;outline:none;">Performance</button>
        <button class="tm-tab" data-tab="details" style="flex:1;padding:8px 0;border:none;background:none;color:var(--text-muted);cursor:pointer;font-size:12px;border-bottom:2px solid transparent;outline:none;">Details</button>
      </div>
      <div class="tm-content" style="flex:1;overflow:auto;"></div>
    `;

    const tabBar = body.querySelector('.tm-tabbar');
    const content = body.querySelector('.tm-content');
    const tabs = body.querySelectorAll('.tm-tab');

    tabBar.addEventListener('click', (e) => {
      const tab = e.target.closest('.tm-tab');
      if (!tab) return;
      activeTab = tab.dataset.tab;
      selectedPid = null;
      tabs.forEach(t => {
        t.classList.remove('active');
        t.style.borderBottom = '2px solid transparent';
        t.style.color = 'var(--text-muted)';
      });
      tab.classList.add('active');
      tab.style.borderBottom = '2px solid var(--accent)';
      tab.style.color = 'var(--text)';
      render();
    });

    function getPid(windowId) {
      if (!pidMap.has(windowId)) {
        pidMap.set(windowId, pidCounter++);
      }
      return pidMap.get(windowId);
    }

    function fluctuate(base, range) {
      return base + (Math.random() * 2 - 1) * range;
    }

    function gatherProcesses() {
      const windows = WindowManager.getWindows();
      const procs = [];

      // System process
      procs.push({
        pid: 1,
        name: 'MiniOS Shell',
        appId: 'system',
        status: 'Running',
        cpu: parseFloat(fluctuate(0.8, 0.1).toFixed(1)),
        mem: Math.round(fluctuate(64, 2)),
        windowTitle: 'MiniOS Shell',
        windowId: null,
        isSystem: true
      });

      windows.forEach(w => {
        const stats = APP_STATS[w.appId] || DEFAULT_STATS;
        const pid = getPid(w.id);
        procs.push({
          pid,
          name: w.title || w.appId || 'Unknown',
          appId: w.appId || 'unknown',
          status: w.minimized ? 'Suspended' : 'Running',
          cpu: parseFloat(fluctuate(stats.cpu, 0.1).toFixed(1)),
          mem: Math.round(fluctuate(stats.mem, 2)),
          windowTitle: w.title || '',
          windowId: w.id,
          isSystem: false
        });
      });

      currentProcesses = procs;
      return procs;
    }

    function updateCpuHistory() {
      const totalCpu = currentProcesses.reduce((s, p) => s + p.cpu, 0);
      cpuHistory.push(parseFloat(totalCpu.toFixed(1)));
      if (cpuHistory.length > 60) cpuHistory.shift();
    }

    function formatUptime(seconds) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      return `${h}h ${m}m ${s}s`;
    }

    // ---- Renderers ----

    function renderProcesses() {
      const procs = currentProcesses;
      const rows = procs.map(p => {
        const sel = p.pid === selectedPid;
        const bg = sel ? 'background:var(--selection);' : '';
        return `<tr data-pid="${p.pid}" style="${bg}cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.04);">
          <td style="padding:4px 8px;">${p.name}</td>
          <td style="padding:4px 8px;color:${p.status === 'Suspended' ? 'var(--text-muted)' : 'inherit'}">${p.status}</td>
          <td style="padding:4px 8px;text-align:right;">${Math.max(0, p.cpu).toFixed(1)}%</td>
          <td style="padding:4px 8px;text-align:right;">${Math.max(0, p.mem)} MB</td>
          <td style="padding:4px 8px;text-align:right;">${p.pid}</td>
        </tr>`;
      }).join('');

      const isOwnSelected = currentProcesses.find(p => p.pid === selectedPid && (p.appId === 'task-manager' || p.isSystem));
      const endDisabled = selectedPid === null || isOwnSelected;

      content.innerHTML = `
        <div style="display:flex;flex-direction:column;height:100%;">
          <div style="flex:1;overflow:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
              <thead>
                <tr style="color:var(--text-muted);border-bottom:1px solid rgba(255,255,255,0.08);position:sticky;top:0;background:var(--surface,#1e1e2e);">
                  <th style="text-align:left;padding:6px 8px;font-weight:500;">App Name</th>
                  <th style="text-align:left;padding:6px 8px;font-weight:500;">Status</th>
                  <th style="text-align:right;padding:6px 8px;font-weight:500;">CPU %</th>
                  <th style="text-align:right;padding:6px 8px;font-weight:500;">Memory</th>
                  <th style="text-align:right;padding:6px 8px;font-weight:500;">PID</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <div style="display:flex;justify-content:flex-end;padding:8px;border-top:1px solid rgba(255,255,255,0.06);flex-shrink:0;">
            <button class="tm-endtask" style="padding:6px 16px;border:none;border-radius:4px;background:rgba(230,69,83,0.15);color:#e64553;cursor:pointer;font-size:12px;opacity:${endDisabled ? '0.4' : '1'};pointer-events:${endDisabled ? 'none' : 'auto'};" ${endDisabled ? 'disabled' : ''}>End Task</button>
          </div>
        </div>
      `;

      content.querySelectorAll('tbody tr').forEach(row => {
        row.addEventListener('click', () => {
          selectedPid = parseInt(row.dataset.pid);
          render();
        });
      });

      const endBtn = content.querySelector('.tm-endtask');
      if (endBtn) {
        endBtn.addEventListener('click', () => {
          if (selectedPid === null) return;
          const proc = currentProcesses.find(p => p.pid === selectedPid);
          if (!proc || proc.isSystem || proc.appId === 'task-manager') return;
          if (proc.windowId != null) {
            WindowManager.closeById(proc.windowId);
          }
          selectedPid = null;
          gatherProcesses();
          render();
        });
      }
    }

    function renderPerformance() {
      const totalCpu = currentProcesses.reduce((s, p) => s + p.cpu, 0).toFixed(1);
      const totalMem = currentProcesses.reduce((s, p) => s + p.mem, 0);
      const memPercent = Math.min(100, (totalMem / TOTAL_MEMORY) * 100);
      const uptime = typeof Boot !== 'undefined' && Boot.getUptime ? Boot.getUptime() : 0;

      // Build SVG chart
      const w = 100; // percentage width
      const h = 120;
      const maxVal = 100;
      const points = cpuHistory.map((v, i) => {
        const x = (i / 59) * 100;
        const y = h - (Math.min(v, maxVal) / maxVal) * h;
        return `${x},${y}`;
      });
      const polylinePoints = points.join(' ');
      const polygonPoints = `0,${h} ${polylinePoints} 100,${h}`;

      content.innerHTML = `
        <div style="padding:16px;font-size:12px;overflow:auto;height:100%;box-sizing:border-box;">
          <div style="margin-bottom:16px;">
            <div style="color:var(--text-muted);margin-bottom:4px;">CPU Usage</div>
            <div style="font-size:32px;font-weight:600;margin-bottom:8px;">${totalCpu}<span style="font-size:14px;color:var(--text-muted);"> %</span></div>
            <div style="background:rgba(0,0,0,0.2);border-radius:6px;overflow:hidden;position:relative;">
              <svg viewBox="0 0 100 ${h}" preserveAspectRatio="none" style="width:100%;height:${h}px;display:block;">
                <polygon points="${polygonPoints}" fill="var(--accent)" opacity="0.15"/>
                <polyline points="${polylinePoints}" fill="none" stroke="var(--accent)" stroke-width="1.5" vector-effect="non-scaling-stroke"/>
              </svg>
            </div>
          </div>
          <div style="margin-bottom:16px;">
            <div style="color:var(--text-muted);margin-bottom:6px;">Memory</div>
            <div style="background:rgba(255,255,255,0.06);border-radius:4px;height:20px;overflow:hidden;position:relative;">
              <div style="background:var(--accent);height:100%;width:${memPercent}%;border-radius:4px;transition:width 0.3s;"></div>
            </div>
            <div style="margin-top:4px;color:var(--text-muted);">${totalMem} MB / ${TOTAL_MEMORY} MB</div>
          </div>
          <div>
            <div style="color:var(--text-muted);margin-bottom:4px;">Uptime</div>
            <div style="font-size:18px;font-weight:500;">${formatUptime(uptime)}</div>
          </div>
        </div>
      `;
    }

    function renderDetails() {
      const procs = [...currentProcesses];

      procs.sort((a, b) => {
        let va = a[sortColumn];
        let vb = b[sortColumn];
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return sortAsc ? -1 : 1;
        if (va > vb) return sortAsc ? 1 : -1;
        return 0;
      });

      const arrow = (col) => sortColumn === col ? (sortAsc ? ' ▲' : ' ▼') : '';

      const cols = [
        { key: 'pid', label: 'PID', align: 'right' },
        { key: 'name', label: 'Name', align: 'left' },
        { key: 'status', label: 'Status', align: 'left' },
        { key: 'cpu', label: 'CPU %', align: 'right' },
        { key: 'mem', label: 'Memory', align: 'right' },
        { key: 'windowTitle', label: 'Window Title', align: 'left' }
      ];

      const headerCells = cols.map(c =>
        `<th data-col="${c.key}" style="text-align:${c.align};padding:6px 8px;font-weight:500;cursor:pointer;white-space:nowrap;">${c.label}${arrow(c.key)}</th>`
      ).join('');

      const rows = procs.map(p => {
        const sel = p.pid === selectedPid;
        const bg = sel ? 'background:var(--selection);' : '';
        return `<tr data-pid="${p.pid}" style="${bg}cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.04);">
          <td style="padding:4px 8px;text-align:right;">${p.pid}</td>
          <td style="padding:4px 8px;">${p.name}</td>
          <td style="padding:4px 8px;color:${p.status === 'Suspended' ? 'var(--text-muted)' : 'inherit'}">${p.status}</td>
          <td style="padding:4px 8px;text-align:right;">${Math.max(0, p.cpu).toFixed(1)}%</td>
          <td style="padding:4px 8px;text-align:right;">${Math.max(0, p.mem)} MB</td>
          <td style="padding:4px 8px;color:var(--text-muted);max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.windowTitle}</td>
        </tr>`;
      }).join('');

      content.innerHTML = `
        <div style="height:100%;overflow:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead>
              <tr style="color:var(--text-muted);border-bottom:1px solid rgba(255,255,255,0.08);position:sticky;top:0;background:var(--surface,#1e1e2e);">
                ${headerCells}
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;

      content.querySelectorAll('thead th').forEach(th => {
        th.addEventListener('click', () => {
          const col = th.dataset.col;
          if (sortColumn === col) {
            sortAsc = !sortAsc;
          } else {
            sortColumn = col;
            sortAsc = true;
          }
          render();
        });
      });

      content.querySelectorAll('tbody tr').forEach(row => {
        row.addEventListener('click', () => {
          selectedPid = parseInt(row.dataset.pid);
          render();
        });
      });
    }

    function render() {
      if (activeTab === 'processes') renderProcesses();
      else if (activeTab === 'performance') renderPerformance();
      else if (activeTab === 'details') renderDetails();
    }

    function tick() {
      gatherProcesses();
      updateCpuHistory();
      render();
    }

    // Initial render
    tick();

    // Update every 2 seconds
    const intervalId = setInterval(tick, 2000);

    win.onClose = () => {
      clearInterval(intervalId);
    };
  }
};
