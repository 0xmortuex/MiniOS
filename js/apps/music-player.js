// Music Player Application - Web Audio API synth
const MusicPlayerApp = {
  open() {
    const win = WindowManager.createWindow({
      title: 'Music Player',
      icon: AppIcons.get('music-player'),
      width: 340,
      height: 420,
      minWidth: 280,
      minHeight: 380,
      appId: 'music-player'
    });

    let audioCtx = null;
    let isPlaying = false;
    let currentSong = 0;
    let currentNote = 0;
    let playInterval = null;
    let volume = 0.3;

    const songs = [
      {
        title: 'Sunrise',
        artist: 'MiniOS Synth',
        notes: [261, 293, 329, 349, 392, 440, 493, 523, 493, 440, 392, 349, 329, 293, 261],
        duration: 300,
        type: 'sine'
      },
      {
        title: 'Rain',
        artist: 'MiniOS Ambient',
        notes: [196, 220, 261, 196, 329, 261, 220, 196, 293, 261, 349, 293, 220, 196, 261, 329],
        duration: 400,
        type: 'triangle'
      },
      {
        title: 'Pulse',
        artist: 'MiniOS Electronic',
        notes: [130, 130, 196, 130, 261, 196, 130, 130, 165, 165, 220, 165, 261, 220, 165, 165],
        duration: 200,
        type: 'square'
      }
    ];

    const body = win.getBody();
    body.innerHTML = `
      <div class="music-player">
        <div class="mp-display">
          <div class="mp-visualizer">
            ${Array(8).fill(0).map(() => '<div class="mp-bar" style="height:4px;"></div>').join('')}
          </div>
          <div class="mp-song-title">${songs[0].title}</div>
          <div class="mp-artist">${songs[0].artist}</div>
        </div>
        <div class="mp-progress">
          <div class="mp-progress-fill" style="width:0%"></div>
        </div>
        <div class="mp-controls">
          <button class="prev-btn" title="Previous">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
          <button class="play-btn" title="Play">
            <svg width="24" height="24" viewBox="0 0 24 24" class="play-icon"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            <svg width="24" height="24" viewBox="0 0 24 24" class="pause-icon" style="display:none"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          </button>
          <button class="next-btn" title="Next">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </button>
        </div>
        <div class="mp-volume">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3z"/></svg>
          <input type="range" min="0" max="100" value="30" class="volume-slider">
          <span class="volume-label" style="font-size:11px;color:var(--text-muted);width:30px;">30%</span>
        </div>
      </div>
    `;

    const bars = body.querySelectorAll('.mp-bar');
    const progressFill = body.querySelector('.mp-progress-fill');
    const songTitle = body.querySelector('.mp-song-title');
    const songArtist = body.querySelector('.mp-artist');
    const playIcon = body.querySelector('.play-icon');
    const pauseIcon = body.querySelector('.pause-icon');
    const volumeSlider = body.querySelector('.volume-slider');
    const volumeLabel = body.querySelector('.volume-label');

    function initAudio() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
    }

    function playNote(freq, type, dur) {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = volume * 0.5;
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur / 1000);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur / 1000);

      // Update visualizer
      bars.forEach((bar, i) => {
        const h = Math.max(4, Math.random() * 60 + (freq / 10) * (1 - i * 0.1));
        bar.style.height = h + 'px';
        bar.style.background = `var(--accent)`;
      });
    }

    function play() {
      initAudio();
      isPlaying = true;
      playIcon.style.display = 'none';
      pauseIcon.style.display = '';
      currentNote = 0;

      const song = songs[currentSong];
      playInterval = setInterval(() => {
        if (currentNote >= song.notes.length) {
          // Loop
          currentNote = 0;
        }
        playNote(song.notes[currentNote], song.type, song.duration);
        progressFill.style.width = ((currentNote + 1) / song.notes.length * 100) + '%';
        currentNote++;
      }, song.duration);
    }

    function pause() {
      isPlaying = false;
      playIcon.style.display = '';
      pauseIcon.style.display = 'none';
      if (playInterval) clearInterval(playInterval);
      bars.forEach(bar => { bar.style.height = '4px'; });
    }

    function switchSong(idx) {
      const wasPlaying = isPlaying;
      pause();
      currentSong = ((idx % songs.length) + songs.length) % songs.length;
      currentNote = 0;
      progressFill.style.width = '0%';
      songTitle.textContent = songs[currentSong].title;
      songArtist.textContent = songs[currentSong].artist;
      if (wasPlaying) play();
    }

    body.querySelector('.play-btn').addEventListener('click', () => {
      if (isPlaying) pause(); else play();
    });
    body.querySelector('.prev-btn').addEventListener('click', () => switchSong(currentSong - 1));
    body.querySelector('.next-btn').addEventListener('click', () => switchSong(currentSong + 1));

    volumeSlider.addEventListener('input', () => {
      volume = volumeSlider.value / 100;
      volumeLabel.textContent = volumeSlider.value + '%';
    });

    // Cleanup on window close
    win.el.addEventListener('DOMNodeRemovedFromDocument', () => {
      pause();
      if (audioCtx) audioCtx.close();
    });
  }
};
