import { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import './FinalReveal.css';

const HINT_STEPS = [
  { icon: '🎓', title: 'College Days...', text: 'It all started in college — two strangers, completely unexpected. No one planned this friendship.' },
  { icon: '🏸', title: 'A Tournament...', text: 'It was a tournament that brought them together. That one event changed everything and sparked something beautiful.' },
  { icon: '👫', title: "A Best Friend's Push...", text: 'And behind the scenes? Your best friend played a role too — she supported, she nudged, she made it happen. 😄' },
  { icon: '🤝', title: 'An Unexpected Bond...', text: "That unexpected friendship? It grew into something real. And now here we are — celebrating YOU on your birthday! 🎉" },
];

const COLOR_IMAGES = [
  { name: 'Red',    path: '/images/red.png',    emoji: '❤️' },
  { name: 'Orange', path: '/images/orange.png', emoji: '🧡' },
  { name: 'Yellow', path: '/images/yellow.png', emoji: '🌟' },
  { name: 'Green',  path: '/images/green.png',  emoji: '💚' },
  { name: 'Blue',   path: '/images/blue.png',   emoji: '💙' },
  { name: 'Purple', path: '/images/purple.png', emoji: '💜' },
  { name: 'Pink',   path: '/images/pink.png',   emoji: '🩷' },
];

export default function FinalReveal() {
  const [hintStep, setHintStep]       = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [answered, setAnswered]       = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dlDone, setDlDone]           = useState(false);

  const nextHint = () => {
    if (hintStep < HINT_STEPS.length - 1) setHintStep(h => h + 1);
    else setShowQuestion(true);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('Keni_Birthday_Colors');

      // Fetch all 7 images and add to zip
      await Promise.all(
        COLOR_IMAGES.map(async ({ name, path }) => {
          const response = await fetch(path);
          const blob = await response.blob();
          const ext  = path.split('.').pop();
          folder.file(`${name.toLowerCase()}.${ext}`, blob);
        })
      );

      // Add a birthday text note
      const note = COLOR_IMAGES.map(c => `${c.emoji} ${c.name}`).join('\n');
      folder.file('birthday_message.txt',
        `🎂 Happy Birthday, Keni! 🎂\n\nYou've seen all the colors — just like you, each one is unique, beautiful, and full of life. 💕\n\n${note}\n\nMade with ❤️ by someone who started as a stranger in a tournament and became a friend you didn't expect 🎓`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'Keni_Birthday_Memories.zip');
      setDlDone(true);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="final-reveal">
      {/* Confetti ticker */}
      <div className="confetti-row">
        {['🎉','🎂','🌟','💝','🎊','🎈','✨','🥳','🎁','🩷','🫧','🌸'].map((e, i) => (
          <span key={i} className="conf-emoji" style={{ '--di': i }}>{e}</span>
        ))}
      </div>

      <div className="final-header">
        <h1 className="final-title">🎂 Happy Birthday, Keni! 🎂</h1>
        <p className="final-subtitle">
          You've seen all the colors — just like you, each one is unique, beautiful, and full of life. 💕
        </p>
      </div>

      {!showQuestion ? (
        <div className="hint-section">
          <p className="hint-label">🔍 Can you guess who made this for you?</p>
          <div className="hint-card">
            <div className="hint-icon">{HINT_STEPS[hintStep].icon}</div>
            <h3 className="hint-card-title">{HINT_STEPS[hintStep].title}</h3>
            <p className="hint-card-text">{HINT_STEPS[hintStep].text}</p>
          </div>
          <div className="hint-dots">
            {HINT_STEPS.map((_, i) => (
              <span key={i} className={`hdot ${i <= hintStep ? 'active' : ''}`} />
            ))}
          </div>
          <button className="action-btn" onClick={nextHint}>
            {hintStep < HINT_STEPS.length - 1 ? 'Next Hint 👀' : 'Ok I get it! Now what? 😏'}
          </button>
        </div>
      ) : (
        <div className={`question-section ${!answered ? 'appear' : ''}`}>
          <div className="question-card">
            <div className="q-emoji">🤭</div>
            <h2 className="question-text">Ab to bata de... 👀</h2>
            <p className="question-sub">
              Tere <strong>boyfriend</strong> ka naam kya hai? 😏<br />
              Ya phir koi <strong>crush</strong> hai? Koi pasand aata hai? 🫣<br />
              <span className="question-hint">(Birthday pe toh sach bolna padta hai 😂)</span>
            </p>
            {!answered ? (
              <div className="answer-buttons">
                <button className="ans-btn yes-btn" onClick={() => setAnswered('yes')}>Haan hai... 🙈</button>
                <button className="ans-btn no-btn"  onClick={() => setAnswered('no')}>Nahi hai koi 😇</button>
              </div>
            ) : answered === 'yes' ? (
              <div className="answer-reveal">
                <p>💕 Oho!! Toh bata — naam kya hai uska? 😏</p>
                <p className="answer-small">Hum bhi toh jaane... promise secret rakhenge 🤐</p>
              </div>
            ) : (
              <div className="answer-reveal">
                <p>😂 Haan haan, bilkul nahi... 🙄</p>
                <p className="answer-small">Theek hai, birthday enjoy kar! baad me kabhi bata dena. 😄🎂</p>
              </div>
            )}
          </div>

          <p className="final-sign">
            Made with ❤️ by someone who started as a stranger in a tournament<br />
            and became a friend you didn't expect 🎓
          </p>
        </div>
      )}

      {/* ── Download all memories ── */}
      <div className="download-section">
        <p className="download-label">📦 Download all your birthday memories!</p>
        <button
          className={`download-btn ${dlDone ? 'done' : ''}`}
          onClick={handleDownload}
          disabled={downloading || dlDone}
        >
          {downloading ? '⏳ Packing your memories...' : dlDone ? '✅ Downloaded! Enjoy 💕' : '📥 Download All Photos'}
        </button>
        {dlDone && (
          <p className="download-hint">Check your downloads folder for <strong>Keni_Birthday_Memories.zip</strong> 🎁</p>
        )}
      </div>
    </div>
  );
}
