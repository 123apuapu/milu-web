import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const fallbackConversations = [
  { id: 'official', name: '尚龙阁拍卖行官方客服', avatar: '🏛️', lastMsg: '欢迎来到尚龙阁拍卖行！', time: '刚刚', unread: 1, top: true },
];

export default function Messages() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const conversations = fallbackConversations;

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col" style={{ background: '#080b12' }}>
      {/* 头部 */}
      <div style={{
        padding: '20px 20px 12px',
        borderBottom: '1px solid #1c2636',
        background: 'linear-gradient(180deg, #0f141c 0%, transparent 100%)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3' }}>消息</h1>
          <button style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#151b26', border: '1px solid #1c2636',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 16, color: '#7d8590',
          }}>
            ✏️
          </button>
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#484f58' }}>🔍</span>
          <input
            type="text" placeholder="搜索聊天记录..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px 10px 36px',
              background: '#0d1117', border: '1px solid #1c2636',
              borderRadius: 10, color: '#e6edf3', fontSize: 13, outline: 'none',
            }}
          />
        </div>
      </div>

      {/* 列表 */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', gap: 12,
          }}>
            <span style={{ fontSize: 48, opacity: 0.3 }}>💬</span>
            <p style={{ color: '#484f58', fontSize: 14 }}>暂无消息</p>
          </div>
        ) : (
          filtered.map((conv) => (
            <div
              key={conv.id}
              onClick={() => navigate(`/messages/${conv.id}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 20px', cursor: 'pointer', position: 'relative',
                borderBottom: '1px solid #1c2636',
                background: conv.top ? 'rgba(212,175,55,0.03)' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#151b26'}
              onMouseOut={e => e.currentTarget.style.background = conv.top ? 'rgba(212,175,55,0.03)' : 'transparent'}
            >
              {/* 头像 */}
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: conv.top ? 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))' : '#151b26',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0,
                border: conv.top ? '1px solid rgba(212,175,55,0.2)' : '1px solid #1c2636',
              }}>
                {conv.avatar}
              </div>

              {/* 内容 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <h3 style={{
                    color: '#e6edf3', fontWeight: 600, fontSize: 14,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {conv.name}
                    {conv.top && <span style={{ fontSize: 10, color: '#D4AF37', fontWeight: 400 }}>置顶</span>}
                  </h3>
                  <span style={{ color: '#484f58', fontSize: 11, flexShrink: 0 }}>{conv.time}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{
                    color: '#7d8590', fontSize: 13,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                  }}>
                    {conv.lastMsg}
                  </p>
                  {conv.unread > 0 && (
                    <span style={{
                      minWidth: 20, height: 20, borderRadius: 10,
                      background: 'linear-gradient(135deg, #D4AF37, #B8962E)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: '#000',
                      padding: '0 5px', marginLeft: 8,
                    }}>
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
