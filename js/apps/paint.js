// Paint Application
const PaintApp = {
  open() {
    const win = WindowManager.createWindow({
      title: 'Paint',
      icon: AppIcons.get('paint'),
      width: 750,
      height: 550,
      minWidth: 500,
      minHeight: 400,
      appId: 'paint'
    });

    const body = win.getBody();

    // State
    let currentTool = 'brush';
    let currentColor = '#000000';
    let brushSize = 4;
    let opacity = 100;
    let undoStack = [];
    let redoStack = [];
    let isDrawing = false;
    let startX = 0, startY = 0;
    let hasContent = false;

    const PRESET_COLORS = [
      '#000000', '#ffffff', '#ff0000', '#ff8c00',
      '#ffff00', '#00ff00', '#008000', '#00ffff',
      '#0000ff', '#800080', '#ff00ff', '#ffb6c1',
      '#8b4513', '#808080', '#404040', '#000080'
    ];

    const TOOLS = [
      { id: 'brush',      icon: brushIcon,      name: 'Brush' },
      { id: 'eraser',     icon: eraserIcon,     name: 'Eraser' },
      { id: 'line',       icon: lineIcon,       name: 'Line' },
      { id: 'rectangle',  icon: rectIcon,       name: 'Rectangle' },
      { id: 'circle',     icon: circleIcon,     name: 'Circle' },
      { id: 'fill',       icon: fillIcon,       name: 'Fill' },
      { id: 'text',       icon: textIcon,       name: 'Text' },
      { id: 'eyedropper', icon: eyedropperIcon, name: 'Eyedropper' }
    ];

    // Build UI
    body.innerHTML = `
      <div class="paint-app">
        <div class="app-menubar">
          <div class="app-menubar-item" data-menu="file">File</div>
        </div>
        <div class="paint-toolbar">
          <div class="paint-tools"></div>
          <div class="separator"></div>
          <div class="paint-colors"></div>
          <div class="paint-active-color" title="Current color"></div>
          <div class="separator"></div>
          <div class="paint-slider-group">
            <span>Size</span>
            <input type="range" min="1" max="50" value="4" class="paint-size-slider">
            <span class="paint-size-val">4</span>
          </div>
          <div class="paint-slider-group">
            <span>Opacity</span>
            <input type="range" min="10" max="100" value="100" class="paint-opacity-slider">
            <span class="paint-opacity-val">100%</span>
          </div>
          <div class="separator"></div>
          <button class="paint-undo-redo-btn paint-undo-btn" title="Undo" disabled>${undoIcon()}</button>
          <button class="paint-undo-redo-btn paint-redo-btn" title="Redo" disabled>${redoIcon()}</button>
        </div>
        <div class="paint-canvas-container">
          <canvas class="paint-canvas"></canvas>
          <canvas class="paint-overlay-canvas"></canvas>
        </div>
        <div class="paint-statusbar">
          <span class="paint-status-size"></span>
          <span class="paint-status-pos">X: 0, Y: 0</span>
          <span class="paint-status-tool">Brush</span>
        </div>
      </div>
    `;

    // Refs
    const canvas = body.querySelector('.paint-canvas');
    const ctx = canvas.getContext('2d');
    const overlay = body.querySelector('.paint-overlay-canvas');
    const overlayCtx = overlay.getContext('2d');
    const container = body.querySelector('.paint-canvas-container');
    const statusSize = body.querySelector('.paint-status-size');
    const statusPos = body.querySelector('.paint-status-pos');
    const statusTool = body.querySelector('.paint-status-tool');
    const undoBtn = body.querySelector('.paint-undo-btn');
    const redoBtn = body.querySelector('.paint-redo-btn');
    const activeColorEl = body.querySelector('.paint-active-color');
    const sizeSlider = body.querySelector('.paint-size-slider');
    const opacitySlider = body.querySelector('.paint-opacity-slider');
    const sizeVal = body.querySelector('.paint-size-val');
    const opacityVal = body.querySelector('.paint-opacity-val');

    // Build tool buttons
    const toolsContainer = body.querySelector('.paint-tools');
    toolsContainer.style.display = 'flex';
    toolsContainer.style.gap = '2px';
    TOOLS.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'paint-tool-btn' + (t.id === currentTool ? ' active' : '');
      btn.innerHTML = t.icon();
      btn.title = t.name;
      btn.dataset.tool = t.id;
      btn.addEventListener('click', () => selectTool(t.id));
      toolsContainer.appendChild(btn);
    });

    // Build color palette
    const colorsContainer = body.querySelector('.paint-colors');
    PRESET_COLORS.forEach(c => {
      const swatch = document.createElement('div');
      swatch.className = 'paint-color-swatch' + (c === currentColor ? ' active' : '');
      swatch.style.background = c;
      swatch.dataset.color = c;
      swatch.addEventListener('click', () => selectColor(c));
      colorsContainer.appendChild(swatch);
    });
    const customInput = document.createElement('input');
    customInput.type = 'color';
    customInput.className = 'paint-custom-color';
    customInput.value = '#ff6600';
    customInput.title = 'Custom color';
    customInput.addEventListener('input', () => selectColor(customInput.value));
    colorsContainer.appendChild(customInput);

    // Init canvas
    function initCanvas() {
      const rect = container.getBoundingClientRect();
      const w = Math.max(100, Math.floor(rect.width - 20));
      const h = Math.max(100, Math.floor(rect.height - 20));
      canvas.width = w;
      canvas.height = h;
      overlay.width = w;
      overlay.height = h;
      overlay.style.width = w + 'px';
      overlay.style.height = h + 'px';
      // Position overlay on top of canvas
      overlay.style.position = 'absolute';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      updateSizeStatus();
    }

    // Use a small delay to let layout settle
    requestAnimationFrame(() => {
      initCanvas();
      saveState(); // initial blank state
    });

    // Resize handling
    const resizeObserver = new ResizeObserver(() => {
      const oldData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const oldW = canvas.width;
      const oldH = canvas.height;
      const rect = container.getBoundingClientRect();
      const w = Math.max(100, Math.floor(rect.width - 20));
      const h = Math.max(100, Math.floor(rect.height - 20));
      canvas.width = w;
      canvas.height = h;
      overlay.width = w;
      overlay.height = h;
      overlay.style.width = w + 'px';
      overlay.style.height = h + 'px';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.putImageData(oldData, 0, 0);
      updateSizeStatus();
    });
    resizeObserver.observe(container);

    // Update active color display
    function updateActiveColor() {
      activeColorEl.style.background = currentColor;
    }
    updateActiveColor();

    function updateSizeStatus() {
      statusSize.textContent = canvas.width + 'x' + canvas.height;
    }

    function selectTool(id) {
      currentTool = id;
      body.querySelectorAll('.paint-tool-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tool === id);
      });
      statusTool.textContent = TOOLS.find(t => t.id === id).name;
      // Update cursor
      if (id === 'eyedropper') {
        canvas.style.cursor = 'crosshair';
      } else if (id === 'fill') {
        canvas.style.cursor = 'crosshair';
      } else if (id === 'text') {
        canvas.style.cursor = 'text';
      } else {
        canvas.style.cursor = 'crosshair';
      }
    }

    function selectColor(c) {
      currentColor = c;
      updateActiveColor();
      body.querySelectorAll('.paint-color-swatch').forEach(s => {
        s.classList.toggle('active', s.dataset.color === c);
      });
    }

    // Sliders
    sizeSlider.addEventListener('input', () => {
      brushSize = parseInt(sizeSlider.value);
      sizeVal.textContent = brushSize;
    });
    opacitySlider.addEventListener('input', () => {
      opacity = parseInt(opacitySlider.value);
      opacityVal.textContent = opacity + '%';
    });

    // Undo/Redo
    function saveState() {
      if (undoStack.length >= 20) undoStack.shift();
      undoStack.push(canvas.toDataURL());
      redoStack = [];
      updateUndoRedoButtons();
      hasContent = true;
    }

    function undo() {
      if (undoStack.length <= 1) return;
      redoStack.push(undoStack.pop());
      restoreState(undoStack[undoStack.length - 1]);
      updateUndoRedoButtons();
    }

    function redo() {
      if (redoStack.length === 0) return;
      const state = redoStack.pop();
      undoStack.push(state);
      restoreState(state);
      updateUndoRedoButtons();
    }

    function restoreState(dataURL) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = dataURL;
    }

    function updateUndoRedoButtons() {
      undoBtn.disabled = undoStack.length <= 1;
      redoBtn.disabled = redoStack.length === 0;
    }

    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);

    // Get mouse position relative to canvas
    function getCanvasPos(e) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: Math.round(e.clientX - rect.left),
        y: Math.round(e.clientY - rect.top)
      };
    }

    // Drawing
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);

    function onMouseDown(e) {
      const pos = getCanvasPos(e);
      isDrawing = true;
      startX = pos.x;
      startY = pos.y;

      if (currentTool === 'brush' || currentTool === 'eraser') {
        saveState();
        ctx.globalAlpha = opacity / 100;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (currentTool === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = currentColor;
        }

        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        // Draw a dot for single click
        ctx.lineTo(pos.x + 0.1, pos.y + 0.1);
        ctx.stroke();
      } else if (currentTool === 'fill') {
        saveState();
        floodFill(pos.x, pos.y, currentColor);
      } else if (currentTool === 'eyedropper') {
        const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
        const hex = '#' + [pixel[0], pixel[1], pixel[2]].map(v => v.toString(16).padStart(2, '0')).join('');
        selectColor(hex);
      } else if (currentTool === 'text') {
        const text = prompt('Enter text:');
        if (text) {
          saveState();
          const fontSize = Math.max(12, brushSize * 3);
          ctx.globalAlpha = opacity / 100;
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = currentColor;
          ctx.font = fontSize + 'px ' + getComputedStyle(body).fontFamily;
          ctx.fillText(text, pos.x, pos.y);
          ctx.globalAlpha = 1;
        }
        isDrawing = false;
      } else if (currentTool === 'line' || currentTool === 'rectangle' || currentTool === 'circle') {
        saveState();
      }
    }

    function onMouseMove(e) {
      const pos = getCanvasPos(e);
      statusPos.textContent = 'X: ' + pos.x + ', Y: ' + pos.y;

      if (!isDrawing) return;

      if (currentTool === 'brush' || currentTool === 'eraser') {
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (currentTool === 'line') {
        drawOverlayPreview(pos, e);
      } else if (currentTool === 'rectangle') {
        drawOverlayPreview(pos, e);
      } else if (currentTool === 'circle') {
        drawOverlayPreview(pos, e);
      }
    }

    function drawOverlayPreview(pos, e) {
      overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
      overlayCtx.globalAlpha = opacity / 100;
      overlayCtx.strokeStyle = currentColor;
      overlayCtx.lineWidth = brushSize;
      overlayCtx.lineCap = 'round';
      overlayCtx.lineJoin = 'round';

      if (currentTool === 'line') {
        overlayCtx.beginPath();
        overlayCtx.moveTo(startX, startY);
        overlayCtx.lineTo(pos.x, pos.y);
        overlayCtx.stroke();
      } else if (currentTool === 'rectangle') {
        let w = pos.x - startX;
        let h = pos.y - startY;
        if (e.shiftKey) {
          const side = Math.max(Math.abs(w), Math.abs(h));
          w = side * Math.sign(w);
          h = side * Math.sign(h);
        }
        overlayCtx.strokeRect(startX, startY, w, h);
      } else if (currentTool === 'circle') {
        const dx = pos.x - startX;
        const dy = pos.y - startY;
        let rx = Math.abs(dx);
        let ry = Math.abs(dy);
        if (e.shiftKey) {
          rx = ry = Math.max(rx, ry);
        }
        overlayCtx.beginPath();
        overlayCtx.ellipse(startX, startY, rx, ry, 0, 0, Math.PI * 2);
        overlayCtx.stroke();
      }
    }

    function onMouseUp(e) {
      if (!isDrawing) return;

      if (currentTool === 'brush' || currentTool === 'eraser') {
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      } else if (currentTool === 'line' || currentTool === 'rectangle' || currentTool === 'circle') {
        // Commit overlay to main canvas
        const pos = getCanvasPos(e);
        overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

        ctx.globalAlpha = opacity / 100;
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalCompositeOperation = 'source-over';

        if (currentTool === 'line') {
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
        } else if (currentTool === 'rectangle') {
          let w = pos.x - startX;
          let h = pos.y - startY;
          if (e.shiftKey) {
            const side = Math.max(Math.abs(w), Math.abs(h));
            w = side * Math.sign(w);
            h = side * Math.sign(h);
          }
          ctx.strokeRect(startX, startY, w, h);
        } else if (currentTool === 'circle') {
          const dx = pos.x - startX;
          const dy = pos.y - startY;
          let rx = Math.abs(dx);
          let ry = Math.abs(dy);
          if (e.shiftKey) {
            rx = ry = Math.max(rx, ry);
          }
          ctx.beginPath();
          ctx.ellipse(startX, startY, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      isDrawing = false;
    }

    // Flood fill (scanline algorithm)
    function floodFill(x, y, fillColor) {
      const w = canvas.width;
      const h = canvas.height;
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;

      // Parse fill color
      const fc = hexToRgb(fillColor);
      const fa = Math.round((opacity / 100) * 255);

      // Target color at clicked pixel
      const idx = (y * w + x) * 4;
      const tr = data[idx], tg = data[idx + 1], tb = data[idx + 2], ta = data[idx + 3];

      // Don't fill if same color
      if (tr === fc.r && tg === fc.g && tb === fc.b && ta === fa) return;

      const tolerance = 30;

      function matches(i) {
        return Math.abs(data[i] - tr) <= tolerance &&
               Math.abs(data[i + 1] - tg) <= tolerance &&
               Math.abs(data[i + 2] - tb) <= tolerance &&
               Math.abs(data[i + 3] - ta) <= tolerance;
      }

      function setPixel(i) {
        data[i] = fc.r;
        data[i + 1] = fc.g;
        data[i + 2] = fc.b;
        data[i + 3] = fa;
      }

      const stack = [[x, y]];
      const visited = new Uint8Array(w * h);

      while (stack.length > 0) {
        let [cx, cy] = stack.pop();
        let pi = cy * w + cx;

        if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
        if (visited[pi]) continue;

        let ci = pi * 4;
        if (!matches(ci)) continue;

        // Scan left
        let left = cx;
        while (left > 0 && matches(((cy * w) + left - 1) * 4) && !visited[cy * w + left - 1]) {
          left--;
        }

        // Scan right
        let right = cx;
        while (right < w - 1 && matches(((cy * w) + right + 1) * 4) && !visited[cy * w + right + 1]) {
          right++;
        }

        // Fill the line and check above/below
        for (let i = left; i <= right; i++) {
          const idx = cy * w + i;
          if (visited[idx]) continue;
          visited[idx] = 1;
          setPixel(idx * 4);

          if (cy > 0 && !visited[(cy - 1) * w + i] && matches(((cy - 1) * w + i) * 4)) {
            stack.push([i, cy - 1]);
          }
          if (cy < h - 1 && !visited[(cy + 1) * w + i] && matches(((cy + 1) * w + i) * 4)) {
            stack.push([i, cy + 1]);
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
    }

    function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    }

    // File menu
    body.querySelector('[data-menu="file"]').addEventListener('click', (e) => {
      const rect = e.target.getBoundingClientRect();
      ContextMenu.show(rect.left, rect.bottom, [
        { label: 'New', shortcut: 'Ctrl+N', action: newCanvas },
        { separator: true },
        { label: 'Save', shortcut: 'Ctrl+S', action: saveFile },
        { label: 'Save As...', action: saveFileAs }
      ]);
    });

    function newCanvas() {
      if (hasContent) {
        if (!confirm('Create a new canvas? Unsaved changes will be lost.')) return;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      undoStack = [];
      redoStack = [];
      hasContent = false;
      saveState();
    }

    function saveFile() {
      const dataURL = canvas.toDataURL('image/png');
      FileSystem.writeFile('/Pictures/painting.png', dataURL);
    }

    function saveFileAs() {
      const name = prompt('Save as:', 'painting.png');
      if (!name) return;
      const dataURL = canvas.toDataURL('image/png');
      FileSystem.writeFile('/Pictures/' + name, dataURL);
    }

    // Keyboard shortcuts
    body.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); saveFile(); }
      if (e.ctrlKey && e.key === 'n') { e.preventDefault(); newCanvas(); }
    });

    // Tool SVG icon helpers
    function brushIcon() {
      return '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.5 1.5l4 4-8 8H2.5v-4l8-8z"/><path d="M8.5 3.5l4 4"/></svg>';
    }
    function eraserIcon() {
      return '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 14h8M3.5 11.5l7-7 3 3-7 7h-3v-3z"/></svg>';
    }
    function lineIcon() {
      return '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="2" y1="14" x2="14" y2="2"/></svg>';
    }
    function rectIcon() {
      return '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="12" height="10" rx="1"/></svg>';
    }
    function circleIcon() {
      return '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/></svg>';
    }
    function fillIcon() {
      return '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12l5-10 5 10H2z"/><path d="M13 10c0 1.5-1 3-1 3s-1-1.5-1-3a1 1 0 012 0z" fill="currentColor"/></svg>';
    }
    function textIcon() {
      return '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3h10M8 3v10M5 13h6"/></svg>';
    }
    function eyedropperIcon() {
      return '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 3a2 2 0 00-3 0L4 9l-1 4 4-1 6-6a2 2 0 000-3z"/></svg>';
    }
    function undoIcon() {
      return '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7h7a3 3 0 010 6H8"/><path d="M6 4L3 7l3 3"/></svg>';
    }
    function redoIcon() {
      return '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 7H6a3 3 0 000 6h2"/><path d="M10 4l3 3-3 3"/></svg>';
    }
  }
};
