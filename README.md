# MiniOS — A Desktop OS in Your Browser

A fully functional desktop operating system simulation with draggable windows, a taskbar, working apps, a virtual file system, and keyboard shortcuts. Zero dependencies — pure vanilla HTML, CSS, and JavaScript.

![MiniOS Screenshot](https://img.shields.io/badge/MiniOS-v1.0-89b4fa?style=for-the-badge)

## Features

- **Boot Animation** — Realistic boot sequence with kernel messages and fade transitions
- **Window Manager** — Draggable, resizable windows with minimize/maximize/close, snap-to-edge, and z-order management
- **Taskbar** — Frosted glass taskbar with start menu, system tray, and clock
- **Start Menu** — Searchable app launcher with pinned apps and power options
- **Alt+Tab** — Window switcher overlay for fast app switching
- **Virtual File System** — Full filesystem in localStorage with folders, files, and persistence
- **Context Menus** — Right-click menus for desktop, files, and taskbar
- **Keyboard Shortcuts** — Alt+Tab, Alt+F4, Ctrl+D (show desktop), and more

### 8 Built-in Applications

| App | Description |
|-----|-------------|
| **Notepad** | Text editor with open/save, menu bar, keyboard shortcuts |
| **Calculator** | Standard calculator with keyboard support and history |
| **Terminal** | Command-line shell with 15+ commands, tab completion, history |
| **File Explorer** | Browse files with grid/list view, breadcrumbs, sidebar |
| **Image Viewer** | View SVG images with zoom controls |
| **Settings** | Wallpaper picker, accent colors, clock format, username |
| **Browser** | Mini web browser with address bar and bookmarks |
| **Music Player** | Web Audio API synth player with visualizer |

## How to Use

Visit the live demo or clone and open `index.html`:

```bash
git clone https://github.com/0xMortuEx/MiniOS.git
cd MiniOS
# Open index.html in your browser — no build step needed
```

## Live Demo

[https://0xmortuex.github.io/MiniOS/](https://0xmortuex.github.io/MiniOS/)

## Tech Stack

**Vanilla HTML, CSS, JavaScript — zero frameworks, zero libraries, zero dependencies.**

- All state managed in memory + localStorage for persistence
- Web Audio API for music player synthesis
- All icons are inline SVGs — no image files
- Wallpapers are pure CSS gradients
- Fully offline-capable

## License

MIT
