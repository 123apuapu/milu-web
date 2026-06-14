import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMatrixClient, getRoomMessages, sendMessage, onMessage } from '../lib/matrix';
import CallScreen from '../components/CallScreen';

export default function ChatRoom() {
  const { roomId } = useParams() as { roomId: string };
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [roomName, setRoomName] = useState('聊天');
  const [callActive, setCallActive] = useState<'voice' | 'video' | null>(null);
  const [callState, setCallState] = useState<'calling' | 'ringing' | 'connected'>('calling');

  const startCall = (type: 'voice' | 'video') => {
    const mc = getMatrixClient();
    if (!mc) { alert('Matrix客户端未就绪'); return; }
    setCallActive(type);
    setCallState('calling');
    try {
      const call = mc.createCall(roomId);
      if (!call) { alert('无法创建通话'); return; }
      call.placeCall(true, type === 'video');
      setTimeout(() => setCallState('ringing'), 2000);
    } catch (e: any) {
      alert('发起通话失败: ' + (e.message || ''));
      setCallActive(null);
    }
  };

  useEffect(() => {
    if (!roomId) return;
    // 加载历史消息
    const msgs = getRoomMessages(roomId);
    setMessages(msgs);

    // 获取房间名
    const mc = getMatrixClient();
    if (mc) {
      const room = mc.getRoom(roomId);
      if (room) {
        setRoomName(room.name || room.getDefaultRoomName(mc.getUserId()) || '聊天');
      }
    }

    // 监听新消息
    const unsub = onMessage((rid, msg) => {
      if (rid === roomId) {
        setMessages(prev => [...prev, msg]);
      }
    });

    return unsub;
  }, [roomId]);

  const handleSend = async () => {
    if (!input.trim() || !roomId) return;
    const content = input.trim();
    setInput('');
    // 乐观更新
    const temp = { id: 'temp-' + Date.now(), from: 'me', content, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), type: 'm.room.message' };
    setMessages(prev => [...prev, temp]);
    // 发送到 Matrix
    try {
      await sendMessage(roomId, content);
    } catch {
      // 发送失败，移除临时消息
      setMessages(prev => prev.filter(m => m.id !== temp.id));
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#080b12' }}>
      {/* 头部 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#0f141c', borderBottom: '1px solid #1c2636' }}>
        <button onClick={() => navigate('/messages')} style={{ background: 'none', border: 'none', color: '#7d8590', fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>‹</button>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#151b26', border: '1px solid #1c2636', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💬</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#e6edf3', fontWeight: 600, fontSize: 14 }}>{roomName}</div>
          <div style={{ color: '#484f58', fontSize: 11 }}>{messages.length} 条消息</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => startCall('voice')}
            style={{ width: 32, height: 32, borderRadius: 8, background: '#151b26', border: '1px solid #1c2636', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7d8590' }}
            title="语音通话">📞</button>
          <button onClick={() => startCall('video')}
            style={{ width: 32, height: 32, borderRadius: 8, background: '#151b26', border: '1px solid #1c2636', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7d8590' }}
            title="视频通话">📹</button>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '16px 16px 8px' }} ref={(el: HTMLDivElement | null) => { if (el) el.scrollTop = el.scrollHeight; }}>
        {messages.map((msg) => {
          const mc = getMatrixClient();
          const isMe = msg.from === 'me' || msg.from === mc?.getUserId();
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
              <div style={{ maxWidth: '78%' }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: isMe ? 'linear-gradient(135deg, #D4AF37, #B8962E)' : '#151b26',
                  color: isMe ? '#000' : '#e6edf3',
                  fontSize: 13, lineHeight: 1.5,
                  border: isMe ? 'none' : '1px solid #1c2636',
                }}>
                  {msg.content}
                </div>
                <div style={{ textAlign: isMe ? 'right' : 'left', marginTop: 4, padding: '0 4px' }}>
                  <span style={{ fontSize: 10, color: '#484f58' }}>{msg.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 输入框 */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #1c2636', background: '#0f141c' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="text" placeholder="输入消息..." value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            style={{ flex: 1, padding: '10px 14px', background: '#0d1117', border: '1px solid #1c2636', borderRadius: 10, color: '#e6edf3', fontSize: 13, outline: 'none' }} />
          <button onClick={handleSend}
            style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #D4AF37, #B8962E)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, color: '#000', flexShrink: 0 }}>
            ↗
          </button>
        </div>
      </div>

      {/* 通话界面 */}
      {callActive && (
        <CallScreen
          roomName={roomName}
          direction="outgoing"
          callType={callActive}
          callState={callState}
          onHangup={() => { setCallActive(null); setCallState('calling'); }}
        />
      )}
    </div>
  );
}
