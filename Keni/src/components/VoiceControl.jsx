import { useState, useEffect, useRef } from 'react';
import './VoiceControl.css';

export default function VoiceControl({ onResult, autoStart = false }) {
  const [isListening, setIsListening] = useState(false);
  const [supported,   setSupported]   = useState(true);
  const recognitionRef = useRef(null);
  const onResultRef    = useRef(onResult);
  const startTimerRef  = useRef(null);

  // Always keep onResultRef fresh so stale closures don't miss updates
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    const rec = new SR();
    rec.continuous     = false;
    rec.interimResults = false;
    rec.lang           = 'en-US';

    rec.onresult = (e) => {
      const spoken = e.results[0][0].transcript.toLowerCase().trim();
      onResultRef.current(spoken);
      setIsListening(false);
    };
    rec.onend   = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);

    recognitionRef.current = rec;

    if (autoStart) {
      // 350ms delay prevents Chrome blocking when a previous instance just aborted
      startTimerRef.current = setTimeout(() => {
        try { rec.start(); setIsListening(true); } catch (_) {}
      }, 350);
    }

    return () => {
      clearTimeout(startTimerRef.current);
      try { rec.abort(); } catch (_) {}
    };
  }, [autoStart]);

  const toggle = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (isListening) {
      rec.stop();
      setIsListening(false);
    } else {
      try { rec.start(); setIsListening(true); } catch (_) {}
    }
  };

  if (!supported) {
    return <p className="no-voice">🎤 Voice needs Chrome browser.</p>;
  }

  return (
    <button
      className={`mic-btn ${isListening ? 'listening' : ''}`}
      onClick={toggle}
      title={isListening ? 'Listening… click to stop' : 'Click to speak a color'}
    >
      <span className="mic-icon">🎤</span>
      {isListening && (
        <>
          <span className="mic-ring r1" />
          <span className="mic-ring r2" />
          <span className="mic-ring r3" />
        </>
      )}
      <span className="mic-label">{isListening ? 'Listening…' : 'Say a color'}</span>
    </button>
  );
}
