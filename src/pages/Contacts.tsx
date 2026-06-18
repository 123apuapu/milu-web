import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';

export default function Contacts() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const isStaff = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'customer_service';
  const [friends, setFriends] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    api.getConversations().then(convs => {
      const map = new Map<string, any>();
      convs.forEach((c: any) => { if (c.type === 'direct') map.set(c.id, { id: c.id, name: c.name, avatar: c.avatar || '💬' }); });
      setFriends(Array.from(map.values()));
    }).catch(() => {});
  }, []);

  const handleSearch = async () => {
    if (!searchQ.trim()) return;
    setSearching(true);
    try { const results = await api.searchUsers(searchQ.trim()); setSearchResults(results); } catch {}
    setSearching(false);
  };

  const startChat = async (userId: string) => {
    try { const conv = await api.createConversation([userId]); navigate(`/messages/${conv.id}`); }
    catch (e: any) { alert('失败: ' + (e.message || '')); }
  };

  const staffContacts = [
    { userId: 'cs-1', name: '客服经理', desc: '在线', icon: '👨‍💼' },
    { userId: 'cs-2', name: '在线客服', desc: '09:00-22:00', icon: '💁' },
    { userId: 'cs-3', name: '技术支援', desc: '故障申报', icon: '🔧' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#111' }}>
      <div style={{ padding: '44px 16px 10px', background: '#1A1A1A', borderBottom: '1px solid #252525' }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: '#E6E6E6', margin: 0 }}>通讯录</h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '12px 16px 4px' }}><span style={{ color: '#7F7F7F', fontSize: 12 }}>官方客服</span></div>
        {staffContacts.map(c => (
          <div key={c.userId} onClick={() => startChat(c.userId)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer', background: '#191919', borderBottom: '1px solid #252525' }}>
            <div style={{ width: 40, height: 40, borderRadius: 6, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{c.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#E6E6E6' }}>{c.name}</div>
              <div style={{ fontSize: 11, color: '#07C160', marginTop: 2 }}>{c.desc}</div>
            </div>
          </div>
        ))}

        <div style={{ padding: '16px 16px 4px' }}><span style={{ color: '#7F7F7F', fontSize: 12 }}>我的好友</span></div>
        {friends.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#7F7F7F', fontSize: 12 }}>
            <div style={{ fontSize: 24, opacity: 0.4, marginBottom: 6 }}>👥</div>
            <div>暂无好友</div>
          </div>
        ) : friends.map(f => (
          <div key={f.id} onClick={() => startChat(f.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer', background: '#191919', borderBottom: '1px solid #252525' }}>
            <div style={{ width: 40, height: 40, borderRadius: 6, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>👤</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#E6E6E6' }}>{f.name}</div>
            </div>
          </div>
        ))}

        {isStaff && (
          <div style={{ padding: 16 }}>
            <button onClick={() => navigate('/admin/')}
              style={{ width: '100%', padding: 10, background: '#07C160', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              🎛️ 管理后台
            </button>
          </div>
        )}
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => { setShowAdd(false); setSearchResults([]); setSearchQ(''); }}>
          <div style={{ width: '100%', maxWidth: 360, background: '#1B1B1B', borderRadius: 14, border: '1px solid #333', maxHeight: '80vh', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 20px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#E6E6E6', margin: 0 }}>添加好友</h2>
                <button onClick={() => { setShowAdd(false); setSearchResults([]); setSearchQ(''); }} style={{ background: 'none', border: 'none', color: '#7F7F7F', fontSize: 18, cursor: 'pointer', padding: 4 }}>✕</button>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <input type="text" placeholder="搜索用户名" value={searchQ} onChange={e => setSearchQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  style={{ flex: 1, padding: '10px 14px', background: '#282828', border: 'none', borderRadius: 6, color: '#E6E6E6', fontSize: 13, outline: 'none' }} autoFocus />
                <button onClick={handleSearch} disabled={searching}
                  style={{ padding: '10px 16px', background: '#07C160', border: 'none', borderRadius: 6, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: searching ? 0.6 : 1 }}>{searching ? '...' : '搜索'}</button>
              </div>
            </div>
            <div style={{ padding: '0 20px 20px', maxHeight: '40vh', overflowY: 'auto' }}>
              {searchResults.map((u: any) => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: '1px solid #252525' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 6, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>👤</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#E6E6E6' }}>{u.displayName || u.username}</div>
                  </div>
                  <button onClick={() => startChat(u.id)} style={{ padding: '6px 14px', background: '#07C160', border: 'none', borderRadius: 4, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>聊天</button>
                </div>
              ))}
              {searchResults.length === 0 && searchQ && !searching && <div style={{ textAlign: 'center', padding: 20, color: '#7F7F7F', fontSize: 12 }}>未找到匹配用户</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
