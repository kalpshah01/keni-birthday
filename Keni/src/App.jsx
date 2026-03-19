import { useState, useEffect, useRef, useCallback } from 'react';
import ColorReveal from './components/ColorReveal';
import HeartsBackground from './components/HeartsBackground';
import VoiceControl from './components/VoiceControl';
import FinalReveal from './components/FinalReveal';
import './App.css';

// ── All colors (heartHex = color for hearts overlay, ensures contrast) ─────
const COLORS = [
  { name:'red',    hex:'#ff4d4d', btnColor:'#ff2d55', heartHex:'#ffb3ba', bg:'linear-gradient(135deg,#ff2d55 0%,#ff6b6b 50%,#ffb3ba 100%)', image:'/images/red.jpeg',    emoji:'❤️',  message:'❤️ Red — bold, fearless, and beautiful. You are a true fighter, Keni! 🌹' },
 
  { name:'yellow', hex:'#ffd93d', btnColor:'#e6b800', heartHex:'#ffe066', bg:'linear-gradient(135deg,#f7c948 0%,#ffd700 50%,#fff3a3 100%)', image:'/images/yellow.jpeg', emoji:'🌟',  message:'🌟 Yellow — bright like your smile. Hardworking, humble, always shining! 🌻' },
 
  { name:'blue',   hex:'#4d79ff', btnColor:'#2d7fff', heartHex:'#a8d8ff', bg:'linear-gradient(135deg,#2d7fff 0%,#00c6fb 50%,#a8d8ff 100%)', image:'/images/blue.jpeg',   emoji:'💙',  message:'💙 Blue — calm and wonderful. Your quiet strength inspires everyone! 🫐' },
  { name:'purple', hex:'#9b59b6', btnColor:'#7f00ff', heartHex:'#ddb6ff', bg:'linear-gradient(135deg,#7f00ff 0%,#a855f7 50%,#ddb6ff 100%)', image:'/images/purple.jpeg', emoji:'💜',  message:'💜 Purple — royal and magical. Grace and dignity every single day! ✨' },
  // ── Black & White: placeholder SVGs until real photos are added ─────────
  { name:'green',  hex:'#26de81', btnColor:'#11998e', heartHex:'#80ffbb', bg:'linear-gradient(135deg,#11998e 0%,#38ef7d 50%,#b7f5d8 100%)', image:'/images/greens1.jpeg',  emoji:'💚',  message:'💚 Green — always growing. Every challenge is an opportunity for you! 🍀' },
  { name:'black',  hex:'#1a1a2e', btnColor:'#333366', heartHex:'#d0c0ff', bg:'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)', image:'/images/black.jpeg',  emoji:'🖤',  message:'🖤 Black — mysterious and elegant. Like the night sky that holds all the stars! 🌙' },
  { name:'white',  hex:'#c8b8e8', btnColor:'#9080c0', heartHex:'#9080c0', bg:'linear-gradient(135deg,#f8f9fa 0%,#e9ecef 50%,#dee2e6 100%)', image:'/images/white.jpeg',  emoji:'🤍',  message:'🤍 White — pure and graceful. Like fresh snow that blankets everything in beauty! ⭐' },
  { name:'orange', hex:'#ff9f43', btnColor:'#f7971e', heartHex:'#ffd18a', bg:'linear-gradient(135deg,#f7971e 0%,#ff6a00 50%,#ffd18a 100%)', image:'/images/orange.jpeg', emoji:'🧡',  message:'🧡 Orange — warm and radiant. Your energy lights up every room! 🌼' },
  {name:'silver', hex:'#bdc3c7', btnColor:'#7f8c8d', heartHex:'#ecf0f1', bg:'linear-gradient(135deg,#7f8c8d 0%,#bdc3c7 50%,#ecf0f1 100%)', image:'/images/sliver.jpeg', emoji:'⚪', message:'⚪ Silver — sleek and shining. Like the moonlight that dances on the water! 🌊' },
  { name:'pink',   hex:'#ff66b2', btnColor:'#f953c6', heartHex:'#ffd6e8', bg:'linear-gradient(135deg,#f953c6 0%,#ff85b3 50%,#ffd6e8 100%)', image:'/images/pink.jpeg',   emoji:'🩷',  message:'🩷 Pink — sweet and lovely. Saving the best for last, just like you! 🌸' },
];

