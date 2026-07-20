import React from 'react';
import './PlaylistScreen.css';

function PlaylistScreen({ 
  songs, 
  selectedSong, 
  onSelectSong, 
  songHighScores, 
  onOpenSettings,
  playKeycapSound
}) {
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
        {songs.map(song => (
          <div 
            className={`song-card ${selectedSong.id === song.id ? 'active' : ''}`}
            key={song.id}
            onClick={() => {
              if (playKeycapSound) playKeycapSound();
              onSelectSong(song);
            }}
          >
            <div className="song-thumbnail-circle"></div>
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
      </div>
    </div>
  );
}

export default PlaylistScreen;
