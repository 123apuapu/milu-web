import { useState, useEffect } from 'react';

interface CallScreenProps {
  roomName: string;
  direction: 'outgoing' | 'incoming';
  callType: 'voice' | 'video';
  callState: 'calling' | 'ringing' | 'connected';
  onAnswer?: () => void;
  onHangup: () => void;
}

export default function CallScreen({ roomName, direction, callType, callState, onAnswer, onHangup }: CallScreenProps) {
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (direction === 'outgoing') {
      // 自动"接通"（模拟 - 实际需要WebRTC协商）
      setTimeout(() => {
        setConnected(true);
        startTimer();
      }, 1500);
    }
    return () => { /* cleanup media streams */ };
  }, []);

  const startTimer = () => {
    const t = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'linear-gradient(135deg, #0a0d14 0%, #1a1a2e 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* 视频画面（视频通话时显示） */}
      {callType === 'video' && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>📹</div>
          </div>
          {/* 小窗（自己的画面） */}
          <div style={{
            position: 'absolute', top: 60, right: 20, width: 120, height: 180,
            background: '#0d1117', borderRadius: 12, border: '2px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#484f58',
          }}>
            🎥
          </div>
        </div>
      )}

      {/* 内容 */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {/* 头像 */}
        <div style={{
          width: callType === 'video' ? 80 : 100, height: callType === 'video' ? 80 : 100,
          borderRadius: '50%', margin: '0 auto 20px',
          background: 'linear-gradient(135deg, #D4AF37, #B8962E)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: callType === 'video' ? 32 : 40, color: '#000',
        }}>
          {callType === 'video' ? '📹' : '📞'}
        </div>

        <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{roomName}</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
          {connected ? formatTime(duration) : callState === 'calling' ? '正在连接...' : callState === 'ringing' ? '正在呼叫...' : direction === 'outgoing' ? '正在呼叫...' : '来电中...'}
        </p>
      </div>

      {/* 操作按钮 */}
      <div style={{ position: 'absolute', bottom: 60, zIndex: 1, display: 'flex', gap: 24, alignItems: 'center' }}>
        {/* 静音 */}
        <button onClick={() => setMuted(!muted)}
          style={{ width: 52, height: 52, borderRadius: '50%', border: 'none', background: muted ? '#D4AF37' : 'rgba(255,255,255,0.1)', color: muted ? '#000' : '#fff', cursor: 'pointer', fontSize: 20 }}>
          {muted ? '🔇' : '🎤'}
        </button>

        {/* 挂断 */}
        <button onClick={onHangup}
          style={{ width: 64, height: 64, borderRadius: '50%', border: 'none', background: '#f85149', color: '#fff', cursor: 'pointer', fontSize: 24, boxShadow: '0 4px 20px rgba(248,81,73,0.4)' }}>
          📞
        </button>

        {/* 扬声器 */}
        <button onClick={() => setSpeakerOn(!speakerOn)}
          style={{ width: 52, height: 52, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: 20 }}>
          {speakerOn ? '🔊' : '🔉'}
        </button>

        {/* 接听（来电时显示） */}
        {direction === 'incoming' && !connected && (
          <button onClick={() => { onAnswer?.(); setConnected(true); }}
            style={{ width: 64, height: 64, borderRadius: '50%', border: 'none', background: '#3fb950', color: '#fff', cursor: 'pointer', fontSize: 24 }}>
            📞
          </button>
        )}
      </div>

      {/* 视频切换（语音通话时显示） */}
      {callType === 'voice' && connected && (
        <button style={{ position: 'absolute', bottom: 140, zIndex: 1, color: 'rgba(255,255,255,0.4)', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer' }}>
          📹 开启视频
        </button>
      )}
    </div>
  );
}