// ── Auto-sequence (follows song order, black & white trigger missing card)
// red → orange → yellow → green → blue → purple → black → white → pink (STOP)
const SEQUENCE = ['red','yellow','blue','purple','green','black','white','orange','pink'];

const colorByName = n => COLORS.find(c => c.name === n);
const INTERVAL_MS =4100;

export default function App() {
  const [phase,           setPhase]           = useState('start');
  const [displayColor,    setDisplayColor]    = useState(colorByName('red'));
  const [seqIndex,        setSeqIndex]        = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHighlighting,  setIsHighlighting]  = useState(false);
  const [missingColor,    setMissingColor]    = useState(null); // unknown in main screen
  const [startMissing,    setStartMissing]    = useState(null); // unknown on start screen
  const [musicStarted,    setMusicStarted]    = useState(false);

  const audioRef       = useRef(null);
  const autoTimerRef   = useRef(null);
  const autoRestartRef = useRef(null);
  const highlightRef   = useRef(null);
  const seqIdxRef      = useRef(0);
  const musicPlayedRef = useRef(false);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const stopAuto = useCallback(() => {
    clearInterval(autoTimerRef.current);
    clearTimeout(autoRestartRef.current);
    autoTimerRef.current = null;
  }, []);

  const flash = useCallback(() => {
    setIsHighlighting(true);
    clearTimeout(highlightRef.current);
    highlightRef.current = setTimeout(() => setIsHighlighting(false), 3000);
  }, []);

  const applyColor = useCallback((color, newSeqIdx) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setDisplayColor(color);
      if (newSeqIdx !== undefined && newSeqIdx >= 0) {
        seqIdxRef.current = newSeqIdx;
        setSeqIndex(newSeqIdx);
      }
      setMissingColor(null);
      setIsTransitioning(false);
      flash();
    }, 400);
  }, [flash]);

  // ── Auto-advance: linear, STOPS at pink (last in SEQUENCE) ────────────────
  const doAutoStep = useCallback(() => {
    const next = seqIdxRef.current + 1;

    // Already at or passed the end — stop
    if (next >= SEQUENCE.length) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
      return;
    }

    seqIdxRef.current = next;
    setSeqIndex(next);

    const colorName = SEQUENCE[next];
    const color = colorByName(colorName);

    if (color) {
      // Valid color with image
      setDisplayColor(color);
      setMissingColor(null);
    } else {
      // No image (black / white) → show missing card on background of last valid color
      setMissingColor(colorName);
    }
    flash();

    // Stop auto when reaching last step (pink)
    if (next === SEQUENCE.length - 1) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, [flash]);

  const startAuto = useCallback(() => {
    stopAuto();
    autoTimerRef.current = setInterval(doAutoStep, INTERVAL_MS);
  }, [stopAuto, doAutoStep]);

  const scheduleRestart = useCallback(() => {
    stopAuto();
    clearTimeout(autoRestartRef.current);
    // Only restart auto if not at the last step
    autoRestartRef.current = setTimeout(() => {
      if (seqIdxRef.current < SEQUENCE.length - 1) startAuto();
    }, INTERVAL_MS);
  }, [stopAuto, startAuto]);

  // ── Show any color by name ─────────────────────────────────────────────────
  const showColor = useCallback((colorName) => {
    const color = colorByName(colorName);
    if (!color) {
      // No image → missing card
      setMissingColor(colorName);
      scheduleRestart();
      return;
    }
    const si = SEQUENCE.indexOf(colorName);
    applyColor(color, si >= 0 ? si : undefined);
    scheduleRestart();
  }, [applyColor, scheduleRestart]);

  // ── Start experience ──────────────────────────────────────────────────────
  const startExperience = useCallback((colorName = 'red') => {
    if (!musicPlayedRef.current) {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 32;
        audio.volume = 0.3;
        audio.play().catch(() => {});
        musicPlayedRef.current = true;
        setMusicStarted(true);
      }
    }
    const color = colorByName(colorName) || colorByName('red');
    const si = SEQUENCE.indexOf(color.name);
    const idx = si >= 0 ? si : 0;
    seqIdxRef.current = idx;
    setSeqIndex(idx);
    setDisplayColor(color);
    setMissingColor(null);
    setPhase('main');
    flash();
    startAuto();
  }, [flash, startAuto]);

  // ── Voice handler ─────────────────────────────────────────────────────────
  const handleVoice = useCallback((spoken) => {
    const lower   = spoken.toLowerCase().trim();
    const matched = COLORS.find(c => lower.includes(c.name));

    if (phase === 'start') {
      if (matched) {
        startExperience(matched.name);
      } else {
        // Unknown color on start screen — show message, stay on start
        const stops   = new Set(['a','the','in','is','my','i','show','me','want','please','can','you']);
        const attempt = lower.split(/\s+/).find(w => w.length >= 2 && !stops.has(w)) || lower;
        setStartMissing(attempt);
        setTimeout(() => setStartMissing(null), 6000);
      }
      return;
    }
    if (phase !== 'main') return;

    if (matched) {
      showColor(matched.name);
    } else {
      const stops   = new Set(['a','the','in','is','my','i','show','me','want','please','can','you']);
      const attempt = lower.split(/\s+/).find(w => w.length >= 2 && !stops.has(w)) || lower;
      setMissingColor(attempt);
      scheduleRestart();
    }
  }, [phase, startExperience, showColor, scheduleRestart]);

  // ── Next button ───────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (phase !== 'main') return;
    setMissingColor(null);
    const currentSeq = seqIdxRef.current;
    if (currentSeq >= SEQUENCE.length - 1) {
      stopAuto(); setPhase('done'); return;
    }
    showColor(SEQUENCE[currentSeq + 1]);
  }, [phase, showColor, stopAuto]);

  // ── Color buttons ─────────────────────────────────────────────────────────
  const handleBtn = useCallback((name) => {
    if (phase === 'start') startExperience(name);
    else if (phase === 'main') { setMissingColor(null); showColor(name); }
  }, [phase, startExperience, showColor]);

  useEffect(() => () => {
    clearInterval(autoTimerRef.current);
    clearTimeout(autoRestartRef.current);
    clearTimeout(highlightRef.current);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="app-root" style={{ background: colorByName('pink').bg }}>
        <audio ref={audioRef} loop preload="auto"><source src="/music/color.mp3" type="audio/mpeg" /></audio>
        <HeartsBackground themeHex={colorByName('pink').hex} />
        <div className="sparkles">{[...Array(18)].map((_,i)=><span key={i} className="sparkle" style={{'--i':i}}/>)}</div>
        <FinalReveal />
      </div>
    );
  }

  if (phase === 'start') {
    return (
      <div className="app-root start-screen">
        <audio ref={audioRef} loop preload="auto"><source src="/music/color.mp3" type="audio/mpeg" /></audio>
        <HeartsBackground themeHex="#ff66b2" />
        <div className="start-content">
          <div className="start-cake">🎂</div>
          <h1 className="start-title">Happy Birthday, Keni! 🌟</h1>
          <p className="start-sub">Say a color… or click one below 🎤</p>
          <VoiceControl key={startMissing || 'idle'} onResult={handleVoice} autoStart />

          {/* Missing color message on start screen */}
          {startMissing && (
            <div className="start-missing">
              <span className="start-missing-moon">🌙</span>
              <p>
                Birthday girl, you look so beautiful in{' '}
                <strong>"{startMissing}"</strong> 🤍<br/>
                We forgot to click your picture, sorry! 😅<br/>
                Next time we must capture the moon in that dress —{' '}
                <strong>"{startMissing}"</strong> 🌙✨<br/>
                <span className="start-missing-hint">Say a color we have to begin! 🎤</span>
              </p>
            </div>
          )}

          <div className="start-colors">
            {COLORS.map(c=>(
              <button key={c.name} className="start-pill" style={{'--pill-hex': c.name==='black'?'#8080ff': c.name==='white'?'#9080c0':c.hex}} onClick={()=>handleBtn(c.name)}>
                <span className="pill-dot" style={{background: c.name==='black'?'#2c2c54':c.name==='white'?'#ddd':c.hex, border: c.name==='white'?'2px solid #ccc':'none'}}/>
                <span className="pill-label">{c.name}</span>
              </button>
            ))}
          </div>
          <button className="big-start-btn" onClick={()=>startExperience('red')}>✨ Start the Magic!</button>
        </div>
      </div>
    );
  }

  // MAIN screen
  const isLastStep  = seqIndex >= SEQUENCE.length - 1;
  const heartColor   = missingColor ? '#aaaaaa' : (displayColor.heartHex || displayColor.hex);
  return (
    <div className="app-root main-screen" style={{ background: displayColor.bg }}>
      <audio ref={audioRef} loop preload="auto"><source src="/music/color.mp3" type="audio/mpeg" /></audio>
      <HeartsBackground themeHex={heartColor} isNew={isHighlighting} />
      <div className="sparkles">{[...Array(12)].map((_,i)=><span key={i} className="sparkle" style={{'--i':i}}/>)}</div>

      <div className={`content-wrapper ${isTransitioning ? 'fading' : ''}`}>
        <header className="site-header">
          <div className="header-emoji" key={displayColor.name}>{displayColor.emoji}</div>
          <h1 className="site-title">Happy Birthday Keni 🎂</h1>
          <div className="progress-dots">
            {SEQUENCE.map((name,i) => (
              <span key={name} className={`dot ${i===seqIndex?'active':''} ${i<seqIndex?'seen':''}`}/>
            ))}
          </div>
          <p className="color-counter">{seqIndex+1} / {SEQUENCE.length}</p>
        </header>

        {/* ── Missing-color card — key forces remount each time missingColor changes ── */}
        {missingColor ? (
          <div className="missing-color-card">
            <div className="missing-icon">🌙</div>
            <p className="missing-line1">
              Birthday girl, you look so beautiful in{' '}
              <span className="missing-color-name">"{missingColor}"</span> 🤍
            </p>
            <p className="missing-line2">
              We forgot to click your picture, sorry! 😅<br/>
              Next time we must capture the moon in that dress —{' '}
              <span className="missing-color-name">"{missingColor}"</span> 🌙✨
            </p>
            <p className="missing-hint">🎤 Say any color to jump there…</p>
            {/* key={missingColor} forces a fresh VoiceControl (new recognition) each time */}
            <VoiceControl key={missingColor} onResult={handleVoice} autoStart />
          </div>
        ) : (
          <ColorReveal theme={displayColor} isFading={isTransitioning} isHighlighting={isHighlighting} />
        )}

        {/* Color buttons — photos we have */}
        <div className="color-buttons">
          {COLORS.map(c=>(
            <button key={c.name}
              className={`color-btn ${c.name===displayColor.name && !missingColor?'active':''}`}
              style={{'--btn-color':c.btnColor}} onClick={()=>handleBtn(c.name)} title={c.name}>
              <span className="btn-emoji">{c.emoji}</span>
            </button>
          ))}
        </div>

        {isLastStep ? (
          <button className="next-btn reveal-btn" onClick={()=>{stopAuto();setPhase('done');}}>
            🎁 Open Your Surprise!
          </button>
        ) : (
          <button className="next-btn" onClick={handleNext}>Next Color →</button>
        )}

        {/* Mic only on main (missing card has its own mic) */}
        {!missingColor && <VoiceControl onResult={handleVoice} />}

        <p className="hint-text">
          {musicStarted ? '🎵 Colors by Stella Jang is playing...' : '🎵 Click to start music...'}
        </p>
      </div>
    </div>
  );
}
