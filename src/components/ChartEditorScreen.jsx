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
  const [zoomLevel, setZoomLevel] = useState(240); // 1 beat = 240px (wide spacing)
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [customAudioUrl, setCustomAudioUrl] = useState(null);

  // Chart Notes State
  const [notes, setNotes] = useState(songs[0]?.chart || [
    { beat: 1.00, lane: 0, type: 'hold', durationBeats: 2.00 },
    { beat: 3.00, lane: 2, type: 'short' },
    { beat: 3.50, lane: 3, type: 'short' },
    { beat: 4.00, lane: 1, type: 'hold', durationBeats: 2.00 }
  ]);

  const [jsonText, setJsonText] = useState('');
  const audioRef = useRef(null);
  const activeHoldsRef = useRef({});
  const trackScrollRef = useRef(null);

  const laneKeys = ['KeyD', 'KeyF', 'KeyJ', 'KeyK'];
  const laneNames = ['D (Lane 1)', 'F (Lane 2)', 'J (Lane 3)', 'K (Lane 4)'];
  const laneColors = ['#00ffff', '#ff007f', '#ffff00', '#39ff14'];

  // Sync selected song change
  useEffect(() => {
    const song = songs.find(s => s.id === selectedSongId) || songs[0];
    setCurrentSong(song);
    setBpm(song.bpm || 140);
    if (song.chart) {
      setNotes([...song.chart]);
    }
  }, [selectedSongId, songs]);

  // Audio decryption & Web Audio player loading
  useEffect(() => {
    const loadAudioTrack = async () => {
      if (!currentSong) return;
      try {
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

        newAudio.addEventListener('timeupdate', () => {
          setCurrentTime(newAudio.currentTime);
        });

        newAudio.addEventListener('ended', () => {
          setIsPlaying(false);
          setIsRecording(false);
        });

        audioRef.current = newAudio;
        setIsPlaying(false);
      } catch (e) {
        console.error('Audio load error in editor:', e);
      }
    };

    loadAudioTrack();

    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [currentSong, customAudioUrl]);

  // Sync scroll positioning Top-to-Bottom as music plays
  useEffect(() => {
    if (trackScrollRef.current) {
      const secondsPerBeat = 60 / bpm;
      const currentBeat = currentTime / secondsPerBeat;
      const targetTop = currentBeat * zoomLevel - 160;
      trackScrollRef.current.scrollTop = Math.max(0, targetTop);
    }
  }, [currentTime, bpm, zoomLevel]);

  // Audio Play / Pause Toggle
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Keyboard Shortcuts (Scrubbing with ← / → & Live Tap Recording)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (audioRef.current) {
          const nextTime = Math.max(0, audioRef.current.currentTime - 1.0);
          audioRef.current.currentTime = nextTime;
          setCurrentTime(nextTime);
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (audioRef.current) {
          const nextTime = Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + 1.0);
          audioRef.current.currentTime = nextTime;
          setCurrentTime(nextTime);
        }
      }

      // Live Recording Key Press
      const laneIdx = laneKeys.indexOf(e.code);
      if (laneIdx !== -1 && !e.repeat) {
        if (playKeycapSound) playKeycapSound();
        const secondsPerBeat = 60 / bpm;
        const currentBeat = (audioRef.current ? audioRef.current.currentTime : currentTime) / secondsPerBeat;

        if (isRecording) {
          activeHoldsRef.current[laneIdx] = currentBeat;
        } else {
          setNotes(prev => {
            const next = [...prev, {
              beat: parseFloat(currentBeat.toFixed(2)),
              lane: laneIdx,
              type: 'short'
            }];
            return next.sort((a, b) => a.beat - b.beat);
          });
        }
      }
    };

    const handleKeyUp = (e) => {
      const laneIdx = laneKeys.indexOf(e.code);
      if (laneIdx !== -1 && isRecording && activeHoldsRef.current[laneIdx] !== undefined) {
        const secondsPerBeat = 60 / bpm;
        const currentBeat = (audioRef.current ? audioRef.current.currentTime : currentTime) / secondsPerBeat;
        const startBeat = activeHoldsRef.current[laneIdx];
        const duration = currentBeat - startBeat;

        setNotes(prev => {
          const next = [...prev];
          if (duration > 0.25) {
            next.push({
              beat: parseFloat(startBeat.toFixed(2)),
              lane: laneIdx,
              type: 'hold',
              durationBeats: parseFloat(duration.toFixed(2))
            });
          } else {
            next.push({
              beat: parseFloat(startBeat.toFixed(2)),
              lane: laneIdx,
              type: 'short'
            });
          }
          return next.sort((a, b) => a.beat - b.beat);
        });

        delete activeHoldsRef.current[laneIdx];
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [bpm, isRecording, playKeycapSound, currentTime]);

  // Click on Track Grid Lane to add/remove note manually
  const handleTrackLaneClick = (laneIdx, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top + trackScrollRef.current.scrollTop;
    const clickedBeat = parseFloat((clickY / zoomLevel).toFixed(2));

    setNotes(prev => {
      const next = [...prev, { beat: clickedBeat, lane: laneIdx, type: 'short' }];
      return next.sort((a, b) => a.beat - b.beat);
    });
  };

  const deleteNote = (idx, e) => {
    if (e) e.stopPropagation();
    setNotes(prev => prev.filter((_, i) => i !== idx));
  };

  // JSON Import & Export
  const handleExportJson = () => {
    const sorted = [...notes].sort((a, b) => a.beat - b.beat);
    const formatted = sorted.map(n => {
      if (n.type === 'hold') {
        return `  { beat: ${n.beat.toFixed(2)}, lane: ${n.lane}, type: 'hold', durationBeats: ${(n.durationBeats || 1.0).toFixed(2)} }`;
      }
      return `  { beat: ${n.beat.toFixed(2)}, lane: ${n.lane}, type: 'short' }`;
    });
    setJsonText(`[\n${formatted.join(',\n')}\n]`);
  };

  const handleCopyJson = () => {
    if (!jsonText) return alert('먼저 EXPORT 버튼을 눌러주세요!');
    navigator.clipboard.writeText(jsonText).then(() => alert('클립보드에 채보 JSON이 복사되었습니다!'));
  };

  const handleImportJson = () => {
    if (!jsonText.trim()) return alert('JSON 데이터를 입력해 주세요!');
    try {
      const evaluator = new Function(`return ${jsonText}`);
      const parsed = evaluator();
      if (!Array.isArray(parsed)) throw new Error('배열 형식이 아닙니다.');
      setNotes(parsed.sort((a, b) => a.beat - b.beat));
      alert('채보 데이터를 성공적으로 불러왔습니다!');
    } catch (e) {
      alert('JSON 파싱 오류: ' + e.message);
    }
  };

  const handleStartInGameTest = () => {
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);

    onTestPlay({
      ...currentSong,
      bpm: bpm,
      chart: notes
    });
  };

  const secondsPerBeat = 60 / bpm;
  const currentBeat = currentTime / secondsPerBeat;
  const totalBeats = 160;

  return (
    <div className="chart-editor-screen">
      {/* HEADER TOOLBAR */}
      <header className="editor-header">
        <button className="button-neon editor-back-btn" onClick={onBack}>
          ← EXIT
        </button>
        <h2 className="editor-title">🎛️ KLIKY-BEAT 4-LANE STUDIO</h2>
        
        <button className="button-neon editor-test-btn" onClick={handleStartInGameTest}>
          🎮 TEST PLAY IN-GAME
        </button>
      </header>

      {/* MAIN STUDIO BODY */}
      <div className="editor-body-layout">
        
        {/* LEFT CONTROL PANEL */}
        <div className="editor-left-panel">
          <div className="editor-card">
            <div className="card-title">🎵 SELECT SONG TRACK</div>
            <select 
              className="editor-select" 
              value={selectedSongId}
              onChange={(e) => setSelectedSongId(e.target.value)}
            >
              {songs.map(s => (
                <option key={s.id} value={s.id}>{s.title} ({s.artist})</option>
              ))}
            </select>
          </div>

          <div className="editor-card">
            <div className="card-title">🎙️ RECORD & PLAYBACK</div>
            <button 
              className={`record-toggle-btn ${isRecording ? 'recording' : ''}`}
              onClick={() => setIsRecording(!isRecording)}
            >
              {isRecording ? '🔴 RECORDING... (D/F/J/K)' : '🔴 START LIVE RECORDING'}
            </button>

            <div className="editor-btn-row">
              <button className="button-neon" onClick={togglePlay} style={{ flex: 1 }}>
                {isPlaying ? '⏸ PAUSE' : '▶ PLAY (Space)'}
              </button>
            </div>

            <div className="meta-info-row">
              <span>SPEED:</span>
              <select 
                value={playbackRate} 
                onChange={(e) => {
                  const rate = parseFloat(e.target.value);
                  setPlaybackRate(rate);
                  if (audioRef.current) audioRef.current.playbackRate = rate;
                }}
                className="editor-select-sm"
              >
                <option value={0.5}>0.5x Slow</option>
                <option value={0.75}>0.75x</option>
                <option value={1.0}>1.0x Normal</option>
              </select>
            </div>
          </div>

          <div className="editor-card">
            <div className="card-title">🔍 GRID SPACING (ZOOM)</div>
            <div className="meta-info-row">
              <span>BEAT HEIGHT:</span>
              <select 
                value={zoomLevel} 
                onChange={(e) => setZoomLevel(parseInt(e.target.value))}
                className="editor-select-sm"
              >
                <option value={160}>160px (Standard)</option>
                <option value={240}>240px (Wide)</option>
                <option value={320}>320px (Ultra Wide)</option>
              </select>
            </div>
            <div className="meta-info-row" style={{ marginTop: '6px' }}>
              <span>BPM:</span>
              <input 
                type="number" 
                value={bpm} 
                min="40" 
                max="300"
                onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
                className="editor-num-input"
              />
            </div>
          </div>

          <div className="editor-card">
            <div className="card-title">💾 JSON IMPORT / EXPORT</div>
            <div className="editor-btn-row">
              <button className="button-neon" onClick={handleExportJson} style={{ flex: 1 }}>
                EXPORT
              </button>
              <button className="button-neon" onClick={handleCopyJson} style={{ flex: 1 }}>
                COPY
              </button>
            </div>
            <textarea 
              className="editor-json-textarea"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="JSON 붙여넣기 또는 EXPORT..."
            />
            <button className="button-neon" onClick={handleImportJson} style={{ marginTop: '6px', width: '100%' }}>
              LOAD JSON TO CHART
            </button>
          </div>
        </div>

        {/* CENTER MAIN: LARGE 4-LANE TOP-TO-BOTTOM TIMELINE TRACK */}
        <div className="editor-center-panel">
          <div className="editor-time-banner">
            TIME: <span className="cyan">{currentTime.toFixed(2)}s</span>
            <span style={{ margin: '0 12px' }}>|</span>
            BEAT: <span className="yellow">{currentBeat.toFixed(2)}b</span>
            <span className="shortcut-hint">⌨️ [Space] Play/Pause | [←/→] ±1s Scrubbing | Click Track to Add Note</span>
          </div>

          {/* 4 LARGE LANES TOP-TO-BOTTOM TRACK CONTAINER */}
          <div className="large-track-container" ref={trackScrollRef}>
            <div 
              className="large-track-grid"
              style={{ height: `${totalBeats * zoomLevel}px` }}
            >
              {/* Top-to-Bottom Current Time Playhead Bar */}
              <div 
                className="top-playhead-bar"
                style={{ top: `${currentBeat * zoomLevel}px` }}
              >
                <div className="playhead-tag">NOW {currentBeat.toFixed(2)}b</div>
              </div>

              {/* Beat Divider Lines (0 ~ 160 Beats Top-to-Bottom) */}
              {Array.from({ length: totalBeats * 2 }).map((_, i) => {
                const beatVal = i * 0.5;
                const topPx = beatVal * zoomLevel;
                const isMainBeat = beatVal % 1 === 0;

                return (
                  <div 
                    key={i} 
                    className={`track-beat-line ${isMainBeat ? 'main-beat' : ''}`}
                    style={{ top: `${topPx}px` }}
                  >
                    {isMainBeat && <span className="beat-num">BEAT {beatVal}</span>}
                  </div>
                );
              })}

              {/* 4 Wide Column Lanes */}
              {[0, 1, 2, 3].map(laneIdx => (
                <div 
                  key={laneIdx} 
                  className={`large-track-lane lane-${laneIdx}`}
                  onClick={(e) => handleTrackLaneClick(laneIdx, e)}
                >
                  <div className="lane-header-label" style={{ color: laneColors[laneIdx] }}>
                    {laneNames[laneIdx]}
                  </div>
                </div>
              ))}

              {/* Render Notes (Top-to-Bottom Spacing) */}
              {notes.map((note, idx) => {
                const topPx = note.beat * zoomLevel;
                const leftPx = note.lane * 130 + 10;
                const color = laneColors[note.lane];

                return (
                  <React.Fragment key={idx}>
                    {note.type === 'hold' && (
                      <div 
                        className="large-hold-ribbon"
                        style={{
                          top: `${topPx}px`,
                          height: `${(note.durationBeats || 1) * zoomLevel}px`,
                          left: `${note.lane * 130 + 55}px`,
                          background: color,
                          boxShadow: `0 0 14px ${color}`
                        }}
                      />
                    )}
                    <div 
                      className="large-note-block"
                      style={{
                        top: `${topPx}px`,
                        left: `${leftPx}px`,
                        background: color,
                        boxShadow: `0 0 16px ${color}`
                      }}
                      onClick={(e) => deleteNote(idx, e)}
                      title={`Beat ${note.beat} (Lane ${note.lane + 1}) - Click to Delete`}
                    >
                      <span className="note-text-label">B {note.beat.toFixed(2)}</span>
                    </div>
                  </React.Fragment>
                );
              })}

            </div>
          </div>
        </div>

        {/* RIGHT PANEL: VERTICAL TIMELINE INSPECTION LIST */}
        <div className="editor-right-panel">
          <div className="card-title">📜 NOTE LIST ({notes.length} NOTES)</div>
          <div className="inspector-scroll-list">
            {notes.map((note, idx) => (
              <div 
                key={idx} 
                className="inspector-row-item"
                style={{ borderLeftColor: laneColors[note.lane] }}
              >
                <div>
                  <span className="beat-badge">B {note.beat.toFixed(2)}</span>
                  <span className="lane-badge" style={{ color: laneColors[note.lane] }}>
                    L{note.lane + 1}
                  </span>
                  <span className="type-badge">
                    {note.type.toUpperCase()}{note.durationBeats ? ` (${note.durationBeats}b)` : ''}
                  </span>
                </div>
                <button className="inspector-del-btn" onClick={(e) => deleteNote(idx, e)}>
                  ✖
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ChartEditorScreen;
