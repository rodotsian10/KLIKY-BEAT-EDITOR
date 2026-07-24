import React, { useState } from 'react';
import './SongDetailsScreen.css';

function SongDetailsScreen({ 
  song, 
  noteSpeed, 
  setNoteSpeed, 
  debugMode,
  isAutoPlay,
  setIsAutoPlay,
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
      const evaluator = new Function(`return ${customChartText}`);
      const parsedChart = evaluator();
      
      if (!Array.isArray(parsedChart)) {
        throw new Error('데이터가 배열 형식이 아닙니다.');
      }

      onPlay({
        ...song,
        chart: parsedChart
      });
    } catch (e) {
      alert('채보 JSON 형식 오류: ' + e.message);
    }
  };

  return (
    <div className="song-details-screen">
      <header className="details-header">
        <button className="button-neon details-back-btn" onClick={onBack}>
          ← BACK
        </button>
        <h2 className="details-title">{song.title}</h2>
      </header>

      <div className="details-body">
        {/* Left Column: Rotating Vinyl Record & Visual */}
        <div className="details-left-panel">
          <div className="vinyl-wrapper">
            <div className="vinyl-record">
              <div className="vinyl-grooves"></div>
              <div className="vinyl-label" style={{ background: song.coverColor }}>
                <span className="vinyl-title">{song.title}</span>
                <span className="vinyl-artist">{song.artist}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Controls, Speed, Play & Debug Chart Box */}
        <div className="details-right-panel">
          <div className="details-meta-card">
            <div className="meta-row">
              <span className="meta-label">ARTIST</span>
              <span className="meta-val">{song.artist}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">BPM</span>
              <span className="meta-val">{song.bpm}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">CHARTER</span>
              <span className="meta-val">{song.charter || 'SYSTEM'}</span>
            </div>
          </div>

          <div className="details-speed-row">
            <span className="setting-label">SPEED:</span>
            <input 
              type="range" 
              min="2.0" 
              max="6.0" 
              step="0.5" 
              value={noteSpeed} 
              onChange={(e) => setNoteSpeed(parseFloat(e.target.value))}
              className="setting-slider details-slider"
            />
            <span className="setting-value">{noteSpeed.toFixed(1)}x</span>
          </div>

          <div className="details-play-row">
            <button 
              className="button-neon details-play-btn"
              onClick={() => { if (playKeycapSound) playKeycapSound(); onPlay(song); }}
            >
              PLAY NOW
            </button>

            {debugMode && (
              <button
                className={`details-auto-btn ${isAutoPlay ? 'active' : ''}`}
                onClick={() => {
                  if (playKeycapSound) playKeycapSound();
                  setIsAutoPlay(!isAutoPlay);
                }}
              >
                🤖 AUTO {isAutoPlay ? 'ON' : 'OFF'}
              </button>
            )}
          </div>

          {/* ====================================================== */}
          {/* ⚠️ DEBUG ONLY: CUSTOM CHART TEST (Conditioned by debugMode) */}
          {/* ====================================================== */}
          {debugMode && (
            <div className="details-debug-box">
              <div className="details-debug-label">🛠️ DEBUG: CUSTOM CHART TEST</div>
              <textarea
                value={customChartText}
                onChange={(e) => setCustomChartText(e.target.value)}
                placeholder="에디터에서 복사한 채보 JSON 배열을 붙여넣으세요..."
                className="details-debug-textarea"
              />
              <button
                onClick={handlePlayCustomChart}
                className="details-debug-btn"
              >
                PLAY CUSTOM CHART
              </button>
            </div>
          )}
          {/* ====================================================== */}
          {/* ⚠️ DEBUG ONLY END */}
          {/* ====================================================== */}
        </div>
      </div>
    </div>
  );
}

export default SongDetailsScreen;
