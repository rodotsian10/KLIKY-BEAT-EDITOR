import React, { useState } from 'react';
import './SettingsModal.css';

function SettingsModal({ 
  bgmVolume, 
  sfxVolume, 
  setBgmVolume, 
  setSfxVolume, 
  onClose,
  playKeycapSound 
}) {
  const [showCopyright, setShowCopyright] = useState(false);

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

        {/* Copyright Expandable Disclosure Section */}
        <div className="settings-copyright-section">
          <button 
            className="copyright-toggle-btn"
            onClick={() => {
              if (playKeycapSound) playKeycapSound();
              setShowCopyright(!showCopyright);
            }}
          >
            <span>📜 COPYRIGHT CREDITS</span>
            <span style={{ fontSize: '0.8rem' }}>{showCopyright ? '▲ CLOSE' : '▼ OPEN'}</span>
          </button>
          
          {showCopyright && (
            <div className="copyright-content-box">
              <p className="copyright-item-title">🎵 BGM CREDIT (음원 출처)</p>
              <textarea 
                className="copyright-textarea" 
                defaultValue={"Song: Different Heaven & EH!DE - My Heart [NCS Release]\nMusic provided by NoCopyrightSounds.\nFree Download/Stream: http://ncs.io/myheart\nWatch: http://youtu.be/jK2aIUmmdP4"}
                rows={4}
              />
              
              <p className="copyright-item-title">🔊 KEY SFX CREDIT (타건음 출처)</p>
              <textarea 
                className="copyright-textarea" 
                defaultValue="Mechanical Blue/Brown Switches Sound Pack&#10;Key SFX 1-10: Custom recorded keyboard audio assets."
                rows={3}
              />
            </div>
          )}
        </div>

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
