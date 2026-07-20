import React from 'react';
import './IntroScreen.css';

function IntroScreen() {
  return (
    <div className="intro-screen">
      <div className="intro-logo-container">
        <svg 
          className="intro-switch-svg"
          width="80" 
          height="80" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="var(--neon-cyan)" 
          strokeWidth="1.5"
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <rect x="2" y="4" width="20" height="16" rx="3" />
          <path d="M6 8h12M6 12h12M6 16h8" />
        </svg>
        <h1 className="intro-title">NEON KEYCAP</h1>
      </div>
    </div>
  );
}

export default IntroScreen;
