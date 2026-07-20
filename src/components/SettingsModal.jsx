import React from 'react';
import './SettingsModal.css';

function SettingsModal({ 
  bgmVolume, 
  sfxVolume, 
  setBgmVolume, 
  setSfxVolume, 
  onResetHighscores, 
  onClose,
  playKeycapSound 
}) {
  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="settings-title">SETTINGS</h3>
        
        <div className="settings-group">
          <div className="setting-row">
            <span className="setting-label">BGM VOL:</span>
            <input 
              type="range" 
              min="0.0" 
              max="1.0" 
              step="0.1" 
              value={bgmVolume} 
              onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
              className="setting-slider"
            />
            <span className="setting-value">{Math.round(bgmVolume * 100)}%</span>
          </div>

          <div className="setting-row">
            <span className="setting-label">KEY VOL:</span>
            <input 
              type="range" 
              min="0.0" 
              max="1.0" 
              step="0.1" 
              value={sfxVolume} 
              onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
              className="setting-slider"
            />
            <span className="setting-value">{Math.round(sfxVolume * 100)}%</span>
          </div>
        </div>

        <button 
          className="button-neon" 
          style={{ borderColor: 'var(--neon-magenta)', boxShadow: '0 0 15px var(--neon-magenta-glow)', marginTop: '30px', fontSize: '0.9rem', padding: '10px 24px' }}
          onClick={onResetHighscores}
        >
          RESET HIGHSCORES
        </button>

        <button 
          className="button-neon" 
          style={{ marginTop: '20px', fontSize: '0.9rem', padding: '10px 30px' }}
          onClick={() => { if(playKeycapSound) playKeycapSound(); onClose(); }}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}

export default SettingsModal;
