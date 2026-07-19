// pages/GamePage.jsx — pixel-perfect redesign matching screenshot spec
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

/* ─── Design tokens ──────────────────────────────────────── */
const BG      = '#090d16';
const CARD    = '#111827';
const BORDER  = 'rgba(255,255,255,0.06)';
const PURPLE  = '#8B5CF6';
const BLUE    = '#38BDF8';
const GREEN   = '#22C55E';
const ORANGE  = '#FB923C';
const PINK    = '#EC4899';
const TEXT1   = '#F3F4F6';
const TEXT2   = '#94A3B8';
const RED     = '#EF4444';
const TRACK   = '#1a2234';

/* First player = purple, second = blue, etc. */
const PLAYER_COLORS = [PURPLE, BLUE, GREEN, ORANGE, PINK];

/* ─── Icons ──────────────────────────────────────────────── */
const IcoSpeed  = () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 12 8 8"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>;
const IcoTarget = () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IcoClock  = () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoUsers  = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoChat   = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const IcoSend   = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IcoKbd    = () => <svg width="32" height="32" fill="none" stroke={TEXT2} strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/></svg>;
const IcoCrown  = () => <svg width="13" height="13" fill={PURPLE} viewBox="0 0 24 24"><path d="M2 17h20l-3-9-4 5-3-8-3 8-4-5z"/></svg>;
const IcoHome   = () => <svg width="15" height="15" fill="none" stroke={TEXT2} strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IcoLogout = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcoCopy   = () => <svg width="13" height="13" fill="none" stroke={TEXT2} strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IcoFlag   = () => <svg width="14" height="14" fill="none" stroke={TEXT2} strokeWidth="2" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;

/* ─── Shared card style ──────────────────────────────────── */
const cardSx = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16 };

/* ─── Stat divider ───────────────────────────────────────── */
const Divider = () => (
  <div style={{ width: 1, height: 44, background: BORDER, flexShrink: 0, margin: '0 28px' }} />
);

/* ─── Stat section ───────────────────────────────────────── */
const StatSection = ({ icon, label, value, color, extra }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
    <div style={{ color, opacity: 0.9 }}>{icon}</div>
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', color: TEXT2, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{value}</p>
      {extra}
    </div>
  </div>
);

/* ─── Avatar circle ──────────────────────────────────────── */
const Avatar = ({ name, color, size = 32 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', background: color,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.4, fontWeight: 700, color: '#fff', flexShrink: 0,
    userSelect: 'none',
  }}>
    {name[0].toUpperCase()}
  </div>
);

/* ════════════════════════════════════════════════════════════
   GAME PAGE
   ════════════════════════════════════════════════════════════ */
