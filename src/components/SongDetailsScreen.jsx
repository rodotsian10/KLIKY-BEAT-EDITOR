import React from 'react';
import './SongDetailsScreen.css';

function SongDetailsScreen({ 
  song, 
  noteSpeed, 
  setNoteSpeed, 
  onBack, 
  onPlay,
  playKeycapSound
}) {
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
        onClick={() => onPlay(song)}
        style={{ width: '100%', maxWidth: '280px', margin: '0 auto' }}
      >
        PLAY NOW
      </button>
    </div>
  );
}

export default SongDetailsScreen;
