import React from 'react';
import './Keycap.css';

function Keycap({ 
  label, 
  color, 
  pressed, 
  onTouchStart, 
  onTouchEnd, 
  onMouseDown, 
  onMouseUp, 
  onMouseLeave 
}) {
  return (
    <div className="keycap-container">
      <div 
        className={`keycap ${color} ${pressed ? 'pressed' : ''}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        <div className="keycap-dish">
          <span className="keycap-legend">{label}</span>
        </div>
        <div className="keycap-underglow"></div>
      </div>
    </div>
  );
}

export default Keycap;
