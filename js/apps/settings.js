// Settings Application
const SettingsApp = {
  open() {
    const win = WindowManager.createWindow({
      title: 'Settings',
      icon: AppIcons.get('settings'),
      width: 620,
      height: 480,
      minWidth: 450,
      minHeight: 350,
      appId: 'settings'
    });

    let activeTab = 'appearance';
    const body = win.getBody();

    const wallpapers = Desktop.getWallpapers();
    const accents = [
      { name: 'Blue', value: '#89b4fa' },
      { name: 'Green', value: '#a6e3a1' },
      { name: 'Purple', value: '#cba6f7' },
      { name: 'Pink', value: '#f5c2e7' },
      { name: 'Orange', value: '#fab387' },
      { name: 'Red', value: '#f38ba8' }
    ];
    const avatarOptions = ['user', 'cat', 'robot', 'alien', 'skull', 'star'];

    function render() {
      const currentWp = parseInt(localStorage.getItem('minios_wallpaper') || '0');
      const currentAccent = localStorage.getItem('minios_accent') || '#89b4fa';
      const is24h = localStorage.getItem('minios_24h') === 'true';
      const username = localStorage.getItem('minios_username') || 'User';
      const currentAvatar = localStorage.getItem('minios_avatar') || 'user';
      const hasPassword = !!localStorage.getItem('minios_password');

      body.innerHTML = `
        <div class="settings-app">
          <div class="settings-sidebar">
            <div class="settings-tab${activeTab === 'appearance' ? ' active' : ''}" data-tab="appearance">
              ${AppIcons.getSmall('settings')} Appearance
            </div>
            <div class="settings-tab${activeTab === 'accounts' ? ' active' : ''}" data-tab="accounts">
              ${AppIcons.getSmall('settings')} Accounts
            </div>
            <div class="settings-tab${activeTab === 'personalization' ? ' active' : ''}" data-tab="personalization">
              ${AppIcons.getSmall('settings')} Personal
            </div>
            <div class="settings-tab${activeTab === 'about' ? ' active' : ''}" data-tab="about">
              ${AppIcons.getSmall('settings')} About
            </div>
          </div>
          <div class="settings-content">
            ${activeTab === 'appearance' ? `
              <div class="settings-section">
                <h3>Wallpaper</h3>
                <div class="wallpaper-grid">
                  ${wallpapers.map((wp, i) => `
                    <div class="wallpaper-option${i === currentWp ? ' active' : ''}" data-wp="${i}" style="background:${wp}"></div>
                  `).join('')}
                </div>
              </div>
              <div class="settings-section">
                <h3>Accent Color</h3>
                <div class="color-grid">
                  ${accents.map(a => `
                    <div class="color-option${a.value === currentAccent ? ' active' : ''}" data-color="${a.value}" style="background:${a.value}" title="${a.name}"></div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            ${activeTab === 'accounts' ? `
              <div class="settings-section">
                <h3>Avatar</h3>
                <div class="color-grid" style="gap:10px;">
                  ${avatarOptions.map(av => `
                    <div class="avatar-option${av === currentAvatar ? ' active' : ''}" data-avatar="${av}" style="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.06);border:2px solid ${av === currentAvatar ? 'var(--accent)' : 'transparent'};cursor:pointer;display:flex;align-items:center;justify-content:center;overflow:hidden;transition:border-color 0.15s,transform 0.1s;" title="${av}">
                      ${Login.getAvatarSVG(av).replace('<svg ', '<svg width="32" height="32" ')}
                    </div>
                  `).join('')}
                </div>
              </div>
              <div class="settings-section">
                <h3>Username</h3>
                <input class="file-picker-input username-input" type="text" value="${username}" maxlength="20" style="max-width:240px;">
              </div>
              <div class="settings-section">
                <h3>Password</h3>
                <p style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">${hasPassword ? 'Password is set. Leave blank to remove.' : 'No password set. Enter one to enable lock screen protection.'}</p>
                <div style="display:flex;gap:8px;align-items:center;">
                  <input class="file-picker-input password-input" type="password" placeholder="${hasPassword ? 'New password (blank to remove)' : 'Set password'}" style="max-width:200px;">
                  <button class="save-password-btn" style="padding:6px 14px;background:var(--accent);border:none;border-radius:5px;color:#000;font-weight:600;cursor:pointer;font-family:var(--font-ui);font-size:12px;">Save</button>
                </div>
              </div>
            ` : ''}
            ${activeTab === 'personalization' ? `
              <div class="settings-section">
                <h3>Clock</h3>
                <div class="settings-toggle">
                  <span>24-hour format</span>
                  <button class="toggle-switch${is24h ? ' on' : ''}" data-setting="24h"></button>
                </div>
              </div>
            ` : ''}
            ${activeTab === 'about' ? `
              <div class="settings-section">
                <h3>About MiniOS</h3>
                <div class="settings-info">
                  <strong>MiniOS</strong> v2.0<br><br>
                  Built with vanilla HTML, CSS, and JavaScript.<br>
                  Zero dependencies. Zero libraries. Zero frameworks.<br><br>
                  <strong>Resolution:</strong> ${window.innerWidth} × ${window.innerHeight}<br>
                  <strong>Browser:</strong> ${navigator.userAgent.split(') ').pop()}<br>
                  <strong>Uptime:</strong> ${Math.floor(Boot.getUptime() / 60)}m ${Boot.getUptime() % 60}s<br>
                  <strong>Virtual Desktops:</strong> ${typeof VirtualDesktops !== 'undefined' ? VirtualDesktops.getAll().length : 1}<br><br>
                  <a href="https://github.com/0xMortuEx" target="_blank" style="color:var(--accent);text-decoration:none;">GitHub</a>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      `;

      // Tab switching
      body.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', () => { activeTab = tab.dataset.tab; render(); });
      });

      // Wallpaper selection
      body.querySelectorAll('.wallpaper-option').forEach(wp => {
        wp.addEventListener('click', () => {
          Desktop.setWallpaper(parseInt(wp.dataset.wp));
          render();
        });
      });

      // Accent color
      body.querySelectorAll('.color-option').forEach(co => {
        co.addEventListener('click', () => {
          localStorage.setItem('minios_accent', co.dataset.color);
          document.documentElement.style.setProperty('--accent', co.dataset.color);
          render();
        });
      });

      // Avatar selection
      body.querySelectorAll('.avatar-option').forEach(av => {
        av.addEventListener('click', () => {
          localStorage.setItem('minios_avatar', av.dataset.avatar);
          Taskbar.refreshUsername();
          render();
        });
        av.addEventListener('mouseenter', () => { av.style.transform = 'scale(1.1)'; });
        av.addEventListener('mouseleave', () => { av.style.transform = ''; });
      });

      // Toggle switches
      body.querySelectorAll('.toggle-switch').forEach(sw => {
        sw.addEventListener('click', () => {
          const setting = sw.dataset.setting;
          if (setting === '24h') {
            const val = localStorage.getItem('minios_24h') !== 'true';
            localStorage.setItem('minios_24h', val);
            sw.classList.toggle('on', val);
          }
        });
      });

      // Username
      const usernameInput = body.querySelector('.username-input');
      if (usernameInput) {
        usernameInput.addEventListener('change', () => {
          localStorage.setItem('minios_username', usernameInput.value || 'User');
          Taskbar.refreshUsername();
        });
      }

      // Password
      const savePassBtn = body.querySelector('.save-password-btn');
      if (savePassBtn) {
        savePassBtn.addEventListener('click', () => {
          const passInput = body.querySelector('.password-input');
          const val = passInput.value;
          if (val) {
            localStorage.setItem('minios_password', val);
          } else {
            localStorage.removeItem('minios_password');
          }
          render();
        });
      }
    }

    render();
  }
};
