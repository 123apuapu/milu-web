import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../lib/api';
import { addChatMessageListener, unreadMap } from '../lib/webrtc';

export default function Messages() {
  const navigate = useNavigate();
  const location = useLocation();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [_rt, _setRt] = useState(0);

  useEffect(() => {
    api.getConversations().then(d => { setConversations(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const unsub = addChatMessageListener((msg: any) => {
      setConversations((prev: any[]) => {
        let found: any = null;
        const rest = prev.filter((c: any) => {
          if (c.id === msg.conversationId) { found = { ...c, lastMsg: msg.content, lastTime: msg.createdAt }; return false; }
          return true;
        });
        return found ? [found].concat(rest) : prev;
      });
      _setRt((t: number) => t + 1);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const convId = location.pathname.replace('/messages/', '');
    if (convId && convId !== 'messages' && unreadMap[convId]) {
      delete unreadMap[convId];
      try { (window as any).clearUnread?.(); } catch {}
      _setRt((t: number) => t + 1);
    }
  }, [location.pathname]);

  const fmt = (t: string) => {
    if (!t) return '';
    const d = new Date(t);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return '现在';
    if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
    if (diff < 86400) return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    return (d.getMonth()+1) + '/' + d.getDate();
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#111' }}>
      {/* Header */}
      <div style={{ padding: '44px 16px 10px', background: '#1A1A1A', borderBottom: '1px solid #252525' }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: '#E6E6E6', margin: 0 }}>微信</h1>
      </div>
      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#7F7F7F', fontSize: 13 }}>加载中...</div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#7F7F7F', fontSize: 14 }}>暂无聊天</div>
        ) : conversations.map((conv: any) => {
          const unread = unreadMap[conv.id] || 0;
          return (
            <div key={conv.id} onClick={() => navigate('/messages/' + conv.id)}
              style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', background: '#191919' }}>
              {/* Avatar */}
              <div style={{ width: 48, height: 48, borderRadius: 6, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>💬</div>
              {/* Middle: name + lastMsg */}
              <div style={{ flex: 1, minWidth: 0, marginLeft: 12, alignSelf: 'stretch', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: '1px solid #252525' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ color: '#E6E6E6', fontSize: 15, fontWeight: 500 }}>{conv.name}</span>
                  <span style={{ color: '#7F7F7F', fontSize: 11, flexShrink: 0 }}>{fmt(conv.lastTime)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#7F7F7F', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{conv.lastMsg || ' '}</span>
                  {unread > 0 && (
                    <div style={{ minWidth: 18, height: 18, borderRadius: 9, background: '#07C160', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', padding: '0 4px', marginLeft: 8, lineHeight: 1 }}>
                      {unread > 99 ? '99+' : unread}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