const GamePage = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  const [text,      setText]     = useState('');
  const [typed,     setTyped]    = useState('');
  const [players,   setPlayers]  = useState([]);
  const [startTime, setStartTime]= useState(null);
  const [timeLeft,  setTimeLeft] = useState(120);
  const [finished,  setFinished] = useState(false);
  const [endTime,   setEndTime]  = useState(null);
  const [results,   setResults]  = useState(null);
  const [focused,   setFocused]  = useState(false);
  const [messages,  setMessages] = useState([]);
  const [chatInput, setChatInput]= useState('');

  const inputRef        = useRef(null);
  const progressTimerRef= useRef(null);
  const messagesEndRef  = useRef(null);
  const latestStatsRef  = useRef({ typed, calculateStats: () => ({ wpm: 0, accuracy: 100 }) });

  /* ── Stats ── */
  const calculateStats = () => {
    if (!startTime || typed.length === 0) return { wpm: 0, accuracy: 100 };
    const timeToUse = endTime ? endTime : Date.now();
    const mins = (timeToUse - startTime) / 60000;
    if (mins === 0) return { wpm: 0, accuracy: 100 };
    let correct = 0;
    for (let i = 0; i < typed.length; i++) if (typed[i] === text[i]) correct++;
    return {
      wpm:      Math.round((correct / 5) / mins),
      accuracy: Math.round((correct / typed.length) * 100),
    };
  };

  useEffect(() => { latestStatsRef.current = { typed, calculateStats }; }, [typed, startTime, endTime]);

  /* ── Load game data from sessionStorage ── */
  useEffect(() => {
    const saved = sessionStorage.getItem('gameData');
    if (saved) {
      const g = JSON.parse(saved);
      setText(g.text);
      setPlayers(g.players.map(p => ({ ...p, progress: 0, wpm: 0, accuracy: 100, finished: false })));
      sessionStorage.removeItem('gameData');
    }
  }, []);

  /* ── Socket events ── */
  useEffect(() => {
    if (!socket) return;
    socket.on('game:start', ({ text: t, players: ps }) => {
      setText(t);
      setPlayers(ps.map(p => ({ ...p, progress: 0, wpm: 0, accuracy: 100, finished: false })));
    });
    socket.on('game:player_update', setPlayers);
    socket.on('game:results', setResults);
    const handleMsg = msg => setMessages(prev => [...prev, msg]);
    socket.on('chat:receive', handleMsg);
    return () => {
      socket.off('game:start');
      socket.off('game:player_update');
      socket.off('game:results');
      socket.off('chat:receive', handleMsg);
    };
  }, [socket]);

  /* ── Chat auto-scroll ── */
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  /* ── Auto-start timer (15s) ── */
  useEffect(() => {
    if (!text || startTime || finished) return;
    const t = setTimeout(() => setStartTime(Date.now()), 15000);
    return () => clearTimeout(t);
  }, [text, startTime, finished]);

  /* ── Live countdown ── */
  useEffect(() => {
    if (!startTime || finished) return;
    const t = setInterval(() => {
      const secs = Math.floor((Date.now() - startTime) / 1000);
      setTimeLeft(Math.max(0, 120 - secs));
      if (secs >= 120) {
        setFinished(true);
        setEndTime(Date.now());
        const { wpm, accuracy } = latestStatsRef.current.calculateStats();
        const cur  = latestStatsRef.current.typed;
        const prog = text.length > 0 ? (cur.length / text.length) * 100 : 0;
        socket?.emit('game:finish', { roomId, wpm, accuracy, progress: Math.min(prog, 100) });
      }
    }, 1000);
    return () => clearInterval(t);
  }, [startTime, finished, text.length, roomId, socket]);

  /* ── Auto-focus ── */
  useEffect(() => { if (text && !finished) inputRef.current?.focus(); }, [text, finished]);

  /* ── Progress throttle ── */
  useEffect(() => {
    if (!socket || !text || finished) return;
    progressTimerRef.current = setInterval(() => {
      const cur          = latestStatsRef.current.typed;
      const { wpm, accuracy } = latestStatsRef.current.calculateStats();
      const prog         = (cur.length / text.length) * 100;
      socket.emit('game:progress', { roomId, progress: Math.min(prog, 100), wpm, accuracy });
    }, 300);
    return () => clearInterval(progressTimerRef.current);
  }, [socket, text, finished, roomId]);

  /* ── Typing handler ── */
  const handleInput = e => {
    if (finished) return;
    const value = e.target.value;
    if (!startTime && value.length > 0) setStartTime(Date.now());
    if (value.length > text.length) return;
    setTyped(value);
    if (value.length === text.length) {
      setFinished(true);
      setEndTime(Date.now());
      const { wpm, accuracy } = calculateStats();
      socket?.emit('game:finish', { roomId, wpm, accuracy });
    }
  };

  /* ── Chat send ── */
  const sendMessage = e => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;
    socket.emit('chat:send', { roomId, message: chatInput.trim() });
    setChatInput('');
  };

  const formatTime = secs => `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;

  const handleLeaveGame = () => { socket?.emit('room:leave', roomId); navigate('/'); };

  /* ── Stable color by original index ── */
  const colorOf = userId => PLAYER_COLORS[players.findIndex(p => p.userId === userId) % PLAYER_COLORS.length] || PURPLE;

  /* ────── Waiting screen ────── */
  if (!text) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>
      <div style={{ width: 44, height: 44, border: `3px solid ${PURPLE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <p style={{ color: TEXT2, fontSize: 15 }}>Waiting for game to start…</p>
    </div>
  );

  /* ────── Results screen ────── */
  if (results) return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Inter', system-ui, sans-serif", color: TEXT1 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>
      <nav style={{ height: 50, borderBottom: `1px solid ${BORDER}`, background: CARD, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          <IcoHome />
          <span style={{ color: TEXT2 }}>Home</span>
          <span style={{ color: TEXT2 }}>/</span>
          <span style={{ color: TEXT1, fontWeight: 600 }}>Game Over</span>
        </div>
        <button onClick={() => navigate('/')} style={leaveBtnSx}>Back to Home</button>
      </nav>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: TEXT1 }}>Game Over</h1>
          <p style={{ color: TEXT2, fontSize: 14, marginTop: 6 }}>Final standings</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {results.map((player, i) => (
            <div key={player.userId} style={{ ...cardSx, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: i === 0 ? 'rgba(139,92,246,0.1)' : CARD }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 20, width: 28 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}</span>
                <Avatar name={player.username} color={colorOf(player.userId)} size={34} />
                <div>
                  <p style={{ color: TEXT1, fontWeight: 600 }}>{player.username}{player.userId === user?.id && <span style={{ color: TEXT2, fontSize: 12, fontWeight: 400, marginLeft: 6 }}>(you)</span>}</p>
                  <p style={{ color: TEXT2, fontSize: 12, marginTop: 2 }}>{player.finished ? 'Finished' : `${Math.round(player.progress)}% complete`}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: PURPLE, fontWeight: 700, fontSize: 18 }}>{player.wpm} WPM</p>
                <p style={{ color: TEXT2, fontSize: 12, marginTop: 2 }}>{player.accuracy}% accuracy</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('/')} style={{ ...leaveBtnSx, width: '100%', marginTop: 20, padding: '13px', borderRadius: 12, justifyContent: 'center', fontSize: 15 }}>Back to Home</button>
      </div>
    </div>
  );

  /* ────── Main game UI ────── */
  const { wpm, accuracy } = calculateStats();
  const progress = text.length > 0 ? (typed.length / text.length) * 100 : 0;
  const sorted   = [...players].sort((a, b) => (b.wpm || 0) - (a.wpm || 0));

  return (
    <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: BG, fontFamily: "'Inter', system-ui, sans-serif", color: TEXT1 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,.35); border-radius: 4px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      {/* ── Breadcrumb nav ── */}
      <nav style={{ height: 50, borderBottom: `1px solid ${BORDER}`, background: CARD, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, color: TEXT2, cursor: 'pointer', fontSize: 14, padding: 0, transition: 'color .15s' }}
            onMouseEnter={e => e.currentTarget.style.color = TEXT1}
            onMouseLeave={e => e.currentTarget.style.color = TEXT2}
          >
            <IcoHome /> Home
          </button>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 16 }}>/</span>
          <span style={{ color: TEXT1, fontWeight: 600, fontSize: 14 }}>Game Room</span>
        </div>
        <button onClick={handleLeaveGame} style={leaveBtnSx}>
          <IcoLogout /> Leave Game
        </button>
      </nav>

      {/* ── Content wrapper ── */}
      <div style={{ maxWidth: 1600, width: '100%', margin: '0 auto', padding: '20px 24px 24px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

        {/* ── Stats bar ── */}
        <div style={{ ...cardSx, height: 95, display: 'flex', alignItems: 'center', padding: '0 28px' }}>

          <StatSection icon={<IcoSpeed />} label="WPM" value={wpm} color={PURPLE} />
          <Divider />
          <StatSection icon={<IcoTarget />} label="ACCURACY" value={`${accuracy}%`} color={GREEN} />
          <Divider />
          <StatSection
            icon={<IcoClock />}
            label="TIME LEFT"
            value={formatTime(timeLeft)}
            color={timeLeft < 30 ? RED : BLUE}
          />
          <Divider />

          {/* Word Progress */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', color: TEXT2, marginBottom: 8 }}>WORD PROGRESS</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ color: PURPLE, fontWeight: 700, fontSize: 22, minWidth: 52 }}>{Math.round(progress)}%</span>
              <div style={{ flex: 1, height: 7, background: TRACK, borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99, transition: 'width .3s ease',
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${PURPLE}, ${BLUE})`,
                }} />
              </div>
            </div>
          </div>

          <Divider />
          <StatSection icon={<IcoUsers />} label="PLAYERS" value={`${players.length} / ${players.length}`} color={TEXT1} />
        </div>

        {/* ── Main 68 / 32 grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '68fr 32fr', gap: 20, marginTop: 20, flex: 1, minHeight: 0 }}>

          {/* ── Left: Typing card ── */}
          <div style={{ ...cardSx, position: 'relative', overflow: 'hidden', height: '100%' }}
            onClick={() => !finished && inputRef.current?.focus()}
          >
            {/* Text content — blurred when unfocused */}
            <div style={{
              padding: 36,
              filter: focused || finished ? 'none' : 'blur(11px)',
              transition: 'filter .25s ease',
              userSelect: 'none',
              pointerEvents: focused ? 'auto' : 'none',
            }}>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, lineHeight: 1.9, letterSpacing: '0.02em', color: TEXT2 }}>
                {text.split('').map((char, i) => {
                  let color = 'rgba(148,163,184,0.45)'; // not yet typed
                  let bg    = 'transparent';
                  let dec   = 'none';

                  if (i < typed.length) {
                    if (typed[i] === char) {
                      color = PURPLE;          // correct
                    } else {
                      color = '#f87171';       // wrong
                      bg    = 'rgba(248,113,113,0.08)';
                      dec   = 'underline';
                    }
                  } else if (i === typed.length) {
                    color = TEXT1;             // current cursor
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

            {/* Focus overlay — true center */}
            {!focused && !finished && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.20)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 0, cursor: 'text',
              }}>
                <IcoKbd />
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <p style={{ fontSize: 32, fontWeight: 600, color: TEXT1, letterSpacing: '-0.01em' }}>Touch or click here</p>
                  <p style={{ fontSize: 18, color: TEXT2, marginTop: 10, fontWeight: 400 }}>to start or resume typing</p>
                </div>
              </div>
            )}

            {/* Finished overlay */}
            {finished && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <p style={{ fontSize: 22, fontWeight: 600, color: GREEN }}>✓ Finished! Waiting for others…</p>
              </div>
            )}

            {/* Hidden input */}
            <input
              ref={inputRef}
              type="text"
              value={typed}
              onChange={handleInput}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              disabled={finished}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              style={{ position: 'fixed', top: -9999, left: -9999, opacity: 0, width: 1, height: 1 }}
            />
          </div>

          {/* ── Right sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>

            {/* Players panel */}
            <div style={{ ...cardSx, overflow: 'hidden', flexShrink: 0 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px 14px', borderBottom: `1px solid ${BORDER}` }}>
                <IcoUsers />
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: TEXT2 }}>
                  PLAYERS ({players.length}/5)
                </span>
              </div>
              {/* Rows — 5 fixed slots */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {Array.from({ length: 5 }).map((_, i) => {
                  const player = sorted[i];
                  if (!player) {
                    return <div key={`empty-${i}`} style={{ height: 54, borderBottom: i < 4 ? `1px solid ${BORDER}` : 'none' }} />;
                  }
                  
                  const isMe  = player.userId === user?.id;
                  const isTop = i === 0;
                  const color = colorOf(player.userId);
                  return (
                    <div key={player.userId} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '0 20px', height: 54,
                      background: isMe ? 'rgba(139,92,246,0.08)' : (isTop ? 'rgba(255,255,255,0.02)' : 'transparent'),
                      borderBottom: i < 4 ? `1px solid ${BORDER}` : 'none',
                    }}>
                      {/* Rank */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: 28, flexShrink: 0 }}>
                        {isTop && !isMe && <IcoCrown />}
                        <span style={{ fontSize: 13, color: isMe ? PURPLE : TEXT2, fontWeight: isMe ? 700 : 400 }}>{i + 1}</span>
                      </div>
                      <Avatar name={isMe ? 'U' : player.username} color={color} size={28} />
                      
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                        <span style={{ fontSize: 14, fontWeight: isMe ? 600 : (isTop ? 600 : 400), color: isMe ? TEXT1 : (isTop ? TEXT1 : TEXT2), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80, flexShrink: 0 }}>
                          {isMe ? 'You' : player.username}
                        </span>
                        
                        <div style={{ flex: 1, height: 6, background: TRACK, borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 99, width: `${player.progress || 0}%`, background: color, transition: 'width .3s ease' }} />
                        </div>
                        
                        {player.finished && <span style={{ color: GREEN, fontSize: 12, flexShrink: 0 }}>✓</span>}
                      </div>
                      
                      <span style={{ fontSize: 13, fontWeight: 700, color: isMe ? PURPLE : (isTop ? PURPLE : TEXT2), flexShrink: 0, width: 45, textAlign: 'right' }}>
                        {player.wpm || 0}
                      </span>
                    </div>
                  );

                })}
              </div>
            </div>

            {/* Chat panel */}
            <div style={{ ...cardSx, display: 'flex', flexDirection: 'column', padding: '18px 20px 16px', minHeight: 150, flex: 1 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${BORDER}` }}>
                <IcoChat />
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: TEXT2 }}>CHAT</span>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0, paddingRight: 4 }}>
                {messages.length === 0 && (
                  <p style={{ color: 'rgba(148,163,184,.4)', fontSize: 13, margin: 'auto', textAlign: 'center' }}>No messages yet. Say hi! 👋</p>
                )}
                {messages.map((msg, i) => {
                  const isMe = msg.userId === user?.id;
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', animation: 'fadeUp .2s ease' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: isMe ? PURPLE : TEXT2 }}>
                          {isMe ? 'You' : msg.username}
                        </span>
                        <span style={{ fontSize: 11, color: 'rgba(148,163,184,.5)' }}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {isMe ? (
                        <div style={{
                          background: PURPLE, color: '#fff', fontSize: 14, lineHeight: 1.45,
                          padding: '8px 13px', borderRadius: '14px 14px 4px 14px',
                          maxWidth: '85%', wordBreak: 'break-word',
                        }}>
                          {msg.message}
                        </div>
                      ) : (
                        <p style={{ color: TEXT1, fontSize: 14, lineHeight: 1.45 }}>{msg.message}</p>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  maxLength={200}
                  style={{
                    flex: 1, background: '#0c1220', border: `1px solid ${BORDER}`,
                    borderRadius: 10, padding: '9px 14px', color: TEXT1,
                    fontSize: 14, outline: 'none', fontFamily: 'inherit',
                    transition: 'border-color .15s',
                  }}
                  onFocus={e => e.target.style.borderColor = PURPLE}
                  onBlur={e => e.target.style.borderColor = BORDER}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  style={{
                    width: 40, height: 40, borderRadius: 10, border: 'none', flexShrink: 0,
                    background: chatInput.trim() ? PURPLE : '#1a2234',
                    color: chatInput.trim() ? '#fff' : TEXT2,
                    cursor: chatInput.trim() ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .15s',
                  }}
                >
                  <IcoSend />
                </button>
              </form>
            </div>
          </div>
        </div>


        {/* ── Footer ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, padding: '0 2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: TEXT2 }}>Room ID: <span style={{ color: TEXT1, fontWeight: 500 }}>{roomId}</span></span>
            <button
              onClick={() => navigator.clipboard.writeText(roomId)}
              style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.7, transition: 'opacity .15s' }}
              title="Copy Room ID"
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
            >
              <IcoCopy />
            </button>
          </div>
          <button style={{ background: 'none', border: 'none', color: TEXT2, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, opacity: 0.7, transition: 'opacity .15s', padding: 0, fontFamily: 'inherit' }}
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

/* ─── Shared button style ─────────────────────────────────── */
const leaveBtnSx = {
  border: `1.5px solid ${RED}`, color: RED,
  background: 'rgba(239,68,68,0.07)',
  borderRadius: 12, padding: '7px 16px',
  fontSize: 13, fontWeight: 600, cursor: 'pointer',
  fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
  transition: 'background .15s',
};

export default GamePage;
