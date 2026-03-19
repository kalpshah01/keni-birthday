import { useMemo } from 'react';
import './HeartsBackground.css';

const COUNT = 12;

export default function HeartsBackground({ themeHex = '#ff66b2', isNew = false }) {
  const hearts = useMemo(() =>
    Array.from({ length: COUNT }, (_, i) => ({
      id: i,
      fromTop: i < COUNT / 2,          // first 6 fall DOWN, last 6 rise UP
      left: ((i * 8.7 + 4) % 90),
      size: 14 + (i * 5) % 18,
      delay: (i * 0.55) % 5,
      duration: 5 + (i * 0.4) % 3,
      opacity: 0.15 + (i * 0.009) % 0.12,
    })),
  []);

  return (
    <div className="hearts-bg" aria-hidden="true">
      {hearts.map(h => (
        <span
          key={h.id}
          className={`heart ${h.fromTop ? 'heart-down' : 'heart-up'} ${isNew ? 'heart-burst' : ''}`}
          style={{
            left: `${h.left}%`,
            fontSize: `${h.size}px`,
            color: themeHex,
            opacity: h.opacity,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
            '--burst-delay': `${h.delay * 0.3}s`,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}
