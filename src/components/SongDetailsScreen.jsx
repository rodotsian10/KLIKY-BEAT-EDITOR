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
  onOpenEditor,
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

      const tempSong = { ...song, chart: parsedChart };
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

      {/* Landscape: left column = vinyl, right column = info+buttons */}
      <div className="details-layout">
        {/* Left: Vinyl */}
        <div className="details-left">
          <div className="vinyl-record-container">
            <div className="vinyl-disc playing">
              <div className="vinyl-center-art"></div>
            </div>
          </div>
        </div>

        {/* Right: Info + Controls */}
        <div className="details-right">
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
              <span>CHARTER</span>
              <span className="details-badge-val" style={{ color: 'var(--neon-cyan)' }}>
                {song.charter || 'SYSTEM'}
              </span>
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
              <>
                <button
                  className={`details-auto-btn ${isAutoPlay ? 'active' : ''}`}
                  onClick={() => {
                    if (playKeycapSound) playKeycapSound();
                    setIsAutoPlay(!isAutoPlay);
                  }}
                >
                  🤖 AUTO {isAutoPlay ? 'ON' : 'OFF'}
                </button>

                <button
                  className="details-auto-btn"
                  style={{ borderColor: 'var(--neon-magenta)', color: 'var(--neon-magenta)' }}
                  onClick={() => {
                    if (playKeycapSound) playKeycapSound();
                    if (onOpenEditor) onOpenEditor();
                  }}
                >
                  🎛️ STUDIO
                </button>
              </>
            )}
          </div>

          {/* ⚠️ DEBUG ONLY: CUSTOM CHART TEST (Conditioned by debugMode) */}
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
        </div>
      </div>
    </div>
  );
}

export default SongDetailsScreen;
