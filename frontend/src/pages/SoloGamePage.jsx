import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleLineChart from '../components/SimpleLineChart';

/* ─── Design tokens ──────────────────────────────────────── */
const BG      = '#090d16';
const CARD    = '#111827';
const BORDER  = 'rgba(255,255,255,0.06)';
const PURPLE  = '#8B5CF6';
const BLUE    = '#38BDF8';
const GREEN   = '#22C55E';
const TEXT1   = '#F3F4F6';
const TEXT2   = '#94A3B8';
const TRACK   = '#1a2234';

/* ─── Icons ──────────────────────────────────────────────── */
const IcoSpeed  = () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 12 8 8"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>;
const IcoTarget = () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IcoClock  = () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoKbd    = () => <svg width="32" height="32" fill="none" stroke={TEXT2} strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/></svg>;
const IcoHome   = () => <svg width="15" height="15" fill="none" stroke={TEXT2} strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IcoFlag   = () => <svg width="14" height="14" fill="none" stroke={TEXT2} strokeWidth="2" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;

/* ─── Shared card style ──────────────────────────────────── */
const cardSx = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16 };

const Divider = () => <div style={{ width: 1, height: 44, background: BORDER, flexShrink: 0, margin: '0 28px' }} />;

const StatSection = ({ icon, label, value, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
    <div style={{ color, opacity: 0.9 }}>{icon}</div>
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', color: TEXT2, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{value}</p>
    </div>
  </div>
);

// ─── Offline Text Generation ──────────────────────────────────────
const paragraphs = [
  "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet at least once, making it a perfect typing test.",
  "Programming is like writing a book. You start with a blank page, add characters one at a time, and hope it all makes sense when you are done.",
  "The best way to predict the future is to create it. Every line of code you write today shapes the software of tomorrow. Keep building, keep learning.",
  "In the world of web development, JavaScript is everywhere. From the browser to the server, from mobile apps to desktop tools, it powers the modern internet.",
  "A good developer is not someone who writes code without bugs. A good developer is someone who writes code that other people can understand and maintain.",
  "The internet is a global network of computers connected together. When you visit a website, your computer sends a request to a server, which sends back the page you see.",
  "React makes it painless to create interactive user interfaces. Design simple views for each state, and React will efficiently update and render the right components.",
  "Typing speed matters, but accuracy matters more. A fast typist who makes lots of mistakes will always lose to a slower typist who gets every word right the first time.",
];

const getRandomText = () => paragraphs[Math.floor(Math.random() * paragraphs.length)];

const SoloGamePage = () => {
  const navigate = useNavigate();

  const [text, setText] = useState('');
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [focused, setFocused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [wpmHistory, setWpmHistory] = useState([]);
  
  const inputRef = useRef(null);
  const wpmHistoryRef = useRef([]);

  useEffect(() => {
    setText(getRandomText());
  }, []);

  const calculateStats = (currentTyped = typed, currentTime = Date.now()) => {
    if (!startTime || currentTyped.length === 0) return { wpm: 0, accuracy: 100 };
    const timeToUse = endTime ? endTime : currentTime;
    const mins = (timeToUse - startTime) / 60000;
    if (mins <= 0) return { wpm: 0, accuracy: 100 };
    
    let correct = 0;
    for (let i = 0; i < currentTyped.length; i++) if (currentTyped[i] === text[i]) correct++;
    
    return {
      wpm: Math.round((correct / 5) / mins),
      accuracy: Math.round((correct / currentTyped.length) * 100),
    };
  };

  const handleInput = e => {
    if (finished) return;
    const value = e.target.value;
    const now = Date.now();
    
    if (!startTime && value.length > 0) {
      setStartTime(now);
      wpmHistoryRef.current = [{ time: 0, p1: 0, timestamp: now }];
    }
    
    if (value.length > text.length) return;
    setTyped(value);
    
    // Snapshot WPM history exactly once per second
    if (startTime) {
      const lastSnap = wpmHistoryRef.current.length > 0 
        ? wpmHistoryRef.current[wpmHistoryRef.current.length - 1].timestamp 
        : startTime;
        
      if (now - lastSnap >= 1000 || value.length === text.length) {
        const stats = calculateStats(value, now);
        wpmHistoryRef.current.push({ time: Math.floor((now - startTime)/1000), p1: stats.wpm, timestamp: now });
        if (value.length === text.length) {
          setWpmHistory([...wpmHistoryRef.current]);
        }
      }
    }
    
    if (value.length === text.length) {
      setFinished(true);
      setEndTime(now);
    }
  };

  const resetGame = () => {
    setText(getRandomText());
    setTyped('');
    setStartTime(null);
    setEndTime(null);
    setFinished(false);
    setWpmHistory([]);
    wpmHistoryRef.current = [];
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const { wpm, accuracy } = calculateStats();
  const progress = text.length > 0 ? (typed.length / text.length) * 100 : 0;
  const timeElapsed = startTime ? Math.floor(((endTime || Date.now()) - startTime) / 1000) : 0;
  const formatTime = secs => `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;

  /* ────── Results Screen ────── */
  if (finished) {
    return (
      <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Inter', system-ui, sans-serif", color: TEXT1 }}>
        <nav style={{ height: 50, borderBottom: `1px solid ${BORDER}`, background: CARD, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <IcoHome />
            <span style={{ color: TEXT2 }}>Home</span>
            <span style={{ color: TEXT2 }}>/</span>
            <span style={{ color: TEXT1, fontWeight: 600 }}>Solo Practice</span>
          </div>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: TEXT2, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
             Exit
          </button>
        </nav>
        
        <div style={{ maxWidth: 1000, margin: '40px auto', padding: '0 24px' }}>
          
          {/* Main Results Container */}
          <div style={{ display: 'flex', gap: 40, alignItems: 'center', marginBottom: 20 }}>
            {/* Left side: Huge numbers */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '200px', flexShrink: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 28, color: TEXT2, lineHeight: 1, marginBottom: 8, letterSpacing: '0.05em' }}>wpm</span>
                <span style={{ fontSize: 84, fontWeight: 700, color: '#38BDF8', lineHeight: 0.9 }}>{wpm}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', marginTop: 32 }}>
                <span style={{ fontSize: 28, color: TEXT2, lineHeight: 1, marginBottom: 8, letterSpacing: '0.05em' }}>acc</span>
                <span style={{ fontSize: 84, fontWeight: 700, color: '#22C55E', lineHeight: 0.9 }}>{accuracy}<span style={{ fontSize: 40 }}>%</span></span>
              </div>
            </div>

            {/* Right side: Chart */}
            <div style={{ flex: 1, height: 280, padding: '20px 0' }}>
              <SimpleLineChart 
                data={wpmHistory} 
                lines={[{ key: 'p1', color: '#38BDF8' }]} 
              />
            </div>
          </div>

          {/* Bottom row: Extra Stats */}
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '24px 0', marginBottom: 40 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: TEXT2, marginBottom: 6, letterSpacing: '0.05em' }}>test type</p>
              <p style={{ fontSize: 24, color: '#38BDF8', fontWeight: 600 }}>text / solo</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: TEXT2, marginBottom: 6, letterSpacing: '0.05em' }}>characters</p>
              <p style={{ fontSize: 24, color: '#38BDF8', fontWeight: 600 }}>{text.length}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: TEXT2, marginBottom: 6, letterSpacing: '0.05em' }}>time</p>
              <p style={{ fontSize: 24, color: '#38BDF8', fontWeight: 600 }}>{timeElapsed}s</p>
            </div>
          </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, margin: '0 auto' }}>
              <button 
                onClick={resetGame} 
                style={{ padding: '12px 24px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: TEXT1, border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 8 }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#38BDF8'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = TEXT1; }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l5.67-5.67"/></svg>
                Restart Test 
                <span style={{ opacity: 0.5, fontSize: 12, fontWeight: 400 }}>(tab + enter)</span>
              </button>
              <button 
                onClick={() => navigate('/')} 
                style={{ padding: '12px 24px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: TEXT1, border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'background .15s', display: 'flex', alignItems: 'center', gap: 8 }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <IcoHome /> Back to Home
              </button>
            </div>
          </div>
        </div>
    );
  }

  /* ────── Main Practice UI ────── */
  return (
    <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: BG, fontFamily: "'Inter', system-ui, sans-serif", color: TEXT1 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,.35); border-radius: 4px; }
      `}</style>

      {/* ── Breadcrumb nav ── */}
      <nav style={{ height: 50, borderBottom: `1px solid ${BORDER}`, background: CARD, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, color: TEXT2, cursor: 'pointer', fontSize: 14, padding: 0, transition: 'color .15s' }}
            onMouseEnter={e => e.currentTarget.style.color = TEXT1}
            onMouseLeave={e => e.currentTarget.style.color = TEXT2}
          >
            <IcoHome /> Home
          </button>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 16 }}>/</span>
          <span style={{ color: TEXT1, fontWeight: 600, fontSize: 14 }}>Solo Practice</span>
        </div>
        <button onClick={resetGame} style={{ background: 'none', border: 'none', color: TEXT2, cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '4px 12px', borderRadius: 8, transition: 'background .15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          Restart
        </button>
      </nav>

      {/* ── Content wrapper ── */}
      <div style={{ maxWidth: 1000, width: '100%', margin: '0 auto', padding: '32px 24px 24px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

        {/* ── Stats bar ── */}
        <div style={{ ...cardSx, height: 85, display: 'flex', alignItems: 'center', padding: '0 28px', flexShrink: 0 }}>
          <StatSection icon={<IcoSpeed />} label="WPM" value={wpm} color={PURPLE} />
          <Divider />
          <StatSection icon={<IcoTarget />} label="ACCURACY" value={`${accuracy}%`} color={GREEN} />
          <Divider />
          <StatSection icon={<IcoClock />} label="TIME" value={formatTime(timeElapsed)} color={BLUE} />
          <Divider />

          {/* Word Progress */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', color: TEXT2, marginBottom: 8 }}>PROGRESS</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ color: PURPLE, fontWeight: 700, fontSize: 20, minWidth: 46 }}>{Math.round(progress)}%</span>
              <div style={{ flex: 1, height: 6, background: TRACK, borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 99, transition: 'width .3s ease', width: `${progress}%`, background: `linear-gradient(90deg, ${PURPLE}, ${BLUE})` }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Typing card ── */}
        <div style={{ ...cardSx, position: 'relative', overflow: 'hidden', flex: 1, marginTop: 24, display: 'flex', flexDirection: 'column' }}
          onClick={() => inputRef.current?.focus()}
        >
          {/* Text content */}
          <div style={{
            padding: '48px 60px',
            filter: focused ? 'none' : 'blur(8px)',
            transition: 'filter .25s ease',
            userSelect: 'none',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, lineHeight: 1.8, letterSpacing: '0.02em', color: TEXT2, maxWidth: 850 }}>
              {text.split('').map((char, i) => {
                let color = 'rgba(148,163,184,0.45)';
                let bg    = 'transparent';
                let dec   = 'none';

                if (i < typed.length) {
                  if (typed[i] === char) {
                    color = PURPLE;
                  } else {
                    color = '#f87171';
                    bg    = 'rgba(248,113,113,0.08)';
                    dec   = 'underline';
                  }
                } else if (i === typed.length) {
                  color = TEXT1;
                  bg    = 'rgba(139,92,246,0.22)';
                }
                return (
                  <span key={i} style={{ color, background: bg, textDecoration: dec, borderRadius: 2, transition: 'color .08s' }}>
                    {char}
                  </span>
                );
              })}
            </p>
          </div>

          {/* Focus overlay */}
          {!focused && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.15)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'text',
            }}>
              <IcoKbd />
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <p style={{ fontSize: 32, fontWeight: 600, color: TEXT1, letterSpacing: '-0.01em' }}>Touch or click here</p>
                <p style={{ fontSize: 18, color: TEXT2, marginTop: 10, fontWeight: 400 }}>to start practicing</p>
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            value={typed}
            onChange={handleInput}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            style={{ position: 'fixed', top: -9999, left: -9999, opacity: 0, width: 1, height: 1 }}
          />
        </div>

        {/* ── Footer ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, padding: '0 8px' }}>
          <p style={{ fontSize: 13, color: TEXT2 }}>Tip: Focus on accuracy first, speed will follow.</p>
          <button style={{ background: 'none', border: 'none', color: TEXT2, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, opacity: 0.7, transition: 'opacity .15s', padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
          >
            <IcoFlag /> Report Issue
          </button>
        </div>

      </div>
    </div>
  );
};

export default SoloGamePage;
