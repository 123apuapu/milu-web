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

  // 加载好友（有共同会话的用户）
  useEffect(() => {
    api.getConversations().then(convs => {
      const friendMap = new Map<string, any>();
      convs.forEach((c: any) => {
        if (c.type === 'direct') {
          // 会话对方就是好友
          // conversation API 返回的不包含对方信息，需要查消息
          friendMap.set(c.id, { id: c.id, name: c.name, avatar: c.avatar || '💬' });
        }
      });
      setFriends(Array.from(friendMap.values()));
    }).catch(() => {});
  }, []);

  const handleSearch = async () => {
    if (!searchQ.trim()) return;
    setSearching(true);
    try {
      const results = await api.searchUsers(searchQ.trim());
      setSearchResults(results);
    } catch {}
    setSearching(false);
  };

  const startChat = async (userId: string) => {
    try {
      const conv = await api.createConversation([userId]);
      navigate(`/messages/${conv.id}`);
    } catch (e: any) { alert('操作失败: ' + (e.message || '')); }
  };

  const staffContacts = [
    { userId: 'cs-1', name: '客服经理', desc: '在线', icon: '👨‍💼' },
    { userId: 'cs-2', name: '在线客服', desc: '09:00-22:00', icon: '💁' },
    { userId: 'cs-3', name: '技术支援', desc: '故障申报', icon: '🔧' },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: '#080b12' }}>
      <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #1c2636', background: 'linear-gradient(180deg, #0f141c 0%, transparent 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3' }}>通讯录</h1>
          <button onClick={() => setShowAdd(true)}
            style={{ width: 36, height: 36, borderRadius: 10, background: '#151b26', border: '1px solid #1c2636', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, color: '#7d8590' }}>＋</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 官方客服 */}
        <div style={{ padding: '12px 20px 4px' }}>
          <p style={{ color: '#7d8590', fontSize: 11, marginBottom: 4 }}>官方客服</p>
        </div>
        {staffContacts.map((c) => (
          <div key={c.userId} onClick={() => startChat(c.userId)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', cursor: 'pointer', borderBottom: '1px solid #1c2636' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#151b26', border: '1px solid #1c2636', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              {c.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#e6edf3' }}>{c.name}</div>
              <div style={{ fontSize: 11, color: '#3fb950', marginTop: 2 }}>{c.desc}</div>
            </div>
          </div>
        ))}

        {/* 好友列表 */}
        <div style={{ padding: '16px 20px 4px', borderTop: '1px solid #1c2636', marginTop: 8 }}>
          <p style={{ color: '#7d8590', fontSize: 11, marginBottom: 4 }}>我的好友</p>
        </div>
        {friends.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 20px', color: '#484f58' }}>
            <div style={{ fontSize: 24, marginBottom: 6, opacity: 0.4 }}>👥</div>
            <div style={{ fontSize: 12 }}>暂无好友，点击右上角 ＋ 添加</div>
          </div>
        ) : (
          friends.map((f: any) => (
            <div key={f.id} onClick={() => startChat(f.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', cursor: 'pointer', borderBottom: '1px solid #1c2636' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#151b26', border: '1px solid #1c2636', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#e6edf3' }}>{f.name}</div>
              </div>
            </div>
          ))
        )}

        {isStaff && (
          <div style={{ marginTop: 16, padding: '0 20px' }}>
            <button onClick={() => navigate('/admin/')}
              style={{ width: '100%', padding: 10, background: 'linear-gradient(135deg, #D4AF37, #B8962E)', border: 'none', borderRadius: 8, color: '#000', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              🎛️ 管理后台
            </button>
          </div>
        )}
      </div>

      {/* 添加好友弹窗 */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => { setShowAdd(false); setSearchResults([]); setSearchQ(''); }}>
          <div style={{ width: '100%', maxWidth: 360, background: '#151b26', borderRadius: 14, border: '1px solid #1c2636', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', maxHeight: '80vh', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 20px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#e6edf3' }}>添加好友</h2>
                <button onClick={() => { setShowAdd(false); setSearchResults([]); setSearchQ(''); }} style={{ background: 'none', border: 'none', color: '#484f58', fontSize: 18, cursor: 'pointer', padding: 4 }}>✕</button>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <input type="text" placeholder="搜索用户数字ID或用户名" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  style={{ flex: 1, padding: '10px 14px', background: '#0d1117', border: '1px solid #1c2636', borderRadius: 8, color: '#e6edf3', fontSize: 13, outline: 'none' }}
                  autoFocus />
                <button onClick={handleSearch} disabled={searching}
                  style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #D4AF37, #B8962E)', border: 'none', borderRadius: 8, color: '#000', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: searching ? 0.6 : 1 }}>
                  {searching ? '...' : '搜索'}
                </button>
              </div>
              <div style={{ fontSize: 11, color: '#484f58', marginBottom: 8 }}>输入用户数字ID或用户名即可查找</div>
            </div>
            <div style={{ padding: '0 20px 20px', maxHeight: '40vh', overflowY: 'auto' }}>
              {searchResults.map((u: any) => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: '1px solid #1c2636' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#151b26', border: '1px solid #1c2636', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>👤</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#e6edf3' }}>{u.displayName || u.username}</div>
                    <div style={{ fontSize: 11, color: '#484f58' }}>用户{u.userId + 100000}</div>
                  </div>
                  <button onClick={() => startChat(u.id)}
                    style={{ padding: '6px 14px', background: 'linear-gradient(135deg, #D4AF37, #B8962E)', border: 'none', borderRadius: 6, color: '#000', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    聊天
                  </button>
                </div>
              ))}
              {searchResults.length === 0 && searchQ && !searching && (
                <div style={{ textAlign: 'center', padding: 20, color: '#484f58', fontSize: 12 }}>未找到匹配的用户</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
