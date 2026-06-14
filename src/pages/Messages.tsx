import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMatrixClient, onRoomsChange } from '../lib/matrix';

export default function Messages() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mc = getMatrixClient();
    if (mc) {
      setConversations(getRooms());
      setReady(true);
    }
    const unsub = onRoomsChange((rooms) => {
      setConversations(rooms);
      setReady(true);
    });
    return unsub;
  }, []);

  function getRooms() {
    try {
      const mc = getMatrixClient();
      if (!mc) return [];
      return mc.getRooms()
        .filter((r: any) => r.getMyMembership() === 'join')
        .map((room: any) => ({
          id: room.roomId,
          name: room.name || room.getDefaultRoomName(mc.getUserId()),
          avatar: '💬',
          lastMsg: getLastMsg(room),
          time: getTime(room),
          unread: room.getUnreadNotificationCount() || 0,
          top: false,
        }));
    } catch { return []; }
  }

  const filtered = conversations.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full flex flex-col" style={{ background: '#080b12' }}>
      <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #1c2636', background: 'linear-gradient(180deg, #0f141c 0%, transparent 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3' }}>消息</h1>
          <button style={{ width: 36, height: 36, borderRadius: 10, background: '#151b26', border: '1px solid #1c2636', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, color: '#7d8590' }}>✏️</button>
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#484f58' }}>🔍</span>
          <input type="text" placeholder="搜索聊天..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 36px', background: '#0d1117', border: '1px solid #1c2636', borderRadius: 10, color: '#e6edf3', fontSize: 13, outline: 'none' }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!ready ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
            <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            <p style={{ color: '#484f58', fontSize: 13 }}>连接同步中...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
            <span style={{ fontSize: 48, opacity: 0.3 }}>💬</span>
            <p style={{ color: '#484f58', fontSize: 14 }}>暂无消息</p>
            <p style={{ color: '#484f58', fontSize: 12 }}>去通讯录添加好友开始聊天</p>
          </div>
        ) : (
          filtered.map((conv: any) => (
            <div key={conv.id} onClick={() => navigate(`/messages/${conv.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', cursor: 'pointer', borderBottom: '1px solid #1c2636', transition: 'background 0.15s' }}
              onMouseOver={e => e.currentTarget.style.background = '#151b26'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#151b26', border: '1px solid #1c2636', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                {conv.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <h3 style={{ color: '#e6edf3', fontWeight: 600, fontSize: 14 }}>{conv.name}</h3>
                  <span style={{ color: '#484f58', fontSize: 11, flexShrink: 0 }}>{conv.time}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ color: '#7d8590', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{conv.lastMsg}</p>
                  {conv.unread > 0 && (
                    <span style={{ minWidth: 20, height: 20, borderRadius: 10, background: 'linear-gradient(135deg, #D4AF37, #B8962E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#000', padding: '0 5px', marginLeft: 8 }}>
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

function getLastMsg(room: any): string {
  try {
    const events = room.getLiveTimeline().getEvents();
    const last = events[events.length - 1];
    if (!last || last.getType() !== 'm.room.message') return '';
    const sender = last.getSender()?.split(':')[0]?.replace('@', '') || '';
    return `${sender}: ${last.getContent()?.body || ''}`;
  } catch { return ''; }
}

function getTime(room: any): string {
  try {
    const events = room.getLiveTimeline().getEvents();
    const last = events[events.length - 1];
    if (!last) return '';
    const d = new Date(last.getTs());
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
    if (diff < 86400) return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch { return ''; }
}
