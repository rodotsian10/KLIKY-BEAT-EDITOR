import React, { useState, useEffect, useRef } from 'react';
import Keycap from './Keycap';
import './GamePlayScreen.css';

const KEY_MAP = {
  'd': 0, 'D': 0,
  'f': 1, 'F': 1,
  'j': 2, 'J': 2,
  'k': 3, 'K': 3
};

const KEY_DETAILS_BASE = [
  { key: 'D', color: 'cyan', neon: '#00ffff' },
  { key: 'F', color: 'magenta', neon: '#ff007f' },
  { key: 'J', color: 'yellow', neon: '#ffff00' },
  { key: 'K', color: 'green', neon: '#39ff14' }
];

const BPM = 140;
const BEAT_DURATION = 60 / BPM;

function GamePlayScreen({ 
  song, 
  noteSpeed, 
  audioCtx, 
  bgmVolume, 
  sfxVolume, 
  bgmBuffer, 
  sfxBuffers, 
  keyLabels,
  isAutoPlay,
  isCustomChart,
  playKeycapSound,
  onGameOver,
  onQuit 
}) {
  const KEY_DETAILS = KEY_DETAILS_BASE.map((d, i) => ({
    ...d,
    label: (keyLabels && keyLabels[i]) ? keyLabels[i] : d.key
  }));
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [pressedKeys, setPressedKeys] = useState([false, false, false, false]);
  const [lastJudgment, setLastJudgment] = useState({ text: '', type: '', key: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const judgmentCountsRef = useRef({ perfect: 0, great: 0, good: 0, miss: 0 });
  const lastHapticTimeRef = useRef(0);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 480, height: 600 });

  const bgmSourceRef = useRef(null);
  const bgmGainNodeRef = useRef(null);
  const sfxGainNodeRef = useRef(null);

  const startTimeRef = useRef(0);
  const isPlayingRef = useRef(false);
  const notesRef = useRef([]);
  const particlesRef = useRef([]);
  const animationFrameId = useRef(null);
  
  // Keep track of accumulated playing time for pause offsets
  const pauseTimeRef = useRef(0);
  const accumulatedPlayTimeRef = useRef(0);

  const [isStandby, setIsStandby] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const isEndingRef = useRef(false);
  const chartEndTimeRef = useRef(9999);

  const scoreRef = useRef(0);
  const maxComboRef = useRef(0);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    if (combo > maxCombo) {
      setMaxCombo(combo);
    }
  }, [combo, maxCombo]);

  useEffect(() => {
    maxComboRef.current = maxCombo;
  }, [maxCombo]);

  const playAreaRef = useRef(null);

  // Resize listener observing actual play-area bounds
  useEffect(() => {
    if (playAreaRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          setCanvasSize({ width, height });
        }
      });
      resizeObserver.observe(playAreaRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  // Initialize nodes and start BGM playback
  useEffect(() => {
    if (!audioCtx || !bgmBuffer) return;

    // Reset loop tokens
    isPlayingRef.current = false;
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);

    // Create gain nodes for this session
    const bgmGain = audioCtx.createGain();
    bgmGain.gain.setValueAtTime(bgmVolume, audioCtx.currentTime);
    bgmGain.connect(audioCtx.destination);
    bgmGainNodeRef.current = bgmGain;

    const sfxGain = audioCtx.createGain();
    sfxGain.gain.setValueAtTime(sfxVolume, audioCtx.currentTime);
    sfxGain.connect(audioCtx.destination);
    sfxGainNodeRef.current = sfxGain;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    notesRef.current = initializeNotes();
    particlesRef.current = [];
    accumulatedPlayTimeRef.current = 0;
    pauseTimeRef.current = 0;
    
    let maxTime = 0;
    if (notesRef.current.length > 0) {
      notesRef.current.forEach(n => {
        const endTime = n.time + (n.duration || 0);
        if (endTime > maxTime) maxTime = endTime;
      });
    }
    chartEndTimeRef.current = maxTime > 0 ? maxTime : bgmBuffer.duration - 2.0;
    isEndingRef.current = false;

    // Create source node but wait for standby press to play
    const source = audioCtx.createBufferSource();
    source.buffer = bgmBuffer;
    source.connect(bgmGain);
    bgmSourceRef.current = source;

    // Standby mode is active
    setIsStandby(true);
    setIsStarting(false);
    isPlayingRef.current = true;

    // Start animation frame loop immediately so standby messages render
    animationFrameId.current = requestAnimationFrame(updateGameFrame);

    return () => {
      isPlayingRef.current = false;
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      if (bgmSourceRef.current) {
        try {
          bgmSourceRef.current.stop();
        } catch (e) {}
        bgmSourceRef.current = null;
      }
    };
  }, [audioCtx, bgmBuffer]);

  // Adjust volumes dynamically
  useEffect(() => {
    if (bgmGainNodeRef.current && audioCtx) {
      bgmGainNodeRef.current.gain.setValueAtTime(bgmVolume, audioCtx.currentTime);
    }
  }, [bgmVolume, audioCtx]);

  useEffect(() => {
    if (sfxGainNodeRef.current && audioCtx) {
      sfxGainNodeRef.current.gain.setValueAtTime(sfxVolume, audioCtx.currentTime);
    }
  }, [sfxVolume, audioCtx]);

  // Custom or procedural note initializer
  const initializeNotes = () => {
    console.log("=== initializeNotes ===");
    console.log("Active song object:", song);
    if (song.chart && Array.isArray(song.chart)) {
      console.log(`Custom chart detected! Note count: ${song.chart.length}`);
      const mapped = song.chart.map((note, index) => {
        const timeInSeconds = note.beat * (60 / song.bpm);
        const durationInSeconds = note.durationBeats ? note.durationBeats * (60 / song.bpm) : 0;
        return {
          id: `${note.beat}-${note.lane}-${index}`,
          time: timeInSeconds,
          duration: durationInSeconds,
          lane: note.lane,
          type: note.type || 'short',
          hit: false,
          miss: false,
          hitStart: false,
          hitEnd: false,
          active: false
        };
      });
      console.log("Mapped notes array:", mapped);
      return mapped;
    }
    console.log("No custom chart found. Generating procedural beatmap...");
    return generateBeatmap(bgmBuffer.duration, song.bpm);
  };

  // Chart Generator
  const generateBeatmap = (duration, bpm) => {
    const map = [];
    const beatInterval = 60 / bpm;
    const laneFreeTime = [0, 0, 0, 0];
    const minGap = beatInterval * 0.8;

    const addNote = (time, lane, type = 'short', holdDuration = 0) => {
      if (time < laneFreeTime[lane]) return;
      if (type === 'hold') {
        map.push({
          time,
          duration: holdDuration,
          lane,
          type: 'hold',
          hitStart: false,
          hitEnd: false,
          active: false,
          miss: false
        });
        laneFreeTime[lane] = time + holdDuration + minGap;
      } else {
        map.push({
          time,
          type: 'short',
          lane,
          hit: false,
          miss: false
        });
        laneFreeTime[lane] = time + minGap;
      }
    };

    // Intro
    for (let t = 3.0; t < 15.0; t += beatInterval * 2) {
      addNote(t, Math.floor(Math.random() * 4), 'short');
    }

    // Chorus
    for (let t = 15.0; t < duration - 5; t += beatInterval) {
      const r = Math.random();
      const lane = Math.floor(Math.random() * 4);
      if (r < 0.25) {
        addNote(t, lane, 'hold', beatInterval * 2.0);
      } else if (r < 0.8) {
        addNote(t, lane, 'short');
      } else {
        addNote(t, lane, 'short');
        addNote(t, (lane + 2) % 4, 'short');
      }
    }

    return map.sort((a, b) => a.time - b.time);
  };

  const triggerKeycapAudio = () => {
    if (!audioCtx || sfxBuffers.length === 0) return;
    const randIdx = Math.floor(Math.random() * sfxBuffers.length);
    const buffer = sfxBuffers[randIdx];

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    
    const pitch = 0.95 + Math.random() * 0.1;
    source.playbackRate.setValueAtTime(pitch, audioCtx.currentTime);
    source.connect(sfxGainNodeRef.current);
    source.start(0);
  };

  const spawnParticles = (lane, color, count = 12) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width;
    const height = canvas.height;

    const vanishingPointX = width / 2;
    const y_judgment = height - 15;
    const laneWidthBottom = width * 0.78;
    const laneCenterX = vanishingPointX + (lane - 1.5) * (laneWidthBottom / 4);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      particlesRef.current.push({
        x: laneCenterX,
        y: y_judgment,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (1 + Math.random() * 2),
        life: 1.0,
        decay: 0.04 + Math.random() * 0.04,
        size: 3 + Math.random() * 5,
        color: color
      });
    }
  };

  const getPerspectiveCoords = (timeDiff, lane, visualDuration, width, height) => {
    const vanishingPointX = width / 2;
    const y_top = height * 0.05;
    const y_bottom = height - 10;
    
    const z_raw = timeDiff / visualDuration;
    const Z = z_raw * 3.5 + 1.0; 
    
    const R = 1.0 / (Z * Z);
    const y = y_top + (y_bottom - y_top) * R;
    
    const laneWidthBottom = width * 0.85;
    const currentLaneWidth = laneWidthBottom * R;
    
    const x = vanishingPointX + (lane - 1.5) * (currentLaneWidth / 4);
    
    const sizeScale = R;

    return { x, y, sizeScale };
  };

  const handleKeyPress = (lane) => {
    triggerKeycapAudio();
    
    // Start BGM on first keypress
    if (isStandby) {
      if (audioCtx && bgmSourceRef.current) {
        setIsStandby(false);
        setIsStarting(true);
        const startTime = audioCtx.currentTime + 1.0;
        bgmSourceRef.current.start(startTime);
        startTimeRef.current = startTime;
        isPlayingRef.current = true;
        setTimeout(() => {
          setIsStarting(false);
        }, 1000);
      }
      return;
    }

    if (!isPlayingRef.current || isPaused || countdown !== null || isStarting) return;

    const elapsedTime = getGameTime();
    const laneNotes = notesRef.current.filter(n => n.lane === lane && !n.miss);
    
    const candidates = laneNotes.filter(n => {
      if (n.type === 'hold') return !n.hitStart && Math.abs(n.time - elapsedTime) < 0.28;
      return !n.hit && Math.abs(n.time - elapsedTime) < 0.25;
    });

    if (candidates.length === 0) return;

    const closestNote = candidates.reduce((prev, curr) => {
      return Math.abs(curr.time - elapsedTime) < Math.abs(prev.time - elapsedTime) ? curr : prev;
    });

    const diff = Math.abs(closestNote.time - elapsedTime);
    let judgeText = '';
    let judgeType = '';
    let scoreAdd = 0;

    if (diff <= 0.08) {
      judgeText = 'PERFECT';
      judgeType = 'perfect';
      scoreAdd = 100;
    } else if (diff <= 0.16) {
      judgeText = 'GREAT';
      judgeType = 'great';
      scoreAdd = 70;
    } else if (diff <= 0.25) {
      judgeText = 'GOOD';
      judgeType = 'good';
      scoreAdd = 40;
    }

    if (judgeText) {
      if (closestNote.type === 'hold') {
        closestNote.hitStart = true;
        closestNote.active = true;
        spawnParticles(lane, KEY_DETAILS[lane].neon, 6);
      } else {
        closestNote.hit = true;
        setScore(prev => prev + scoreAdd);
        setCombo(prev => prev + 1);
        setLastJudgment({ text: judgeText, type: judgeType, key: Date.now() });
        judgmentCountsRef.current[judgeType] += 1;
        spawnParticles(lane, KEY_DETAILS[lane].neon);
      }
    }
  };

  const handleKeyRelease = (lane) => {
    if (!isPlayingRef.current || isPaused || countdown !== null) return;

    const elapsedTime = getGameTime();
    const activeHold = notesRef.current.find(n => n.lane === lane && n.type === 'hold' && n.active && !n.hitEnd);
    if (!activeHold) return;

    activeHold.active = false;
    const endTime = activeHold.time + activeHold.duration;
    const diff = Math.abs(endTime - elapsedTime);

    let judgeText = '';
    let judgeType = '';
    let scoreAdd = 0;

    if (diff <= 0.12) {
      judgeText = 'PERFECT';
      judgeType = 'perfect';
      scoreAdd = 100;
    } else if (diff <= 0.22) {
      judgeText = 'GREAT';
      judgeType = 'great';
      scoreAdd = 70;
    } else if (diff <= 0.3) {
      judgeText = 'GOOD';
      judgeType = 'good';
      scoreAdd = 40;
    }

    if (judgeText) {
      activeHold.hitEnd = true;
      activeHold.hit = true;
      setScore(prev => prev + scoreAdd);
      setCombo(prev => prev + 1);
      setLastJudgment({ text: judgeText, type: judgeType, key: Date.now() });
      judgmentCountsRef.current[judgeType] += 1;
      spawnParticles(lane, KEY_DETAILS[lane].neon, 15);
    } else {
      activeHold.miss = true;
      setCombo(0);
      setLastJudgment({ text: 'MISS', type: 'miss', key: Date.now() });
    }
  };

  // Keyboard Event Hooks
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const lane = KEY_MAP[e.key];
      if (lane !== undefined) {
        setPressedKeys(prev => {
          const next = [...prev];
          next[lane] = true;
          return next;
        });
        handleKeyPress(lane);
      }
    };

    const handleKeyUp = (e) => {
      const lane = KEY_MAP[e.key];
      if (lane !== undefined) {
        setPressedKeys(prev => {
          const next = [...prev];
          next[lane] = false;
          return next;
        });
        handleKeyRelease(lane);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [noteSpeed, song, isPaused, countdown, isStandby, isStarting]);

  // Auto-pause when app goes to background (dispatched from App.jsx)
  useEffect(() => {
    const handleAutoPause = () => {
      if (!isPaused && countdown === null && isPlayingRef.current && !isStandby) {
        setIsPaused(true);
        if (audioCtx && audioCtx.state === 'running') {
          audioCtx.suspend();
        }
      }
    };
    window.addEventListener('kliky-auto-pause', handleAutoPause);
    return () => window.removeEventListener('kliky-auto-pause', handleAutoPause);
  }, [isPaused, countdown, isStandby, audioCtx]);

  // Pause BGM and stop game updates
  const handlePause = () => {
    if (isPaused || countdown !== null) return;
    setIsPaused(true);
    
    // Pause audio context to cleanly halt music & Web Audio clocks!
    if (audioCtx && audioCtx.state === 'running') {
      audioCtx.suspend();
    }
  };

  // Start 3-second resume countdown
  const handleResume = () => {
    setIsPaused(false);
    setCountdown(3);
    
    let currentCountdown = 3;
    const interval = setInterval(() => {
      currentCountdown -= 1;
      if (currentCountdown > 0) {
        setCountdown(currentCountdown);
      } else {
        clearInterval(interval);
        setCountdown(null);
        // Resume BGM play cleanly!
        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
      }
    }, 1000);
  };

  // Restarts BGM, cancels active thread frame loops to avoid buildup/duplication
  const handleRestart = () => {
    // 1. Terminate old loop Strictly
    isPlayingRef.current = false;
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    if (bgmSourceRef.current) {
      try {
        bgmSourceRef.current.stop();
      } catch (e) {}
      bgmSourceRef.current = null;
    }

    // 2. Unsuspend AudioContext
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // 3. Reset scores and inputs
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLastJudgment({ text: '', type: '', key: 0 });
    setPressedKeys([false, false, false, false]);
    setIsPaused(false);
    setCountdown(null);

    // 4. Regenerate chart
    notesRef.current = initializeNotes();
    particlesRef.current = [];
    accumulatedPlayTimeRef.current = 0;

    let maxTime = 0;
    if (notesRef.current.length > 0) {
      notesRef.current.forEach(n => {
        const endTime = n.time + (n.duration || 0);
        if (endTime > maxTime) maxTime = endTime;
      });
    }
    chartEndTimeRef.current = maxTime > 0 ? maxTime : bgmBuffer.duration - 2.0;
    isEndingRef.current = false;

    // 5. Fire new BGM source
    const source = audioCtx.createBufferSource();
    source.buffer = bgmBuffer;
    source.connect(bgmGainNodeRef.current);
    bgmSourceRef.current = source;

    setIsStandby(true);
    setIsStarting(false);
    isPlayingRef.current = true;
    
    // Restart animation frame loop cleanly!
    animationFrameId.current = requestAnimationFrame(updateGameFrame);
  };

  const handleQuit = () => {
    // Safely exit
    isPlayingRef.current = false;
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    onQuit();
  };

  const getGameTime = () => {
    if (!audioCtx) return 0;
    return audioCtx.currentTime - startTimeRef.current;
  };

  const updateGameFrameRef = useRef();
  useEffect(() => {
    updateGameFrameRef.current = updateGameFrame;
  });

  // Main game visual renderer
  const updateGameFrame = () => {
    // Do not draw or update coordinates if we terminated or unmounted!
    if (!isPlayingRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvasSize.width;
    const height = canvasSize.height;

    const vanishingPointX = width / 2;
    const y_top = height * 0.05;
    const y_bottom = height - 10;
    const laneWidthBottom = width * 0.85;

    // Render static standby board if waiting for user to start
    if (isStandby) {
      ctx.clearRect(0, 0, width, height);
      
      // Draw background lanes
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(6, 6, 12, 0.75)';
      ctx.beginPath();
      ctx.moveTo(vanishingPointX - 10, y_top);
      ctx.lineTo(vanishingPointX + 10, y_top);
      ctx.lineTo(vanishingPointX + laneWidthBottom/2, y_bottom);
      ctx.lineTo(vanishingPointX - laneWidthBottom/2, y_bottom);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 8;
      ctx.lineWidth = 2;
      for (let i = 0; i <= 4; i++) {
        const x_bottom_line = vanishingPointX + (i - 2) * (laneWidthBottom / 4);
        ctx.strokeStyle = `rgba(0, 255, 255, ${i === 0 || i === 4 ? 0.75 : 0.25})`;
        ctx.shadowColor = '#00ffff';
        ctx.beginPath();
        ctx.moveTo(vanishingPointX, y_top);
        ctx.lineTo(x_bottom_line, y_bottom + 10);
        ctx.stroke();
      }

      ctx.save();
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#ff007f';
      ctx.strokeStyle = '#ff007f';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(vanishingPointX - laneWidthBottom/2, y_bottom);
      ctx.lineTo(vanishingPointX + laneWidthBottom/2, y_bottom);
      ctx.stroke();
      ctx.restore();

      // Flash instruction message
      ctx.save();
      ctx.font = "bold 1.25rem monospace";
      ctx.fillStyle = "rgba(0, 255, 255, " + (0.55 + Math.sin(Date.now() / 120) * 0.4) + ")";
      ctx.textAlign = "center";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#00ffff";
      ctx.fillText("PRESS ANY KEY TO START", vanishingPointX, height * 0.5);
      ctx.restore();

      animationFrameId.current = requestAnimationFrame(() => {
        if (updateGameFrameRef.current) updateGameFrameRef.current();
      });
      return;
    }

    // If paused or counting down, draw current frame statically (do not update notes)
    if (audioCtx.state === 'suspended' || countdown !== null) {
      animationFrameId.current = requestAnimationFrame(() => {
        if (updateGameFrameRef.current) updateGameFrameRef.current();
      });
      return;
    }

    ctx.clearRect(0, 0, width, height);
    const elapsedTime = getGameTime();
    
    // Song fadeout sequence when last note passes judgment line
    if (elapsedTime >= chartEndTimeRef.current + 1.0) {
      if (!isEndingRef.current) {
        isEndingRef.current = true;

        // Smooth 2-second gain fadeout
        if (bgmGainNodeRef.current && audioCtx) {
          try {
            const now = audioCtx.currentTime;
            const currentG = bgmGainNodeRef.current.gain.value;
            bgmGainNodeRef.current.gain.setValueAtTime(currentG, now);
            bgmGainNodeRef.current.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
          } catch (e) {
            try {
              bgmGainNodeRef.current.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2.0);
            } catch (err) {}
          }
        }

        // Wait full 2 seconds for music to fade out, stop source, then switch to ending screen
        setTimeout(() => {
          if (bgmSourceRef.current) {
            try { bgmSourceRef.current.stop(); } catch (e) {}
            bgmSourceRef.current = null;
          }
          isPlayingRef.current = false;
          onGameOver(scoreRef.current, maxComboRef.current, judgmentCountsRef.current, notesRef.current.length);
        }, 2000);
      }
    }

    if (bgmBuffer && elapsedTime >= bgmBuffer.duration + 2.0) {
      isPlayingRef.current = false;
      onGameOver(scoreRef.current, maxComboRef.current, judgmentCountsRef.current, notesRef.current.length);
      return;
    }

    const visualDuration = 5.0 / noteSpeed;

    // 1. Lane background
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(6, 6, 12, 0.75)';
    ctx.beginPath();
    ctx.moveTo(vanishingPointX - 10, y_top);
    ctx.lineTo(vanishingPointX + 10, y_top);
    ctx.lineTo(vanishingPointX + laneWidthBottom/2, y_bottom);
    ctx.lineTo(vanishingPointX - laneWidthBottom/2, y_bottom);
    ctx.closePath();
    ctx.fill();

    // 2. Converging Lane Dividers
    ctx.shadowBlur = 8;
    ctx.lineWidth = 2;
    for (let i = 0; i <= 4; i++) {
      const x_bottom_line = vanishingPointX + (i - 2) * (laneWidthBottom / 4);
      const x_top_line = vanishingPointX;

      ctx.strokeStyle = `rgba(0, 255, 255, ${i === 0 || i === 4 ? 0.75 : 0.25})`;
      ctx.shadowColor = '#00ffff';
      ctx.beginPath();
      ctx.moveTo(x_top_line, y_top);
      ctx.lineTo(x_bottom_line, y_bottom + 10);
      ctx.stroke();
    }

    // 3. Grid line ticks
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.12)';
    const firstTick = Math.ceil(elapsedTime / BEAT_DURATION) * BEAT_DURATION;
    for (let t = firstTick; t < elapsedTime + visualDuration; t += BEAT_DURATION) {
      const timeDiff = t - elapsedTime;
      const z_raw = timeDiff / visualDuration;
      if (z_raw >= 0 && z_raw <= 1.0) {
        const Z = z_raw * 3.5 + 1.0;
        const cy = y_top + (y_bottom - y_top) / (Z * Z);
        const w_at_y = laneWidthBottom / (Z * Z);

        ctx.beginPath();
        ctx.moveTo(vanishingPointX - w_at_y/2, cy);
        ctx.lineTo(vanishingPointX + w_at_y/2, cy);
        ctx.stroke();
      }
    }

    // 4. Glowing Judgment tube (Aligned exactly without offsets)
    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#ff007f';
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(vanishingPointX - laneWidthBottom/2, y_bottom);
    ctx.lineTo(vanishingPointX + laneWidthBottom/2, y_bottom);
    ctx.stroke();
    ctx.restore();

    // 5. Draw hold note paths
    const notes = notesRef.current;
    notes.forEach((note) => {
      if (note.type !== 'hold' || note.hitEnd || note.miss) return;

      const tStart = note.time;
      const tEnd = note.time + note.duration;

      if (tEnd < elapsedTime || tStart > elapsedTime + visualDuration) return;

      const color = KEY_DETAILS[note.lane].neon;
      const segments = 12;
      const segmentPoints = [];

      for (let s = 0; s <= segments; s++) {
        const t = tStart + (tEnd - tStart) * (s / segments);
        const activeTime = note.active ? Math.max(elapsedTime, t) : t;
        const timeDiff = activeTime - elapsedTime;
        if (timeDiff < -0.1 || timeDiff > visualDuration) continue;

        const coords = getPerspectiveCoords(timeDiff, note.lane, visualDuration, width, height);
        const Z = (timeDiff / visualDuration) * 3.5 + 1.0;
        const R = 1.0 / (Z * Z);
        const ribbonWidth = (laneWidthBottom * R / 4) * 0.75;

        segmentPoints.push({
          xLeft: coords.x - ribbonWidth/2,
          xRight: coords.x + ribbonWidth/2,
          y: coords.y
        });
      }

      if (segmentPoints.length > 1) {
        ctx.save();
        ctx.shadowBlur = note.active ? 20 : 8;
        ctx.shadowColor = color;
        ctx.fillStyle = note.active 
          ? `rgba(${note.lane === 0 ? '0, 255, 255' : note.lane === 1 ? '255, 0, 127' : note.lane === 2 ? '255, 255, 0' : '57, 255, 20'}, 0.45)`
          : `rgba(${note.lane === 0 ? '0, 255, 255' : note.lane === 1 ? '255, 0, 127' : note.lane === 2 ? '255, 255, 0' : '57, 255, 20'}, 0.2)`;

        ctx.beginPath();
        ctx.moveTo(segmentPoints[0].xLeft, segmentPoints[0].y);
        for (let s = 1; s < segmentPoints.length; s++) ctx.lineTo(segmentPoints[s].xLeft, segmentPoints[s].y);
        for (let s = segmentPoints.length - 1; s >= 0; s--) ctx.lineTo(segmentPoints[s].xRight, segmentPoints[s].y);
        ctx.closePath();
        ctx.fill();

        ctx.lineWidth = 3;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(segmentPoints[0].xLeft, segmentPoints[0].y);
        for (let s = 1; s < segmentPoints.length; s++) ctx.lineTo(segmentPoints[s].xLeft, segmentPoints[s].y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(segmentPoints[0].xRight, segmentPoints[0].y);
        for (let s = 1; s < segmentPoints.length; s++) ctx.lineTo(segmentPoints[s].xRight, segmentPoints[s].y);
        ctx.stroke();
        ctx.restore();
      }
    });

    // 6. Draw falling notes & process AutoPlay / Miss / Hold Haptics
    notes.forEach((note) => {
      // AUTO PLAY Logic: System auto-hits notes with PERFECT accuracy & depresses keycaps visually
      if (isAutoPlay) {
        if (note.type === 'short' && !note.hit && !note.miss && elapsedTime >= note.time) {
          note.hit = true;
          setScore(prev => prev + 100);
          setCombo(prev => prev + 1);
          setLastJudgment({ text: 'PERFECT', type: 'perfect', key: Date.now() });
          judgmentCountsRef.current.perfect += 1;
          spawnParticles(note.lane, KEY_DETAILS[note.lane].neon);
          triggerKeycapAudio();

          // Visually press and release keycap
          setPressedKeys(prev => {
            const next = [...prev];
            next[note.lane] = true;
            return next;
          });
          const targetLane = note.lane;
          setTimeout(() => {
            setPressedKeys(prev => {
              const next = [...prev];
              next[targetLane] = false;
              return next;
            });
          }, 110);
        } else if (note.type === 'hold') {
          if (!note.hitStart && !note.miss && elapsedTime >= note.time) {
            note.hitStart = true;
            note.active = true;
            spawnParticles(note.lane, KEY_DETAILS[note.lane].neon, 6);
            triggerKeycapAudio();
            
            // Press keycap down during hold
            setPressedKeys(prev => {
              const next = [...prev];
              next[note.lane] = true;
              return next;
            });
          }
          if (note.active && !note.hitEnd && elapsedTime >= note.time + note.duration) {
            note.active = false;
            note.hitEnd = true;
            note.hit = true;
            setScore(prev => prev + 100);
            setCombo(prev => prev + 1);
            setLastJudgment({ text: 'PERFECT', type: 'perfect', key: Date.now() });
            judgmentCountsRef.current.perfect += 1;
            spawnParticles(note.lane, KEY_DETAILS[note.lane].neon, 15);

            // Release keycap at hold end
            setPressedKeys(prev => {
              const next = [...prev];
              next[note.lane] = false;
              return next;
            });
          }
        }
      }

      // Standard Miss Logic (when not auto-play or timing passed)
      if (note.type === 'short') {
        if (!note.hit && !note.miss && elapsedTime - note.time > 0.22) {
          note.miss = true;
          setCombo(0);
          setLastJudgment({ text: 'MISS', type: 'miss', key: Date.now() });
          judgmentCountsRef.current.miss += 1;
        }
      } else {
        if (!note.hitStart && !note.miss && elapsedTime - note.time > 0.22) {
          note.miss = true;
          setCombo(0);
          setLastJudgment({ text: 'MISS', type: 'miss', key: Date.now() });
          judgmentCountsRef.current.miss += 1;
        }
        const endTime = note.time + note.duration;
        if (note.hitStart && !note.hitEnd && !note.miss && elapsedTime - endTime > 0.22) {
          note.miss = true;
          note.active = false;
          setCombo(0);
          setLastJudgment({ text: 'MISS', type: 'miss', key: Date.now() });
          judgmentCountsRef.current.miss += 1;
        }
      }

      if (note.hit || note.miss) return;
      const color = KEY_DETAILS[note.lane].neon;

      if (note.type === 'short') {
        const timeDiff = note.time - elapsedTime;
        if (timeDiff > visualDuration || timeDiff < -0.15) return;

        const { x, y, sizeScale } = getPerspectiveCoords(timeDiff, note.lane, visualDuration, width, height);
        const noteWidth = (width * 0.14) * sizeScale;
        const noteHeight = 14 * sizeScale;

        ctx.save();
        ctx.shadowBlur = 18 * sizeScale;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x - noteWidth/2, y - noteHeight/2, noteWidth, noteHeight, noteHeight/2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.roundRect(x - noteWidth/3, y - noteHeight/3, noteWidth * 0.6, noteHeight/3, noteHeight/6);
        ctx.fill();
        ctx.restore();
      } else {
        if (!note.hitStart) {
          const timeDiff = note.time - elapsedTime;
          if (timeDiff >= -0.15 && timeDiff <= visualDuration) {
            const { x, y, sizeScale } = getPerspectiveCoords(timeDiff, note.lane, visualDuration, width, height);
            const noteWidth = (width * 0.14) * sizeScale;
            const noteHeight = 14 * sizeScale;

            ctx.save();
            ctx.shadowBlur = 15 * sizeScale;
            ctx.shadowColor = color;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(x - noteWidth/2, y - noteHeight/2, noteWidth, noteHeight, noteHeight/2);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2 * sizeScale;
            ctx.stroke();
            ctx.restore();
          }
        }

        const endTime = note.time + note.duration;
        const timeDiffEnd = endTime - elapsedTime;
        if (timeDiffEnd >= -0.15 && timeDiffEnd <= visualDuration) {
          const { x, y, sizeScale } = getPerspectiveCoords(timeDiffEnd, note.lane, visualDuration, width, height);
          const noteWidth = (width * 0.14) * sizeScale;
          const noteHeight = 14 * sizeScale;

          ctx.save();
          ctx.shadowBlur = 15 * sizeScale;
          ctx.shadowColor = color;
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = color;
          ctx.lineWidth = 3 * sizeScale;
          ctx.beginPath();
          ctx.roundRect(x - noteWidth/2, y - noteHeight/2, noteWidth, noteHeight, noteHeight/2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        if (note.active) spawnParticles(note.lane, color, 1);
      }
    });

    // Hold-Note Only Micro Haptic Vibration (Triggers only while holding hold notes in manual play)
    const hasActiveHold = notes.some(n => n.type === 'hold' && n.active && !n.hitEnd);
    if (hasActiveHold && !isAutoPlay) {
      const now = Date.now();
      if (now - lastHapticTimeRef.current > 80) {
        lastHapticTimeRef.current = now;
        try {
          if (navigator.vibrate) {
            navigator.vibrate(20);
          }
        } catch (e) {}
      }
    }

    // 7. Particles
    const particles = particlesRef.current;
    ctx.shadowBlur = 8;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;

    animationFrameId.current = requestAnimationFrame(() => {
      if (updateGameFrameRef.current) updateGameFrameRef.current();
    });
  };

  const handleTouchStartWrapper = (idx, e) => {
    e.preventDefault();
    setPressedKeys(prev => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });
    handleKeyPress(idx);
  };

  const handleTouchEndWrapper = (idx, e) => {
    e.preventDefault();
    setPressedKeys(prev => {
      const next = [...prev];
      next[idx] = false;
      return next;
    });
    handleKeyRelease(idx);
  };

  return (
    <div className="game-container" ref={containerRef}>
      <header className="game-header">
        <div className="title-text">{song.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="score-display">
            {score.toString().padStart(6, '0')}
          </div>
          <button className="pause-btn" onClick={handlePause}>
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="play-area" ref={playAreaRef}>
        <canvas 
          className="game-canvas"
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{ width: canvasSize.width + 'px', height: canvasSize.height + 'px' }}
        />

        {/* Top-Right Neon Combo Display */}
        {combo > 0 && (
          <div className="top-right-combo" key={`combo-${combo}-${Date.now()}`}>
            <span className="combo-num">{combo}</span>
            <span className="combo-lbl">COMBO</span>
          </div>
        )}

        {/* Floating Center Judgment Text */}
        {lastJudgment.text && (
          <div className="judgment-overlay" key={lastJudgment.key}>
            <div className={`judgment-text ${lastJudgment.type}`}>
              {lastJudgment.text}
            </div>
          </div>
        )}
      </main>

      <section className="keyboard-area" style={{ width: `${canvasSize.width * 0.85}px` }}>
        {KEY_DETAILS.map((kd, idx) => (
          <Keycap
            key={kd.key}
            label={kd.label}
            color={kd.color}
            pressed={pressedKeys[idx]}
            onTouchStart={(e) => handleTouchStartWrapper(idx, e)}
            onTouchEnd={(e) => handleTouchEndWrapper(idx, e)}
            onMouseDown={(e) => {
              e.preventDefault();
              setPressedKeys(prev => {
                const next = [...prev];
                next[idx] = true;
                return next;
              });
              handleKeyPress(idx);
            }}
            onMouseUp={() => {
              setPressedKeys(prev => {
                const next = [...prev];
                next[idx] = false;
                return next;
              });
              handleKeyRelease(idx);
            }}
            onMouseLeave={() => {
              if (pressedKeys[idx]) {
                setPressedKeys(prev => {
                  const next = [...prev];
                  next[idx] = false;
                  return next;
                });
                handleKeyRelease(idx);
              }
            }}
          />
        ))}
      </section>

      {/* OVERLAY: PAUSE SCREEN */}
      {isPaused && (
        <div className="overlay-screen">
          <h2 className="menu-title" style={{ color: 'var(--neon-magenta)' }}>PAUSED</h2>
          <p className="menu-subtitle">{song.title}</p>
          
          <button className="button-neon" onClick={() => { if (playKeycapSound) playKeycapSound(); handleResume(); }}>
            RESUME
          </button>
          
          <button className="button-neon" style={{ borderColor: 'var(--neon-cyan)', boxShadow: '0 0 15px var(--neon-cyan-glow)' }} onClick={() => { if (playKeycapSound) playKeycapSound(); handleRestart(); }}>
            RESTART
          </button>
          
          <button 
            className="button-neon" 
            style={{ borderColor: 'var(--neon-magenta)', boxShadow: '0 0 15px var(--neon-magenta-glow)' }}
            onClick={() => { if (playKeycapSound) playKeycapSound(); handleQuit(); }}
          >
            QUIT GAME
          </button>
        </div>
      )}

      {/* OVERLAY: RESUME COUNTDOWN */}
      {countdown !== null && (
        <div className="countdown-overlay">
          <div className="countdown-num" key={countdown}>
            {countdown}
          </div>
        </div>
      )}
    </div>
  );
}

export default GamePlayScreen;
