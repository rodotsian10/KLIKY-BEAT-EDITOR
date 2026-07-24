import React, { useState, useEffect, useRef } from 'react';
import './ChartEditorScreen.css';

function ChartEditorScreen({ 
  songs, 
  audioCtx, 
  sfxBuffers,
  playKeycapSound, 
  onBack, 
  onTestPlay 
}) {
  const [selectedSongId, setSelectedSongId] = useState(songs[0]?.id || 'my-heart');
  const [currentSong, setCurrentSong] = useState(songs[0]);
  const [bpm, setBpm] = useState(songs[0]?.bpm || 140);
  const [zoomLevel, setZoomLevel] = useState(240);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [displayTime, setDisplayTime] = useState(0); // Only for UI banner display
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [customAudioUrl, setCustomAudioUrl] = useState(null);
  const [loadedAudioName, setLoadedAudioName] = useState('');

  const [notes, setNotes] = useState(songs[0]?.chart || []);
  const [jsonText, setJsonText] = useState('');

  const fileInputRef = useRef(null);

  const handleLocalAudioUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomAudioUrl(url);
    setLoadedAudioName(file.name);
    setCurrentSong(prev => ({
      ...prev,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'LOCAL FILE',
      path: url,
      encrypted: false
    }));
  };

  const audioRef = useRef(null);
  const activeHoldsRef = useRef({}); // { laneIdx: startBeat } - always active for all keys
  const trackScrollRef = useRef(null);
  const playheadRef = useRef(null);
  const playheadTagRef = useRef(null);
  const animFrameRef = useRef(null);
  const bpmRef = useRef(bpm);
  const zoomRef = useRef(zoomLevel);
  const isRecordingRef = useRef(isRecording);
  const notesRef = useRef(notes);

  // Keep refs in sync
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { zoomRef.current = zoomLevel; }, [zoomLevel]);
  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);
  useEffect(() => { notesRef.current = notes; }, [notes]);

  const laneKeys = ['KeyD', 'KeyF', 'KeyJ', 'KeyK'];
  const laneNames = ['D (Lane 1)', 'F (Lane 2)', 'J (Lane 3)', 'K (Lane 4)'];
  const laneColors = ['#00ffff', '#ff007f', '#ffff00', '#39ff14'];

  // Sync selected song
  useEffect(() => {
    const song = songs.find(s => s.id === selectedSongId) || songs[0];
    setCurrentSong(song);
    setBpm(song.bpm || 140);
    if (song.chart && song.chart.length > 0) {
      setNotes([...song.chart]);
    } else {
      setNotes([]);
    }
  }, [selectedSongId]);

  // Load audio track (with XOR decryption support)
  useEffect(() => {
    const loadAudioTrack = async () => {
      if (!currentSong) return;
      try {
        stopAnimation();
        if (audioRef.current) audioRef.current.pause();

        let audioUrl = currentSong.path;

        if (currentSong.encrypted) {
          const res = await fetch(encodeURI(currentSong.path));
          if (!res.ok) throw new Error('Encrypted track fetch failed');
          const arrayBuf = await res.arrayBuffer();
          const secretKey = new TextEncoder().encode('KLIKY_BEAT_NEKO_LEGENDS_CANON_HARP_2026');
          const view = new Uint8Array(arrayBuf);
          const decrypted = new Uint8Array(arrayBuf.byteLength);
          for (let i = 0; i < view.length; i++) {
            decrypted[i] = view[i] ^ secretKey[i % secretKey.length];
          }
          const blob = new Blob([decrypted.buffer], { type: 'audio/wav' });
          audioUrl = URL.createObjectURL(blob);
        } else if (customAudioUrl) {
          audioUrl = customAudioUrl;
        }

        const newAudio = new Audio(audioUrl);
        newAudio.playbackRate = playbackRate;
        newAudio.addEventListener('ended', () => {
          stopAnimation();
          setIsPlaying(false);
          setIsRecording(false);
        });

        audioRef.current = newAudio;
        setIsPlaying(false);
        setDisplayTime(0);
      } catch (e) {
        console.error('Audio load error in editor:', e);
      }
    };

    loadAudioTrack();
    return () => {
      stopAnimation();
      if (audioRef.current) audioRef.current.pause();
    };
  }, [currentSong, customAudioUrl]);

  // ─── 60FPS DOM-Direct Animation Loop ───────────────────────────────────────
  // Directly manipulates playhead DOM and scroll without going through React state.
  // This is the key to silky-smooth 60fps playhead movement.
  const startAnimation = () => {
    stopAnimation();
    const tick = () => {
      const audio = audioRef.current;
      if (!audio || audio.paused) return;

      const t = audio.currentTime;
      const spb = 60 / bpmRef.current;
      const beat = t / spb;
      const z = zoomRef.current;
      // +20 to account for padding-top of the container
      const topPx = beat * z + 20;

      // Directly move playhead bar (topPx relative to grid, not container)
      const gridTopPx = beat * z;
      if (playheadRef.current) {
        playheadRef.current.style.top = `${gridTopPx}px`;
      }
      if (playheadTagRef.current) {
        playheadTagRef.current.textContent = `NOW ${beat.toFixed(2)}b`;
      }

      // Auto-scroll: keep playhead at ~33% from top of visible viewport
      if (trackScrollRef.current) {
        const container = trackScrollRef.current;
        const viewportHeight = container.clientHeight;
        // targetScrollTop so that the playhead appears at 33% from top
        const targetScrollTop = topPx - viewportHeight * 0.33;
        container.scrollTop = Math.max(0, targetScrollTop);
      }

      // Update banner text only (low cost React state update for display)
      setDisplayTime(t);

      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
  };

  const stopAnimation = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  };

  // Play / Pause
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => {
        setIsPlaying(true);
        startAnimation();
      }).catch(console.error);
    } else {
      audio.pause();
      stopAnimation();
      setIsPlaying(false);
    }
  };

  const triggerLanePress = (laneIdx) => {
    if (playKeycapSound) playKeycapSound();
    const t = audioRef.current ? audioRef.current.currentTime : 0;
    const currentBeat = t / (60 / bpmRef.current);
    activeHoldsRef.current[laneIdx] = currentBeat;
  };

  const triggerLaneRelease = (laneIdx) => {
    if (activeHoldsRef.current[laneIdx] !== undefined) {
      const startBeat = activeHoldsRef.current[laneIdx];
      const t = audioRef.current ? audioRef.current.currentTime : 0;
      const endBeat = t / (60 / bpmRef.current);
      const duration = endBeat - startBeat;

      const newNote = duration >= 0.2
        ? {
            beat: parseFloat(startBeat.toFixed(2)),
            lane: laneIdx,
            type: 'hold',
            durationBeats: parseFloat(duration.toFixed(2))
          }
        : {
            beat: parseFloat(startBeat.toFixed(2)),
            lane: laneIdx,
            type: 'short'
          };

      setNotes(prev => [...prev, newNote].sort((a, b) => a.beat - b.beat));
      delete activeHoldsRef.current[laneIdx];
    }
  };

  // Keyboard Shortcuts (Scrubbing with ← / → & Live Tap Recording)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
        return;
      }
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (audioRef.current) {
          const t = Math.max(0, audioRef.current.currentTime - 1.0);
          audioRef.current.currentTime = t;
          setDisplayTime(t);
          const beat = t / (60 / bpmRef.current);
          if (playheadRef.current) playheadRef.current.style.top = `${beat * zoomRef.current}px`;
          if (playheadTagRef.current) playheadTagRef.current.textContent = `NOW ${beat.toFixed(2)}b`;
          if (trackScrollRef.current) {
            const vh = trackScrollRef.current.clientHeight;
            trackScrollRef.current.scrollTop = Math.max(0, beat * zoomRef.current - vh * 0.33);
          }
        }
        return;
      }
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (audioRef.current) {
          const t = Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + 1.0);
          audioRef.current.currentTime = t;
          setDisplayTime(t);
          const beat = t / (60 / bpmRef.current);
          if (playheadRef.current) playheadRef.current.style.top = `${beat * zoomRef.current}px`;
          if (playheadTagRef.current) playheadTagRef.current.textContent = `NOW ${beat.toFixed(2)}b`;
          if (trackScrollRef.current) {
            const vh = trackScrollRef.current.clientHeight;
            trackScrollRef.current.scrollTop = Math.max(0, beat * zoomRef.current - vh * 0.33);
          }
        }
        return;
      }

      const laneIdx = laneKeys.indexOf(e.code);
      if (laneIdx !== -1 && !e.repeat) {
        triggerLanePress(laneIdx);
      }
    };

    const handleKeyUp = (e) => {
      const laneIdx = laneKeys.indexOf(e.code);
      if (laneIdx !== -1) {
        triggerLaneRelease(laneIdx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playKeycapSound]);

  const deleteNote = (idx, e) => {
    if (e) e.stopPropagation();
    setNotes(prev => prev.filter((_, i) => i !== idx));
  };

  // JSON
  const handleExportJson = () => {
    const sorted = [...notes].sort((a, b) => a.beat - b.beat);
    const formatted = sorted.map(n =>
      n.type === 'hold'
        ? `  { beat: ${n.beat.toFixed(2)}, lane: ${n.lane}, type: 'hold', durationBeats: ${(n.durationBeats || 1.0).toFixed(2)} }`
        : `  { beat: ${n.beat.toFixed(2)}, lane: ${n.lane}, type: 'short' }`
    );
    setJsonText(`[\n${formatted.join(',\n')}\n]`);
  };

  const handleCopyJson = () => {
    if (!jsonText) return alert('먼저 EXPORT 버튼을 눌러주세요!');
    navigator.clipboard.writeText(jsonText).then(() => alert('채보 JSON이 클립보드에 복사되었습니다!'));
  };

  const handleImportJson = () => {
    if (!jsonText.trim()) return alert('JSON 데이터를 입력해 주세요!');
    try {
      const parsed = new Function(`return ${jsonText}`)();
      if (!Array.isArray(parsed)) throw new Error('배열 형식이 아닙니다.');
      setNotes(parsed.sort((a, b) => a.beat - b.beat));
      alert('채보 데이터를 불러왔습니다!');
    } catch (err) {
      alert('JSON 파싱 오류: ' + err.message);
    }
  };

  const handleStartInGameTest = () => {
    stopAnimation();
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    onTestPlay({ ...currentSong, bpm, chart: notes });
  };

  const currentBeat = displayTime / (60 / bpm);
  const totalBeats = 200;

  return (
    <div className="chart-editor-screen">
      {/* HEADER */}
      <header className="editor-header">
        <button className="button-neon editor-back-btn" onClick={onBack}>← EXIT</button>
        <h2 className="editor-title">🎛️ KLIKY-BEAT 4-LANE STUDIO</h2>
        <button className="button-neon editor-test-btn" onClick={handleStartInGameTest}>
          🎮 TEST PLAY IN-GAME
        </button>
      </header>

      <div className="editor-body-layout">

        {/* LEFT PANEL */}
        <div className="editor-left-panel">
          <div className="editor-card">
            <div className="card-title">🎵 SELECT SONG TRACK</div>
            <select className="editor-select" value={selectedSongId}
              onChange={(e) => {
                setSelectedSongId(e.target.value);
                setCustomAudioUrl(null);
              }}>
              {songs.map(s => (
                <option key={s.id} value={s.id}>{s.title} ({s.artist})</option>
              ))}
            </select>

            <input 
              ref={fileInputRef} 
              type="file" 
              accept="audio/*" 
              style={{ display: 'none' }}
              onChange={handleLocalAudioUpload}
            />
            <button 
              className="button-neon" 
              style={{ marginTop: '6px', fontSize: '0.78rem', padding: '6px 10px' }}
              onClick={() => fileInputRef.current?.click()}
            >
              📁 {loadedAudioName ? `✅ ${loadedAudioName}` : '내 폴더에서 음원 불러오기'}
            </button>
          </div>

          <div className="editor-card">
            <div className="card-title">🎙️ RECORD & PLAYBACK</div>

            <div className="record-mode-badge">
              꾹 눌러 롱노트 · 짧게 눌러 숏노트 (항상 작동)
            </div>

            <button
              className={`record-toggle-btn ${isRecording ? 'recording' : ''}`}
              onClick={() => setIsRecording(!isRecording)}
            >
              {isRecording ? '🔴 RECORDING (D/F/J/K)' : '🔴 START RECORDING'}
            </button>

            <div className="editor-btn-row">
              <button className="button-neon" onClick={togglePlay} style={{ flex: 1 }}>
                {isPlaying ? '⏸ PAUSE (Space)' : '▶ PLAY (Space)'}
              </button>
            </div>

            <div className="meta-info-row">
              <span>SPEED:</span>
              <select value={playbackRate} className="editor-select-sm"
                onChange={(e) => {
                  const rate = parseFloat(e.target.value);
                  setPlaybackRate(rate);
                  if (audioRef.current) audioRef.current.playbackRate = rate;
                }}>
                <option value={0.5}>0.5x Slow</option>
                <option value={0.75}>0.75x</option>
                <option value={1.0}>1.0x Normal</option>
              </select>
            </div>
          </div>

          <div className="editor-card">
            <div className="card-title">🔍 GRID ZOOM & BPM</div>
            <div className="meta-info-row">
              <span>BEAT HEIGHT:</span>
              <select value={zoomLevel} className="editor-select-sm"
                onChange={(e) => setZoomLevel(parseInt(e.target.value))}>
                <option value={160}>160px</option>
                <option value={240}>240px (Wide)</option>
                <option value={320}>320px (Ultra)</option>
              </select>
            </div>
            <div className="meta-info-row" style={{ marginTop: '6px' }}>
              <span>BPM:</span>
              <input type="number" value={bpm} min="40" max="300"
                onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
                className="editor-num-input" />
            </div>
          </div>

          <div className="editor-card">
            <div className="card-title">💾 JSON IMPORT / EXPORT</div>
            <div className="editor-btn-row">
              <button className="button-neon" onClick={handleExportJson} style={{ flex: 1 }}>EXPORT</button>
              <button className="button-neon" onClick={handleCopyJson} style={{ flex: 1 }}>COPY</button>
            </div>
            <textarea className="editor-json-textarea" value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="JSON 붙여넣기 또는 EXPORT..." />
            <button className="button-neon" onClick={handleImportJson} style={{ marginTop: '6px', width: '100%' }}>
              LOAD JSON
            </button>
          </div>
        </div>

        {/* CENTER: 4-LANE TRACK */}
        <div className="editor-center-panel">
          <div className="editor-time-banner">
            TIME: <span className="cyan">{displayTime.toFixed(2)}s</span>
            <span style={{ margin: '0 12px' }}>|</span>
            BEAT: <span className="yellow">{currentBeat.toFixed(2)}b</span>
            <span className="shortcut-hint">
              ⌨️ [Space] Play/Pause | [←/→] ±1s | 1/2/3/4 터치 & [D/F/J/K] 꾹 누르면 롱노트
            </span>
          </div>

          <div className="large-track-container" ref={trackScrollRef}>
            <div className="large-track-grid" style={{ height: `${totalBeats * zoomLevel}px` }}>

              {/* Playhead — moved directly by rAF DOM manipulation */}
              <div className="top-playhead-bar" ref={playheadRef} style={{ top: '0px' }}>
                <div className="playhead-tag" ref={playheadTagRef}>NOW 0.00b</div>
              </div>

              {/* Beat lines */}
              {Array.from({ length: totalBeats * 2 }).map((_, i) => {
                const beatVal = i * 0.5;
                const isMain = beatVal % 1 === 0;
                return (
                  <div key={i} className={`track-beat-line ${isMain ? 'main-beat' : ''}`}
                    style={{ top: `${beatVal * zoomLevel}px` }}>
                    {isMain && <span className="beat-num">BEAT {beatVal}</span>}
                  </div>
                );
              })}

              {/* 4 Lane columns with 1 2 3 4 interactive header buttons */}
              {[0, 1, 2, 3].map(laneIdx => (
                <div key={laneIdx} className={`large-track-lane lane-${laneIdx}`}>
                  <div className="lane-header-label">
                    <button
                      className="lane-trigger-btn"
                      style={{ color: laneColors[laneIdx], borderColor: laneColors[laneIdx] }}
                      onMouseDown={(e) => { e.stopPropagation(); triggerLanePress(laneIdx); }}
                      onMouseUp={(e) => { e.stopPropagation(); triggerLaneRelease(laneIdx); }}
                      onTouchStart={(e) => { e.stopPropagation(); triggerLanePress(laneIdx); }}
                      onTouchEnd={(e) => { e.stopPropagation(); triggerLaneRelease(laneIdx); }}
                    >
                      {laneIdx + 1} ({['D', 'F', 'J', 'K'][laneIdx]})
                    </button>
                  </div>
                </div>
              ))}

              {/* Notes */}
              {notes.map((note, idx) => {
                const topPx = note.beat * zoomLevel;
                const leftPx = note.lane * 130 + 10;
                const color = laneColors[note.lane];
                return (
                  <React.Fragment key={idx}>
                    {note.type === 'hold' && (
                      <div className="large-hold-ribbon" style={{
                        top: `${topPx}px`,
                        height: `${(note.durationBeats || 1) * zoomLevel}px`,
                        left: `${note.lane * 130 + 55}px`,
                        background: color,
                        boxShadow: `0 0 14px ${color}`
                      }} />
                    )}
                    <div className="large-note-block"
                      style={{ top: `${topPx}px`, left: `${leftPx}px`, background: color, boxShadow: `0 0 16px ${color}` }}
                      onClick={(e) => deleteNote(idx, e)}
                      title={`Beat ${note.beat} L${note.lane + 1} — Click to Delete`}>
                      <span className="note-text-label">B {note.beat.toFixed(2)}</span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Note List */}
        <div className="editor-right-panel">
          <div className="card-title">📜 NOTE LIST ({notes.length})</div>
          <div className="inspector-scroll-list">
            {notes.map((note, idx) => (
              <div key={idx} className="inspector-row-item"
                style={{ borderLeftColor: laneColors[note.lane] }}>
                <div>
                  <span className="beat-badge">B {note.beat.toFixed(2)}</span>
                  <span className="lane-badge" style={{ color: laneColors[note.lane] }}>L{note.lane + 1}</span>
                  <span className="type-badge">
                    {note.type === 'hold' ? `HOLD(${note.durationBeats}b)` : 'SHORT'}
                  </span>
                </div>
                <button className="inspector-del-btn" onClick={(e) => deleteNote(idx, e)}>✖</button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ChartEditorScreen;
