// Image Viewer Application
const ImageViewerApp = {
  open(filePath) {
    const content = filePath ? FileSystem.readFile(filePath) : null;
    const title = filePath ? FileSystem.getFileName(filePath) : 'Image Viewer';
    let zoom = 100;

    const win = WindowManager.createWindow({
      title: 'Image Viewer - ' + title,
      icon: AppIcons.get('image-viewer'),
      width: 550,
      height: 450,
      minWidth: 300,
      minHeight: 250,
      appId: 'image-viewer'
    });

    const body = win.getBody();
    body.innerHTML = `
      <div class="image-viewer">
        <div class="app-toolbar">
          <button class="zoom-in" title="Zoom In">🔍+</button>
          <button class="zoom-out" title="Zoom Out">🔍-</button>
          <button class="zoom-fit" title="Fit to Window">Fit</button>
          <button class="zoom-reset" title="Reset Zoom">100%</button>
        </div>
        <div class="iv-content">
          ${content ? content : '<div style="color:var(--text-muted);">No image loaded</div>'}
        </div>
        <div class="app-statusbar">
          <span class="iv-zoom-level">Zoom: 100%</span>
        </div>
      </div>
    `;

    const ivContent = body.querySelector('.iv-content');
    const zoomLabel = body.querySelector('.iv-zoom-level');
    const svgEl = ivContent.querySelector('svg');

    function updateZoom() {
      if (svgEl) {
        svgEl.style.transform = `scale(${zoom / 100})`;
      }
      zoomLabel.textContent = `Zoom: ${zoom}%`;
    }

    body.querySelector('.zoom-in').addEventListener('click', () => { zoom = Math.min(400, zoom + 25); updateZoom(); });
    body.querySelector('.zoom-out').addEventListener('click', () => { zoom = Math.max(25, zoom - 25); updateZoom(); });
    body.querySelector('.zoom-fit').addEventListener('click', () => { zoom = 100; updateZoom(); });
    body.querySelector('.zoom-reset').addEventListener('click', () => { zoom = 100; updateZoom(); });
  }
};
