import { useState, useEffect, useRef } from 'react';
import './ColorReveal.css';

export default function ColorReveal({ theme, isFading, isHighlighting }) {
  const [visible, setVisible] = useState(false);
  const [displayedMsg, setDisplayedMsg] = useState('');
  const [typing, setTyping] = useState(false);
  const [animKey, setAnimKey] = useState(0); // forces fresh Ken Burns each color
  const intervalRef = useRef(null);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (isFading) {
      setVisible(false);
      setDisplayedMsg('');
      setTyping(false);
      return;
    }

    setAnimKey(k => k + 1); // restart Ken Burns animation
    const imgTimer = setTimeout(() => setVisible(true), 120);

    let idx = 0;
    const msg = theme.message;
    setDisplayedMsg('');
    setTyping(true);

    const typeTimer = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        idx++;
        setDisplayedMsg(msg.slice(0, idx));
        if (idx >= msg.length) {
          clearInterval(intervalRef.current);
          setTyping(false);
        }
      }, 24);
    }, 450);

    return () => {
      clearTimeout(imgTimer);
      clearTimeout(typeTimer);
      clearInterval(intervalRef.current);
    };
  }, [theme, isFading]);

  return (
    <div className="color-reveal">
      <div className={`photo-frame ${visible ? 'visible' : ''} ${isHighlighting ? 'glow-active' : ''}`}>
        <div className="frame-border" />
        <img
          key={animKey}           /* re-mount forces CSS animation restart */
          src={theme.image}
          alt={`${theme.name} dress`}
          className="theme-photo"
          draggable={false}
        />
        <div className="photo-glow" style={{ '--glow': theme.btnColor }} />
        {isHighlighting && (
          <div className="color-label-badge" style={{ background: theme.btnColor }}>
            {theme.emoji} {theme.name.charAt(0).toUpperCase() + theme.name.slice(1)}
          </div>
        )}
      </div>

      <div className={`message-card ${visible ? 'visible' : ''}`}>
        <p className="wish-text">
          {displayedMsg}
          {typing && <span className="cursor">|</span>}
        </p>
      </div>
    </div>
  );
}
