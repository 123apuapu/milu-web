import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';

const mockMessages = [
  { id: 'm1', from: 'official', content: '欢迎来到尚龙阁拍卖行！', time: '09:00', type: 'text' },
  { id: 'm2', from: 'official', content: '您有任何藏品需要送拍，可以直接联系我们。', time: '09:01', type: 'text' },
  { id: 'm3', from: 'official', content: '送拍流程：拍照上传 → 专家鉴定 → 协商底价 → 上拍', time: '09:02', type: 'text' },
];

export default function ChatRoom() {
  const { roomId } = useParams() as { roomId: string };
  const navigate = useNavigate();
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState('');

  const roomName = roomId === 'official' ? '尚龙阁拍卖行官方客服'
    : roomId === 'manager1' ? '客户经理 - 张经理'
    : '聊天';

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = {
      id: 'm' + Date.now(), from: 'me', content: input.trim(),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), type: 'text',
    };
    setMessages([...messages, msg]);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#080b12' }}>
      {/* 头部 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px', background: '#0f141c',
        borderBottom: '1px solid #1c2636',
      }}>
        <button onClick={() => navigate('/messages')}
          style={{ background: 'none', border: 'none', color: '#7d8590', fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>
          ‹
        </button>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: '#151b26', border: '1px solid #1c2636',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>
          {roomId === 'official' ? '🏛️' : '👨‍💼'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#e6edf3', fontWeight: 600, fontSize: 14 }}>{roomName}</div>
          <div style={{ color: '#484f58', fontSize: 11 }}>在线</div>
        </div>
        <button style={{
          background: '#151b26', border: '1px solid #1c2636',
          borderRadius: 8, padding: '6px 12px', color: '#D4AF37', fontSize: 12,
          cursor: 'pointer', fontWeight: 500,
        }}>
          + 好友
        </button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '16px 16px 8px' }}>
        {messages.map((msg) => {
          const isMe = msg.from === 'me';
          return (
            <div key={msg.id} style={{
              display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start',
              marginBottom: 16,
            }}>
              <div style={{ maxWidth: '78%' }}>
                {!isMe && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, paddingLeft: 4 }}>
                    <span style={{ fontSize: 11, color: '#7d8590' }}>{roomName}</span>
                  </div>
                )}
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
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #1c2636',
        background: '#0f141c',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#151b26', border: '1px solid #1c2636',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 16, color: '#7d8590', flexShrink: 0,
          }}>
            📎
          </button>
          <input
            type="text" placeholder="输入消息..." value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            style={{
              flex: 1, padding: '10px 14px',
              background: '#0d1117', border: '1px solid #1c2636',
              borderRadius: 10, color: '#e6edf3', fontSize: 13, outline: 'none',
            }}
          />
          <button onClick={sendMessage}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #D4AF37, #B8962E)',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 16, color: '#000', flexShrink: 0,
            }}>
            ↗
          </button>
        </div>
      </div>
    </div>
  );
}
