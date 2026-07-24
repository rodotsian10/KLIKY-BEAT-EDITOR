import React, { useState } from 'react';
import './SettingsModal.css';

const LANE_COLORS = ['cyan', 'magenta', 'yellow', 'green'];
const LANE_NEONS = ['#00ffff', '#ff007f', '#ffff00', '#39ff14'];

function SettingsModal({ 
  bgmVolume, 
  sfxVolume, 
  setBgmVolume, 
  setSfxVolume,
  keyLabels,
  setKeyLabels,
  debugMode,
  setDebugMode,
  onClose,
  playKeycapSound 
}) {
  const [showCopyright, setShowCopyright] = useState(false);

  const handleLabelChange = (index, value) => {
    // Allow max 2 characters
    const trimmed = value.slice(0, 2).toUpperCase();
    const next = [...keyLabels];
    next[index] = trimmed;
    setKeyLabels(next);
  };

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

          <div className="setting-row" style={{ gridColumn: 'span 2', marginTop: '6px' }}>
            <span className="setting-label">🛠️ DEBUG MODE:</span>
            <button 
              className={`debug-toggle-btn ${debugMode ? 'active' : ''}`}
              onClick={() => {
                if (playKeycapSound) playKeycapSound();
                setDebugMode(!debugMode);
              }}
            >
              {debugMode ? 'ON (채보 에디터 테스트 켜짐)' : 'OFF (기본 모드)'}
            </button>
          </div>
        </div>

        {/* Key Label Customization */}
        <div className="settings-group">
          <p className="settings-section-title">⌨️ KEY LABELS</p>
          <div className="key-label-row">
            {keyLabels.map((label, i) => (
              <div key={i} className="key-label-item">
                <div
                  className="key-label-preview"
                  style={{
                    borderColor: LANE_NEONS[i],
                    boxShadow: `0 0 10px ${LANE_NEONS[i]}66`,
                    color: LANE_NEONS[i],
                  }}
                >
                  {label || '·'}
                </div>
                <input
                  className="key-label-input"
                  type="text"
                  maxLength={2}
                  value={label}
                  onChange={(e) => handleLabelChange(i, e.target.value)}
                  onFocus={(e) => e.target.select()}
                  style={{ borderColor: LANE_NEONS[i] }}
                />
                <span className="key-label-hint" style={{ color: LANE_NEONS[i] }}>
                  Lane {i + 1}
                </span>
              </div>
            ))}
          </div>
          <p className="key-label-desc">게임 화면 키캡에 표시될 글자를 변경합니다 (최대 2자)</p>
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
              <div className="copyright-text-box">
                Song: Different Heaven & EH!DE - My Heart [NCS Release]<br />
                Music provided by NoCopyrightSounds.<br />
                Free Download/Stream: <span className="copyright-link">http://ncs.io/myheart</span><br />
                Watch: <span className="copyright-link">http://youtu.be/jK2aIUmmdP4</span>
              </div>
              
              <p className="copyright-item-title" style={{ marginTop: '10px' }}>🔊 KEY SFX CREDIT (타건음 출처)</p>
              <div className="copyright-text-box">
                Mechanical Blue/Brown Switches Sound Pack<br />
                Key SFX 1-10: Custom recorded keyboard audio assets.
              </div>
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
