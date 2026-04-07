// Browser Application
const BrowserApp = {
  open() {
    const win = WindowManager.createWindow({
      title: 'Browser',
      icon: AppIcons.get('browser'),
      width: 750,
      height: 500,
      minWidth: 400,
      minHeight: 300,
      appId: 'browser'
    });

    let currentUrl = '';
    const body = win.getBody();

    const homePageHtml = `
      <div class="browser-home">
        <h1>MiniOS Browser</h1>
        <p>A minimal browser for your mini OS</p>
        <div style="margin-top:20px;">
          <a href="#" data-url="https://github.com">GitHub</a>
          <a href="#" data-url="https://wikipedia.org">Wikipedia</a>
          <a href="#" data-url="https://example.com">Example.com</a>
        </div>
        <p style="margin-top:40px;font-size:12px;color:var(--text-muted);">
          Note: Many sites block iframe embedding. This is expected behavior.
        </p>
      </div>
    `;

    body.innerHTML = `
      <div class="browser-app">
        <div class="browser-toolbar">
          <button class="browser-back" title="Back">&larr;</button>
          <button class="browser-forward" title="Forward">&rarr;</button>
          <button class="browser-refresh" title="Refresh">⟳</button>
          <button class="browser-home-btn" title="Home">⌂</button>
          <input class="browser-address" type="text" placeholder="Enter URL..." value="">
        </div>
        <div class="browser-bookmarks">
          <button class="browser-bookmark" data-url="https://github.com">GitHub</button>
          <button class="browser-bookmark" data-url="https://wikipedia.org">Wikipedia</button>
          <button class="browser-bookmark" data-url="https://example.com">Example</button>
        </div>
        <div class="browser-content">
          ${homePageHtml}
        </div>
      </div>
    `;

    const addressBar = body.querySelector('.browser-address');
    const content = body.querySelector('.browser-content');

    function navigate(url) {
      if (!url) return;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      currentUrl = url;
      addressBar.value = url;
      content.innerHTML = `<iframe src="${url}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>`;
      win.setTitle('Browser - ' + url);
    }

    function goHome() {
      currentUrl = '';
      addressBar.value = '';
      content.innerHTML = homePageHtml;
      win.setTitle('Browser');
      setupHomeLinks();
    }

    function setupHomeLinks() {
      content.querySelectorAll('[data-url]').forEach(link => {
        link.addEventListener('click', (e) => { e.preventDefault(); navigate(link.dataset.url); });
      });
    }

    // Address bar enter
    addressBar.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        navigate(addressBar.value.trim());
      }
      e.stopPropagation();
    });

    // Toolbar buttons
    body.querySelector('.browser-back').addEventListener('click', () => { if (content.querySelector('iframe')) window.history.back(); });
    body.querySelector('.browser-forward').addEventListener('click', () => { if (content.querySelector('iframe')) window.history.forward(); });
    body.querySelector('.browser-refresh').addEventListener('click', () => { if (currentUrl) navigate(currentUrl); });
    body.querySelector('.browser-home-btn').addEventListener('click', goHome);

    // Bookmarks
    body.querySelectorAll('.browser-bookmark').forEach(bm => {
      bm.addEventListener('click', () => navigate(bm.dataset.url));
    });

    setupHomeLinks();
  }
};
