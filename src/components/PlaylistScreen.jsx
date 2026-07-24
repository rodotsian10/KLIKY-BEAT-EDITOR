import React, { useRef } from 'react';
import './PlaylistScreen.css';

function PlaylistScreen({ 
  songs, 
  selectedSong, 
  onSelectSong, 
  songHighScores, 
  onOpenSettings,
  playKeycapSound,
  debugMode,
  customSong,
  setCustomSong,
  onSelectCustomSong
}) {
  const audioInputRef = useRef(null);

  const handleCustomAudioUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const audioUrl = URL.createObjectURL(file);
    setCustomSong(prev => ({
      id: 'custom',
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'CUSTOM UPLOAD',
      audioUrl,
      bpm: prev?.bpm || 120,
      duration: '--:--',
      difficulty: 'CUSTOM',
      highScoreKey: null,
      coverColor: '#a855f7',
      chart: prev?.chart || []
    }));
  };

  const handleCustomJsonPaste = (e) => {
    const rawText = e.target.value;
    setCustomSong(prev => {
      if (!prev) return prev;
      try {
        const parsed = new Function(`return ${rawText}`)();
        if (!Array.isArray(parsed)) return prev;
        return { ...prev, chart: parsed };
      } catch {
        return { ...prev, chart: [] };
      }
    });
  };

  const handleCustomBpmChange = (e) => {
    const val = parseInt(e.target.value) || 120;
    setCustomSong(prev => prev ? { ...prev, bpm: val } : prev);
  };

  return (
    <div className="main-playlist-screen">
      <header className="playlist-header">
        <button className="settings-btn" onClick={() => { if(playKeycapSound) playKeycapSound(); onOpenSettings(); }}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        <div className="playlist-title">SONG SELECT</div>
        <div style={{ width: '44px' }}></div> {/* Spacer */}
      </header>

      <div className="song-list">
        {/* Regular Songs */}
        {songs.map(song => (
          <div 
            className={`song-card ${selectedSong?.id === song.id ? 'active' : ''}`}
            key={song.id}
            onClick={() => {
              if (playKeycapSound) playKeycapSound();
              onSelectSong(song);
            }}
          >
            <div className="song-thumbnail-circle" style={{ background: `radial-gradient(circle, ${song.coverColor}55 0%, transparent 70%)`, borderColor: song.coverColor }}></div>
            <div className="song-info">
              <div className="song-title-txt">{song.title}</div>
              <div className="song-artist-txt">{song.artist}</div>
            </div>
            <div className="song-stats">
              <span className="song-bpm-badge">{song.bpm} BPM</span>
              <span className="song-highscore-txt">
                HI: {songHighScores[song.id] || 0}
              </span>
            </div>
          </div>
        ))}

        {/* CUSTOM SONG SECTION - Debug Mode Only, Always at Bottom */}
        {debugMode && (
          <div className="custom-song-section">
            <div className="custom-song-header">
              <span className="custom-song-label">⚙️ CUSTOM SONG</span>
              <span className="custom-song-hint">DEBUG MODE ONLY</span>
            </div>

            {/* Upload Audio */}
            <input 
              ref={audioInputRef} 
              type="file" 
              accept="audio/*" 
              style={{ display: 'none' }}
              onChange={handleCustomAudioUpload}
            />
            <button 
              className="custom-upload-btn"
              onClick={() => audioInputRef.current?.click()}
            >
              🎵 {customSong?.audioUrl ? `✅ ${customSong.title}` : 'UPLOAD AUDIO (MP3 / WAV)'}
            </button>

            {customSong && (
              <>
                {/* BPM Input */}
                <div className="custom-bpm-row">
                  <span className="custom-field-label">BPM:</span>
                  <input 
                    type="number" 
                    className="custom-bpm-input"
                    value={customSong.bpm}
                    min="40" max="300"
                    onChange={handleCustomBpmChange}
                    onClick={e => e.stopPropagation()}
                  />
                </div>

                {/* Chart JSON Paste */}
                <div className="custom-field-label">채보 JSON 붙여넣기:</div>
                <textarea
                  className="custom-json-textarea"
                  placeholder={`[\n  { beat: 1.0, lane: 0, type: 'short' },\n  ...\n]`}
                  defaultValue={customSong.chart?.length > 0 ? JSON.stringify(customSong.chart, null, 2) : ''}
                  onChange={handleCustomJsonPaste}
                  onClick={e => e.stopPropagation()}
                />

                {/* Play Custom Song */}
                <div 
                  className={`song-card custom-play-card ${selectedSong?.id === 'custom' ? 'active' : ''}`}
                  onClick={() => {
                    if (!customSong.audioUrl) return alert('먼저 오디오 파일을 업로드하세요!');
                    if (playKeycapSound) playKeycapSound();
                    onSelectCustomSong(customSong);
                  }}
                >
                  <div className="song-thumbnail-circle" style={{ background: 'radial-gradient(circle, #a855f755 0%, transparent 70%)', borderColor: '#a855f7' }}></div>
                  <div className="song-info">
                    <div className="song-title-txt">{customSong.title}</div>
                    <div className="song-artist-txt">CUSTOM · {customSong.chart?.length || 0} NOTES</div>
                  </div>
                  <div className="song-stats">
                    <span className="song-bpm-badge">{customSong.bpm} BPM</span>
                    <span className="song-highscore-txt" style={{ color: '#a855f7' }}>
                      CUSTOM ⚠️
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlaylistScreen;
