import { useState, useEffect, useRef } from 'react';
import { callState, hangup, answerCall, rejectCall, toggleMute, bindStateChange } from '../lib/webrtc';

export default function CallScreen() {
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [renderTick, setRenderTick] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const unsub = bindStateChange(() => setRenderTick(t => t + 1));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (callState.state !== 'connected') { setDuration(0); return; }
    const t = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, [callState.state, renderTick]);

  // Attach remote stream to video for video calls, audio element for voice calls
  useEffect(() => {
    if (!callState.remoteStream) return;
    if (callState.isVideo && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = callState.remoteStream;
    } else if (!callState.isVideo && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = callState.remoteStream;
    }
  }, [callState.remoteStream, renderTick, callState.isVideo]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const isVideo = callState.isVideo;
  const isConnected = callState.state === 'connected';
  const isFailed = callState.state === 'failed';
  const isRinging = callState.state === 'ringing';
  const isCalling = callState.state === 'calling';

  const typeIcon = isVideo ? '📹' : '📞';
  const typeLabel = isVideo ? '视频通话' : '语音通话';

  const btnBase = (bg: string) => ({
    width: 64, height: 64, borderRadius: '50%', border: 'none',
    background: bg, color: '#fff', cursor: 'pointer', fontSize: 24,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  } as const);

  const b64 = { ...btnBase('#f85149'), width: 72, height: 72, fontSize: 28 };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'linear-gradient(135deg, #0a0d14 0%, #1a1a2e 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Video element for video calls */}
      {isVideo && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <video ref={remoteVideoRef} autoPlay playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: callState.remoteStream ? 'block' : 'none' }} />
          {!callState.remoteStream && (
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a1a2e, #0f3460)' }} />
          )}
        </div>
      )}

      {/* Hidden audio element for voice-only calls - this is critical for audio */}
      {!isVideo && (
        <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />
      )}

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{
          width: isVideo && isConnected ? 80 : 100, height: isVideo && isConnected ? 80 : 100,
          borderRadius: '50%', margin: '0 auto 20px',
          background: 'linear-gradient(135deg, #D4AF37, #B8962E)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isVideo && isConnected ? 32 : 40, color: '#000',
        }}>
          {typeIcon}
        </div>
        <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          {callState.remoteUserName || '用户'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
          {isFailed ? callState.lastError || '连接失败'
            : isConnected ? fmt(duration)
            : isCalling ? '正在呼叫...'
            : isRinging ? `来电${isVideo ? '（视频）' : '（语音）'}`
            : '连接中...'}
        </p>
      </div>

      <div style={{ position: 'absolute', bottom: 60, zIndex: 1, display: 'flex', gap: 24, alignItems: 'center' }}>
        {isFailed ? (
          <button onClick={() => hangup(true)} style={b64}>📞</button>
        ) : isRinging ? (
          <>
            <button onClick={rejectCall} style={b64}>📞</button>
            <div style={{ display: 'flex', gap: 16 }}>
              <button onClick={() => answerCall(false)}
                title="语音接听"
                style={{
                  ...btnBase('#3fb950'), width: 72, height: 72, fontSize: 28,
                  display: 'flex', flexDirection: 'column', gap: 2,
                }}>
                <span>📞</span>
                <span style={{ fontSize: 9, fontWeight: 600 }}>语音</span>
              </button>
              <button onClick={() => answerCall(true)}
                title="视频接听"
                style={{
                  ...btnBase('#3fb950'), width: 72, height: 72, fontSize: 28,
                  display: 'flex', flexDirection: 'column', gap: 2,
                }}>
                <span>📹</span>
                <span style={{ fontSize: 9, fontWeight: 600 }}>视频</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <button onClick={() => { toggleMute(); setMuted(!muted); }}
              style={{
                width: 52, height: 52, borderRadius: '50%', border: 'none',
                background: muted ? '#D4AF37' : 'rgba(255,255,255,0.1)',
                color: muted ? '#000' : '#fff', cursor: 'pointer', fontSize: 20,
              }}>
              {muted ? '🔇' : '🎤'}
            </button>
            <button onClick={() => hangup(true)} style={b64}>📞</button>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, color: isVideo ? '#D4AF37' : '#7d8590', fontWeight: 600,
            }}>
              {typeLabel}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
