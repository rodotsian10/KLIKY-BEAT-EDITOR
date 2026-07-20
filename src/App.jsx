import React, { useState, useEffect, useRef } from 'react';
import IntroScreen from './components/IntroScreen';
import PlaylistScreen from './components/PlaylistScreen';
import SongDetailsScreen from './components/SongDetailsScreen';
import GamePlayScreen from './components/GamePlayScreen';
import SettingsModal from './components/SettingsModal';
import './App.css';

const SONGS = [
  {
    id: 'my-heart',
    title: 'My Heart',
    artist: 'Different Heaven, EH!DE',
    path: '/my_heart.mp3',
    bpm: 140,
    duration: '2:01',
    difficulty: 'HARD',
    highScoreKey: 'high_score_my_heart'
  }
];

const KEY_SOUNDS = Array.from({ length: 10 }, (_, i) => `/key${i + 1}.mp3`);

function App() {
  // Navigation & Screens state: INTRO, PLAYLIST, DETAILS, LOADING, PLAYING, GAME_OVER
  const [gameState, setGameState] = useState('INTRO');
  const [selectedSong, setSelectedSong] = useState(SONGS[0]);
  const [showSettings, setShowSettings] = useState(false);
  
  // Game metrics
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [songHighScores, setSongHighScores] = useState({});
  
  // Modifiers
  const [noteSpeed, setNoteSpeed] = useState(4.0);
  const [bgmVolume, setBgmVolume] = useState(0.7);
  const [sfxVolume, setSfxVolume] = useState(0.8);
  const [loadProgress, setLoadProgress] = useState(0);

  // Audio Cache Refs
  const audioCtxRef = useRef(null);
  const loadedBgmBuffersRef = useRef({}); // Caches loaded bgm buffers
  const sfxBuffersRef = useRef([]); // Caches loaded key click sfx buffers
  const bgmBufferRef = useRef(null); // Active BGM buffer for gameplay session

  // Intro Screen timeout (2s)
  useEffect(() => {
    if (gameState === 'INTRO') {
      const timer = setTimeout(() => {
        setGameState('PLAYLIST');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Load High Scores on mount and status change
  useEffect(() => {
    const scores = {};
    SONGS.forEach(song => {
      scores[song.id] = parseInt(localStorage.getItem(song.highScoreKey) || '0', 10);
    });
    setSongHighScores(scores);
  }, [gameState]);

  const setupAudioContext = () => {
    if (audioCtxRef.current) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtxRef.current = new AudioContextClass();
  };

  // Preload audio assets
  const loadSongAssets = async (song) => {
    setupAudioContext();
    const ctx = audioCtxRef.current;
    
    setGameState('LOADING');
    setLoadProgress(10);

    try {
      // Check cache for BGM
      let bgmBuffer = loadedBgmBuffersRef.current[song.id];
      if (!bgmBuffer) {
        const response = await fetch(encodeURI(song.path));
        if (!response.ok) throw new Error('BGM failed to fetch');
        const arrayBuf = await response.arrayBuffer();
        bgmBuffer = await ctx.decodeAudioData(arrayBuf);
        loadedBgmBuffersRef.current[song.id] = bgmBuffer;
      }
      bgmBufferRef.current = bgmBuffer;
      setLoadProgress(60);

      // Load Keycap SFX
      if (sfxBuffersRef.current.length === 0) {
        const sfxBuffers = [];
        for (let i = 0; i < KEY_SOUNDS.length; i++) {
          const res = await fetch(KEY_SOUNDS[i]);
          if (!res.ok) throw new Error(`SFX ${i} failed`);
          const arrayBuf = await res.arrayBuffer();
          const decoded = await ctx.decodeAudioData(arrayBuf);
          sfxBuffers.push(decoded);
          setLoadProgress(Math.floor(60 + (i / KEY_SOUNDS.length) * 40));
        }
        sfxBuffersRef.current = sfxBuffers;
      }

      setLoadProgress(100);
      setTimeout(() => {
        setGameState('PLAYING');
      }, 400);
    } catch (e) {
      console.error(e);
      alert('오디오를 로드하는 데 실패했습니다.');
      setGameState('PLAYLIST');
    }
  };

  const handleResetHighscores = () => {
    SONGS.forEach(song => {
      localStorage.removeItem(song.highScoreKey);
    });
    setSongHighScores({ 'my-heart': 0 });
    alert('모든 하이스코어가 초기화되었습니다.');
  };

  const playKeycapSound = () => {
    setupAudioContext();
    if (!audioCtxRef.current || sfxBuffersRef.current.length === 0) return;
    const randIdx = Math.floor(Math.random() * sfxBuffersRef.current.length);
    const buffer = sfxBuffersRef.current[randIdx];
    const source = audioCtxRef.current.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.setValueAtTime(0.95 + Math.random() * 0.1, audioCtxRef.current.currentTime);
    
    // Quick gain play
    const gain = audioCtxRef.current.createGain();
    gain.gain.setValueAtTime(sfxVolume, audioCtxRef.current.currentTime);
    source.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    source.start(0);
  };

  return (
    <div className="game-container">
      {/* 1. INTRO SCREEN */}
      {gameState === 'INTRO' && <IntroScreen />}

      {/* 2. PLAYLIST SCREEN */}
      {gameState === 'PLAYLIST' && (
        <PlaylistScreen 
          songs={SONGS}
          selectedSong={selectedSong}
          onSelectSong={(song) => {
            setSelectedSong(song);
            setGameState('DETAILS');
          }}
          songHighScores={songHighScores}
          onOpenSettings={() => setShowSettings(true)}
          playKeycapSound={playKeycapSound}
        />
      )}

      {/* 3. SONG DETAILS SCREEN */}
      {gameState === 'DETAILS' && (
        <SongDetailsScreen 
          song={selectedSong}
          noteSpeed={noteSpeed}
          setNoteSpeed={setNoteSpeed}
          onBack={() => setGameState('PLAYLIST')}
          onPlay={loadSongAssets}
          playKeycapSound={playKeycapSound}
        />
      )}

      {/* 4. TRANSITIONAL LOADING SCREEN */}
      {gameState === 'LOADING' && (
        <div className="overlay-screen">
          <div className="spinner"></div>
          <h2 style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', letterSpacing: '2px' }}>
            PREPARING BEATMAP
          </h2>
          <div className="loading-progress-bar-container">
            <div className="loading-progress-bar-fill" style={{ width: `${loadProgress}%` }}></div>
          </div>
          <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>
            {loadProgress}%
          </p>
        </div>
      )}

      {/* 5. IN-GAME LAYOUT */}
      {gameState === 'PLAYING' && (
        <GamePlayScreen 
          song={selectedSong}
          noteSpeed={noteSpeed}
          audioCtx={audioCtxRef.current}
          bgmVolume={bgmVolume}
          sfxVolume={sfxVolume}
          bgmBuffer={bgmBufferRef.current}
          sfxBuffers={sfxBuffersRef.current}
          onGameOver={(finalScore, finalMaxCombo) => {
            setScore(finalScore);
            setMaxCombo(finalMaxCombo);
            
            // Save local highscore if needed
            const currentHigh = songHighScores[selectedSong.id] || 0;
            if (finalScore > currentHigh) {
              localStorage.setItem(selectedSong.highScoreKey, finalScore.toString());
            }

            setGameState('GAME_OVER');
          }}
          onQuit={() => setGameState('PLAYLIST')}
        />
      )}

      {/* 6. GAME OVER SCREEN */}
      {gameState === 'GAME_OVER' && (
        <div className="overlay-screen">
          <h1 className="menu-title" style={{ color: 'var(--neon-green)' }}>FINISH!</h1>
          
          <div style={{ margin: '30px 0', fontSize: '1.4rem' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '8px' }}>
              {selectedSong.title}
            </div>
            <div>SCORE: <span style={{ color: '#fff', fontWeight: 'bold' }}>{score}</span></div>
            <div>MAX COMBO: <span style={{ color: '#00ffff', fontWeight: 'bold' }}>{maxCombo}</span></div>
          </div>

          <button className="button-neon" onClick={() => loadSongAssets(selectedSong)}>
            PLAY AGAIN
          </button>
          
          <button 
            className="button-neon" 
            style={{ borderColor: 'var(--neon-magenta)', boxShadow: '0 0 15px var(--neon-magenta-glow)' }}
            onClick={() => setGameState('PLAYLIST')}
          >
            SONG SELECT
          </button>
        </div>
      )}

      {/* GLOBAL SETTINGS POPUP MODAL */}
      {showSettings && (
        <SettingsModal 
          bgmVolume={bgmVolume}
          sfxVolume={sfxVolume}
          setBgmVolume={setBgmVolume}
          setSfxVolume={setSfxVolume}
          onResetHighscores={handleResetHighscores}
          onClose={() => setShowSettings(false)}
          playKeycapSound={playKeycapSound}
        />
      )}
    </div>
  );
}

export default App;
