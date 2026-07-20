import React, { useState } from 'react';
import './SongDetailsScreen.css';

function SongDetailsScreen({ 
  song, 
  noteSpeed, 
  setNoteSpeed, 
  onBack, 
  onPlay,
  playKeycapSound
}) {
  const [customChartText, setCustomChartText] = useState('');

  const handlePlayCustomChart = () => {
    if (!customChartText.trim()) {
      alert('채보 JSON 데이터를 입력해 주세요!');
      return;
    }

    try {
      // Evaluate pasted javascript array directly (handles unquoted keys & single quotes)
      const evaluator = new Function(`return ${customChartText}`);
      const parsedChart = evaluator();
      
      if (!Array.isArray(parsedChart)) {
        throw new Error('데이터가 배열 형식이 아닙니다.');
      }

      // Inject custom chart into copy of selected song
      const tempSong = {
        ...song,
        chart: parsedChart
      };

      if (playKeycapSound) playKeycapSound();
      onPlay(tempSong);
    } catch (e) {
      alert(`채보 파싱 실패: ${e.message}\n에디터에서 복사한 배열이 맞는지 확인해 주세요.`);
    }
  };

  return (
    <div className="song-details-screen">
      <header className="details-header">
        <button className="back-btn" onClick={() => { if(playKeycapSound) playKeycapSound(); onBack(); }}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          BACK
        </button>
      </header>

      <div className="details-body">
        <div className="vinyl-record-container">
          <div className="vinyl-disc playing">
            <div className="vinyl-center-art"></div>
          </div>
        </div>
        
        <h2 className="details-title-txt">{song.title}</h2>
        <p className="details-artist-txt">{song.artist}</p>

        <div className="details-info-row">
          <div className="details-badge">
            <span>SPEED</span>
            <span className="details-badge-val">{noteSpeed.toFixed(1)}x</span>
          </div>
          <div className="details-badge">
            <span>BPM</span>
            <span className="details-badge-val">{song.bpm}</span>
          </div>
          <div className="details-badge">
            <span>DIFF</span>
            <span className="details-badge-val" style={{ color: song.difficulty === 'HARD' ? 'var(--neon-magenta)' : 'var(--neon-green)' }}>
              {song.difficulty}
            </span>
          </div>
        </div>

        <div className="settings-group" style={{ width: '100%' }}>
          <div className="setting-row">
            <span className="setting-label">SPEED:</span>
            <input 
              type="range" 
              min="2.0" 
              max="6.0" 
              step="0.5" 
              value={noteSpeed} 
              onChange={(e) => setNoteSpeed(parseFloat(e.target.value))}
              className="setting-slider"
            />
            <span className="setting-value">{noteSpeed.toFixed(1)}x</span>
          </div>
        </div>
      </div>

      <button 
        className="button-neon" 
        onClick={() => { if (playKeycapSound) playKeycapSound(); onPlay(song); }}
        style={{ width: '100%', maxWidth: '280px', margin: '0 auto' }}
      >
        PLAY NOW
      </button>

      {/* ========================================================================= */}
      {/* ⚠️ DEBUG ONLY: CUSTOM CHART TEST FIELD (REMOVE THIS WHOLE BLOCK FOR PROD) */}
      {/* ========================================================================= */}
      <div style={{
        marginTop: '20px',
        width: '100%',
        maxWidth: '280px',
        margin: '20px auto 0 auto',
        padding: '12px',
        background: 'rgba(255, 0, 127, 0.05)',
        border: '1px dashed var(--neon-magenta)',
        borderRadius: '12px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--neon-magenta)', fontWeight: 'bold', textAlign: 'center', letterSpacing: '1px' }}>
          🛠️ DEBUG: CUSTOM CHART TEST
        </div>
        <textarea
          value={customChartText}
          onChange={(e) => setCustomChartText(e.target.value)}
          placeholder="여기에 에디터에서 복사한 채보 JSON 배열을 붙여넣으세요..."
          style={{
            width: '100%',
            height: '70px',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            color: '#00ff66',
            fontFamily: 'monospace',
            fontSize: '0.65rem',
            padding: '6px',
            boxSizing: 'border-box',
            resize: 'none',
            outline: 'none'
          }}
        />
        <button
          onClick={handlePlayCustomChart}
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid var(--neon-magenta)',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '0.8rem',
            padding: '6px 0',
            cursor: 'pointer',
            fontFamily: 'monospace',
            textShadow: '0 0 5px var(--neon-magenta-glow)',
            boxShadow: '0 0 8px rgba(255, 0, 127, 0.1)'
          }}
          onMouseEnter={(e) => { e.target.style.background = 'var(--neon-magenta)'; e.target.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#fff'; }}
        >
          PLAY CUSTOM CHART
        </button>
      </div>
      {/* ========================================================================= */}
      {/* ⚠️ DEBUG ONLY END */}
      {/* ========================================================================= */}
    </div>
  );
}

export default SongDetailsScreen;
