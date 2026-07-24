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
  const [noteSpeed, setNoteSpeed] = useState(4.0);
  const [bpm, setBpm] = useState(songs[0]?.bpm || 140);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [customAudioUrl, setCustomAudioUrl] = useState(null);

  // Chart Notes Array
  const [notes, setNotes] = useState(songs[0]?.chart || [
    { beat: 1.00, lane: 0, type: 'hold', durationBeats: 2.00 },
    { beat: 3.00, lane: 2, type: 'short' },
    { beat: 3.50, lane: 3, type: 'short' },
    { beat: 4.00, lane: 1, type: 'hold', durationBeats: 2.00 }
  ]);

  const [jsonText, setJsonText] = useState('');
  const audioRef = useRef(null);
  const activeHoldsRef = useRef({});

  const laneKeys = ['KeyD', 'KeyF', 'KeyJ', 'KeyK'];
  const laneColors = ['#00ffff', '#ff007f', '#ffff00', '#39ff14'];

  // Handle song selection change
  useEffect(() => {
    const song = songs.find(s => s.id === selectedSongId) || songs[0];
    setCurrentSong(song);
    setBpm(song.bpm || 140);
    if (song.chart) {
      setNotes([...song.chart]);
    }
  }, [selectedSongId, songs]);

  // Load and Decrypt Audio Buffer for Web Audio
  useEffect(() => {
    const loadAudioTrack = async () => {
      if (!currentSong) return;
      try {
        if (audioRef.current) {
          audioRef.current.pause();
        }

        let audioUrl = currentSong.path;

        // Decrypt if encrypted track (e.g. Canon in Harp)
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
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentSong, customAudioUrl]);

  // Handle Custom MP3 Upload
  const handleCustomAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomAudioUrl(url);
      setCurrentSong({
        id: 'custom-user-track',
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'User Track',
        path: url,
        bpm: bpm
      });
    }
  };

  // Playback Toggle
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

  // Arrow Key Navigation (← / → 1 second scrubbing without glitching)
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
          // Tap to insert short note
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
          if (duration > 0.2) {
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

  // Export JSON
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
    if (!jsonText) return alert('먼저 EXPORT JSON을 클릭해 주세요!');
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

  const deleteNote = (idx) => {
    setNotes(prev => prev.filter((_, i) => i !== idx));
  };

  // Launch In-Game Test Play
  const handleStartInGameTest = () => {
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);

    const testSong = {
      ...currentSong,
      bpm: bpm,
      chart: notes
    };

    onTestPlay(testSong);
  };

  const secondsPerBeat = 60 / bpm;
  const currentBeat = currentTime / secondsPerBeat;

  return (
    <div className="chart-editor-screen">
      {/* HEADER BAR */}
      <header className="editor-header">
        <button className="button-neon editor-back-btn" onClick={onBack}>
          ← EXIT EDITOR
        </button>
        <h2 className="editor-title">🎛️ KLIKY-BEAT CHART STUDIO</h2>
        
        <button className="button-neon editor-test-btn" onClick={handleStartInGameTest}>
          🎮 TEST PLAY IN-GAME
        </button>
      </header>

      {/* EDITOR BODY 3-PANEL LAYOUT */}
      <div className="editor-body-layout">
        
        {/* LEFT PANEL: AUDIO & RECORD CONTROLS */}
        <div className="editor-left-panel">
          <div className="editor-card">
            <div className="card-title">🎵 SELECT TRACK SOURCE</div>
            <select 
              className="editor-select" 
              value={selectedSongId}
              onChange={(e) => setSelectedSongId(e.target.value)}
            >
              {songs.map(s => (
                <option key={s.id} value={s.id}>{s.title} ({s.artist})</option>
              ))}
            </select>

            <div style={{ marginTop: '10px' }}>
              <label className="editor-label">📁 Custom MP3/WAV Upload:</label>
              <input 
                type="file" 
                accept="audio/*"
                onChange={handleCustomAudioUpload}
                className="editor-file-input"
              />
            </div>
          </div>

          <div className="editor-card">
            <div className="card-title">🎙️ LIVE TAP RECORD & PLAY</div>
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
              <span>TEMPO:</span>
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
                <option value={1.25}>1.25x</option>
              </select>
            </div>
          </div>

          <div className="editor-card">
            <div className="card-title">⚙️ BPM CONFIG</div>
            <div className="meta-info-row">
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
              placeholder="JSON 데이터를 입력하거나 EXPORT 버튼을 누르세요..."
            />
            <button className="button-neon" onClick={handleImportJson} style={{ marginTop: '8px', width: '100%' }}>
              LOAD JSON TO CHART
            </button>
          </div>
        </div>

        {/* CENTER PANEL: VISUAL NOTE GRID & PLAYHEAD */}
        <div className="editor-center-panel">
          <div className="editor-time-banner">
            TIME: <span className="cyan">{currentTime.toFixed(2)}s</span>
            <span style={{ margin: '0 12px' }}>|</span>
            BEAT: <span className="yellow">{currentBeat.toFixed(2)}b</span>
            <span className="shortcut-hint">⌨️ [Space] Play/Pause | [←/→] ±1s Scrubbing | [D/F/J/K] Tap</span>
          </div>

          <div className="grid-lane-container">
            <div className="grid-track">
              {/* 4 Lanes Divider */}
              <div className="lane-line lane-1" />
              <div className="lane-line lane-2" />
              <div className="lane-line lane-3" />

              {/* Playhead Indicator */}
              <div 
                className="playhead-indicator"
                style={{ bottom: `${(currentBeat % 16) * 32}px` }}
              />

              {/* Render Notes */}
              {notes.map((note, i) => {
                const bottomPx = ((note.beat % 16) * 32);
                const leftPx = note.lane * 65 + 8;
                const color = laneColors[note.lane];

                return (
                  <React.Fragment key={i}>
                    {note.type === 'hold' && (
                      <div 
                        className="grid-hold-ribbon"
                        style={{
                          bottom: `${bottomPx}px`,
                          height: `${(note.durationBeats || 1) * 32}px`,
                          left: `${note.lane * 65 + 28}px`,
                          background: color,
                          boxShadow: `0 0 10px ${color}`
                        }}
                      />
                    )}
                    <div 
                      className="grid-note-block"
                      style={{
                        bottom: `${bottomPx}px`,
                        left: `${leftPx}px`,
                        background: color,
                        boxShadow: `0 0 10px ${color}`
                      }}
                      onClick={() => deleteNote(i)}
                      title={`Beat ${note.beat} (Lane ${note.lane + 1}) - Click to delete`}
                    />
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: VERTICAL TIMELINE INSPECTION ROLL */}
        <div className="editor-right-panel">
          <div className="card-title">📜 VERTICAL TIMELINE ({notes.length} NOTES)</div>
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
                    Lane {note.lane + 1}
                  </span>
                  <span className="type-badge">
                    {note.type.toUpperCase()}{note.durationBeats ? ` (${note.durationBeats}b)` : ''}
                  </span>
                </div>
                <button className="inspector-del-btn" onClick={() => deleteNote(idx)}>
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
