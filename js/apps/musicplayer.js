// Music Player V2 - Enhanced with Web Audio API synthesis & visualizer
const MusicPlayerAppV2 = {
  open() {
    const win = WindowManager.createWindow({
      title: 'Music Player',
      icon: AppIcons.get('music-player'),
      width: 380,
      height: 520,
      minWidth: 320,
      minHeight: 450,
      appId: 'music-player',
      onClose: () => cleanup()
    });
    const body = win.getBody();

    // ── Note Frequencies ──
    const FREQ = {
      C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
      E2: 82.41, G2: 98.00, A2: 110.00
    };

    // ── Track Definitions ──
    const tracks = [
      {
        title: 'Chill Waves',
        loopDuration: 4.8, // 12 notes * 0.4s
        bg: 'linear-gradient(135deg, #1a1040, #0d1933)',
        bgOverlay: 'radial-gradient(circle at 65% 40%, rgba(137,180,250,0.08) 0%, transparent 60%)',
        play(ctx, master, startTime) {
          const melody = [FREQ.C4, FREQ.E4, FREQ.G4, FREQ.A4, FREQ.G4, FREQ.E4,
                          FREQ.C4, FREQ.E4, FREQ.G4, FREQ.A4, FREQ.G4, FREQ.E4];
          const noteDur = 0.4;
          melody.forEach((f, i) => {
            scheduleNote(ctx, master, f, 'sine', startTime + i * noteDur, noteDur, 0.22);
          });
          // Bass on C3 quarter notes
          for (let i = 0; i < 12; i++) {
            scheduleNote(ctx, master, FREQ.C3, 'sawtooth', startTime + i * noteDur, noteDur, 0.08);
          }
        }
      },
      {
        title: 'Digital Rain',
        loopDuration: 3.2, // 16 notes * 0.2s
        bg: 'linear-gradient(180deg, #0a1628, #162838)',
        bgOverlay: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(137,180,250,0.04) 8px, rgba(137,180,250,0.04) 9px)',
        play(ctx, master, startTime) {
          const arp = [FREQ.E3, FREQ.A3, FREQ.C4, FREQ.E4, FREQ.A4, FREQ.E4, FREQ.C4, FREQ.A3,
                       FREQ.E3, FREQ.A3, FREQ.C4, FREQ.E4, FREQ.A4, FREQ.E4, FREQ.C4, FREQ.A3];
          const noteDur = 0.2;
          arp.forEach((f, i) => {
            scheduleNote(ctx, master, f, 'triangle', startTime + i * noteDur, noteDur, 0.18);
            // Delay echo
            scheduleNote(ctx, master, f, 'triangle', startTime + i * noteDur + 0.15, noteDur, 0.07);
          });
        }
      },
      {
        title: 'Night Drive',
        loopDuration: 2.8, // bass: 4*0.3=1.2, lead: 8*0.2=1.6 → max ~2.8
        bg: 'linear-gradient(135deg, #1a0a2e, #2d1b40)',
        bgOverlay: 'repeating-linear-gradient(135deg, transparent, transparent 12px, rgba(255,255,255,0.02) 12px, rgba(255,255,255,0.02) 13px)',
        play(ctx, master, startTime) {
          const bass = [FREQ.E2, FREQ.E2, FREQ.G2, FREQ.A2];
          const lead = [FREQ.E4, FREQ.G4, FREQ.A4, FREQ.B4, FREQ.A4, FREQ.G4, FREQ.E4, FREQ.D4];
          bass.forEach((f, i) => {
            scheduleNote(ctx, master, f, 'square', startTime + i * 0.3, 0.3, 0.12);
          });
          lead.forEach((f, i) => {
            scheduleNote(ctx, master, f, 'sine', startTime + i * 0.2, 0.2, 0.16);
          });
        }
      },
      {
        title: 'Ambient Pulse',
        loopDuration: 8.0, // 4 chords * 2s
        bg: 'radial-gradient(circle, #1a2040, #0a0a15)',
        bgOverlay: 'radial-gradient(circle at 50% 50%, rgba(137,180,250,0.05) 20%, transparent 22%, transparent 35%, rgba(137,180,250,0.03) 37%, transparent 39%, transparent 55%, rgba(137,180,250,0.02) 57%, transparent 59%)',
        play(ctx, master, startTime) {
          const chords = [
            [FREQ.A3, FREQ.C4, FREQ.E4],   // Am
            [FREQ.F3, FREQ.A3, FREQ.C4],   // F
            [FREQ.C3, FREQ.E3, FREQ.G3],   // C
            [FREQ.G3, FREQ.B3, FREQ.D4]    // G
          ];
          chords.forEach((chord, ci) => {
            const t = startTime + ci * 2.0;
            chord.forEach(f => {
              scheduleChordTone(ctx, master, f, t, 2.0, 0.1, 0.5, 0.10);
            });
          });
        }
      }
    ];

    // ── Audio State ──
    let audioCtx = null;
    let masterGain = null;
    let analyser = null;
    let activeOscillators = [];
    let loopTimeout = null;
    let animFrameId = null;

    let currentTrack = 0;
    let isPlaying = false;
    let volume = 0.6;
    let shuffleOn = false;
    let repeatMode = 0; // 0=none, 1=all, 2=one
    let loopStartTime = 0;
    let playStartReal = 0;

    // ── Audio Helpers ──
    function initAudio() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = volume;
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        masterGain.connect(analyser);
        analyser.connect(audioCtx.destination);
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }

    function scheduleNote(ctx, master, freq, type, startTime, duration, vol) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.02);
      osc.connect(gain);
      gain.connect(master);
      osc.start(startTime);
      osc.stop(startTime + duration);
      activeOscillators.push({ osc, gain });
      osc.onended = () => {
        try { osc.disconnect(); gain.disconnect(); } catch(e) {}
        const idx = activeOscillators.findIndex(o => o.osc === osc);
        if (idx !== -1) activeOscillators.splice(idx, 1);
      };
    }

    function scheduleChordTone(ctx, master, freq, startTime, duration, attack, release, vol) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + attack);
      gain.gain.setValueAtTime(vol, startTime + duration - release);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.01);
      osc.connect(gain);
      gain.connect(master);
      osc.start(startTime);
      osc.stop(startTime + duration);
      activeOscillators.push({ osc, gain });
      osc.onended = () => {
        try { osc.disconnect(); gain.disconnect(); } catch(e) {}
        const idx = activeOscillators.findIndex(o => o.osc === osc);
        if (idx !== -1) activeOscillators.splice(idx, 1);
      };
    }

    // ── Playback ──
    function startPlayback() {
      initAudio();
      stopOscillators();

      isPlaying = true;
      const track = tracks[currentTrack];
      loopStartTime = audioCtx.currentTime + 0.05;
      playStartReal = Date.now();

      track.play(audioCtx, masterGain, loopStartTime);

      const loopMs = track.loopDuration * 1000;
      loopTimeout = setTimeout(() => {
        if (isPlaying) scheduleNextLoop();
      }, loopMs);

      updatePlayBtn();
      updateTray();
      startVisualizer();
    }

    function scheduleNextLoop() {
      if (!isPlaying) return;
      stopOscillators();

      const track = tracks[currentTrack];
      loopStartTime = audioCtx.currentTime + 0.05;
      playStartReal = Date.now();

      track.play(audioCtx, masterGain, loopStartTime);

      const loopMs = track.loopDuration * 1000;
      loopTimeout = setTimeout(() => {
        if (isPlaying) scheduleNextLoop();
      }, loopMs);
    }

    function stopPlayback() {
      isPlaying = false;
      if (loopTimeout) { clearTimeout(loopTimeout); loopTimeout = null; }
      stopOscillators();
      updatePlayBtn();
      updateTray();
      stopVisualizer();
    }

    function stopOscillators() {
      activeOscillators.forEach(({ osc, gain }) => {
        try { osc.stop(); osc.disconnect(); gain.disconnect(); } catch(e) {}
      });
      activeOscillators = [];
    }

    function togglePlay() {
      if (isPlaying) stopPlayback();
      else startPlayback();
    }

    function nextTrack() {
      const wasPlaying = isPlaying;
      stopPlayback();
      if (repeatMode === 2) {
        // repeat one: stay on same track
      } else if (shuffleOn) {
        let next;
        do { next = Math.floor(Math.random() * tracks.length); } while (next === currentTrack && tracks.length > 1);
        currentTrack = next;
      } else {
        currentTrack = (currentTrack + 1) % tracks.length;
        if (currentTrack === 0 && repeatMode === 0 && !wasPlaying) return;
      }
      updateUI();
      if (wasPlaying) startPlayback();
    }

    function prevTrack() {
      const wasPlaying = isPlaying;
      stopPlayback();
      if (shuffleOn) {
        let next;
        do { next = Math.floor(Math.random() * tracks.length); } while (next === currentTrack && tracks.length > 1);
        currentTrack = next;
      } else {
        currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
      }
      updateUI();
      if (wasPlaying) startPlayback();
    }

    function selectTrack(idx) {
      const wasPlaying = isPlaying;
      stopPlayback();
      currentTrack = idx;
      updateUI();
      if (wasPlaying || true) startPlayback();
    }

    function seekTo(pct) {
      if (!isPlaying) return;
      // Restart the loop at the approximate position
      stopPlayback();
      startPlayback();
    }

    // ── Visualizer ──
    function startVisualizer() {
      if (animFrameId) return;
      const bars = body.querySelectorAll('.mp2-bar');
      const bufLen = analyser.frequencyBinCount;
      const dataArr = new Uint8Array(bufLen);

      function draw() {
        analyser.getByteFrequencyData(dataArr);
        const step = Math.max(1, Math.floor(bufLen / bars.length));
        bars.forEach((bar, i) => {
          const val = dataArr[i * step] || 0;
          const pct = (val / 255) * 100;
          bar.style.height = Math.max(3, pct) + '%';
          bar.style.opacity = 0.5 + (1 - i / bars.length) * 0.5;
        });
        animFrameId = requestAnimationFrame(draw);
      }
      draw();
    }

    function stopVisualizer() {
      if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
      body.querySelectorAll('.mp2-bar').forEach(bar => {
        bar.style.height = '3%';
        bar.style.opacity = '0.4';
      });
    }

    // ── Time Formatting ──
    function fmtTime(sec) {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return m + ':' + String(s).padStart(2, '0');
    }

    // ── Progress Update ──
    let progressInterval = null;
    function startProgressUpdater() {
      if (progressInterval) clearInterval(progressInterval);
      progressInterval = setInterval(() => {
        if (!isPlaying) return;
        const track = tracks[currentTrack];
        const elapsed = (Date.now() - playStartReal) / 1000;
        const pct = Math.min(100, (elapsed / track.loopDuration) * 100);
        const fill = body.querySelector('.mp2-progress-fill');
        const curTime = body.querySelector('.mp2-time-cur');
        if (fill) fill.style.width = pct + '%';
        if (curTime) curTime.textContent = fmtTime(elapsed % track.loopDuration);
      }, 100);
    }

    // ── System Tray ──
    let trayBtn = null;
    function updateTray() {
      const tray = document.getElementById('system-tray');
      if (!tray) return;

      if (isPlaying && !trayBtn) {
        trayBtn = document.createElement('button');
        trayBtn.id = 'tray-music';
        trayBtn.title = 'Music Player';
        trayBtn.textContent = '\u266B';
        trayBtn.style.fontSize = '14px';
        trayBtn.addEventListener('click', () => {
          // Try to find the internal win object to check minimized state
          const winEl = win.el;
          if (winEl && winEl.style.display === 'none') {
            // Window is minimized - find it in WindowManager
            const allWindows = WindowManager.getWindows();
            const internalWin = allWindows.find(w => w.id === win.id);
            if (internalWin) WindowManager.restoreWindow(internalWin);
          } else {
            WindowManager.focusWindow(win.id);
          }
        });
        tray.insertBefore(trayBtn, tray.firstChild);
      } else if (!isPlaying && trayBtn) {
        trayBtn.remove();
        trayBtn = null;
      }
    }

    function removeTray() {
      if (trayBtn) { trayBtn.remove(); trayBtn = null; }
    }

    // ── Build UI ──
    const barCount = 32;
    body.innerHTML = `
      <div class="musicplayer">
        <div class="mp2-albumart" id="mp2-albumart">
          <div class="mp2-albumart-title"></div>
          <div class="mp2-albumart-artist">MiniOS Audio</div>
        </div>
        <div class="mp2-visualizer">
          ${Array(barCount).fill(0).map(() => '<div class="mp2-bar" style="height:3%;opacity:0.4"></div>').join('')}
        </div>
        <div class="mp2-progress-wrap">
          <div class="mp2-progress-bar">
            <div class="mp2-progress-fill" style="width:0%"></div>
          </div>
          <div class="mp2-time-row">
            <span class="mp2-time-cur">0:00</span>
            <span class="mp2-time-total">0:00</span>
          </div>
        </div>
        <div class="mp2-controls">
          <button class="mp2-prev-btn" title="Previous">\u23EE</button>
          <button class="mp2-play-btn" title="Play">\u25B6</button>
          <button class="mp2-next-btn" title="Next">\u23ED</button>
        </div>
        <div class="mp2-volume">
          <span>\uD83D\uDD08</span>
          <input type="range" min="0" max="100" value="60" class="mp2-vol-slider">
          <span>\uD83D\uDD0A</span>
        </div>
        <div class="mp2-toggles">
          <button class="mp2-toggle mp2-shuffle-btn">\uD83D\uDD00 Shuffle</button>
          <button class="mp2-toggle mp2-repeat-btn">\uD83D\uDD01 Repeat</button>
        </div>
        <div class="mp2-playlist">
          <div class="mp2-playlist-header">Playlist</div>
          ${tracks.map((t, i) => `
            <div class="mp2-playlist-item${i === 0 ? ' active' : ''}" data-idx="${i}">
              <span class="mp2-pl-icon">${i === 0 ? '\u25B6' : (i + 1)}</span>
              <span class="mp2-pl-title">${t.title}</span>
              <span class="mp2-pl-dur">${fmtTime(t.loopDuration)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // ── UI Update ──
    function updateUI() {
      const track = tracks[currentTrack];
      // Album art
      const art = body.querySelector('#mp2-albumart');
      art.style.background = track.bg;
      art.style.backgroundImage = track.bg + ', ' + track.bgOverlay;
      // Title
      body.querySelector('.mp2-albumart-title').textContent = track.title;
      // Time total
      body.querySelector('.mp2-time-total').textContent = fmtTime(track.loopDuration);
      body.querySelector('.mp2-time-cur').textContent = '0:00';
      body.querySelector('.mp2-progress-fill').style.width = '0%';
      // Playlist highlight
      body.querySelectorAll('.mp2-playlist-item').forEach((el, i) => {
        el.classList.toggle('active', i === currentTrack);
        el.querySelector('.mp2-pl-icon').textContent = i === currentTrack ? '\u25B6' : (i + 1);
      });
    }

    function updatePlayBtn() {
      const btn = body.querySelector('.mp2-play-btn');
      btn.textContent = isPlaying ? '\u23F8' : '\u25B6';
      btn.title = isPlaying ? 'Pause' : 'Play';
    }

    // ── Event Wiring ──
    body.querySelector('.mp2-play-btn').addEventListener('click', togglePlay);
    body.querySelector('.mp2-prev-btn').addEventListener('click', prevTrack);
    body.querySelector('.mp2-next-btn').addEventListener('click', nextTrack);

    body.querySelector('.mp2-vol-slider').addEventListener('input', (e) => {
      volume = e.target.value / 100;
      if (masterGain) masterGain.gain.value = volume;
    });

    body.querySelector('.mp2-progress-bar').addEventListener('click', (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      seekTo(pct);
    });

    body.querySelector('.mp2-shuffle-btn').addEventListener('click', (e) => {
      shuffleOn = !shuffleOn;
      e.currentTarget.classList.toggle('on', shuffleOn);
    });

    body.querySelector('.mp2-repeat-btn').addEventListener('click', (e) => {
      repeatMode = (repeatMode + 1) % 3;
      const labels = ['\uD83D\uDD01 Repeat', '\uD83D\uDD01 All', '\uD83D\uDD02 One'];
      e.currentTarget.textContent = labels[repeatMode];
      e.currentTarget.classList.toggle('on', repeatMode > 0);
    });

    body.querySelectorAll('.mp2-playlist-item').forEach(el => {
      el.addEventListener('click', () => {
        selectTrack(parseInt(el.dataset.idx));
      });
    });

    // Initialize display
    updateUI();
    startProgressUpdater();

    // ── Cleanup ──
    function cleanup() {
      stopPlayback();
      if (progressInterval) clearInterval(progressInterval);
      if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
      removeTray();
      if (audioCtx) {
        try { audioCtx.close(); } catch(e) {}
        audioCtx = null;
      }
    }
  }
};
