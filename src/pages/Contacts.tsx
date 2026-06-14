import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

const contacts = [
  { id: 'manager', name: '客户经理 - 张经理', avatar: '👨‍💼', role: '客户经理' },
  { id: 'u1', name: '王买家', avatar: '👤', role: '买家' },
  { id: 'u2', name: '李收藏家', avatar: '👤', role: '收藏家' },
  { id: 'u3', name: '赵委托方', avatar: '👤', role: '送拍人' },
];

export default function Contacts() {
  const user = useAuthStore((s) => s.user);
  const [showAdd, setShowAdd] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setSearchResult(null);
    setSending(true);
    // 模拟查找 - 实际应调用 Matrix SDK 搜索用户
    setTimeout(() => {
      if (searchId.includes('@') && searchId.includes(':')) {
        setSearchResult(`找到用户: ${searchId}`);
      } else if (searchId.length > 3) {
        setSearchResult(`找到用户: @${searchId}:matrix.4.dpjp.cn`);
      } else {
        setSearchResult('未找到该用户');
      }
      setSending(false);
    }, 800);
  };

  const sendFriendRequest = () => {
    alert('好友请求已发送，等待对方确认');
    setShowAdd(false);
    setSearchId('');
    setSearchResult(null);
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#080b12' }}>
      <div style={{
        padding: '20px 20px 12px',
        borderBottom: '1px solid #1c2636',
        background: 'linear-gradient(180deg, #0f141c 0%, transparent 100%)',
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3' }}>通讯录</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {contacts.map((c) => (
          <div key={c.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 20px', cursor: 'pointer',
              borderBottom: '1px solid #1c2636',
              transition: 'background 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.background = '#151b26'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: '#151b26', border: '1px solid #1c2636',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
            }}>
              {c.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#e6edf3' }}>{c.name}</div>
              <div style={{ fontSize: 12, color: '#7d8590', marginTop: 2 }}>{c.role}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 添加好友按钮 */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #1c2636', background: '#0f141c' }}>
        <button onClick={() => setShowAdd(true)}
          style={{
            width: '100%', padding: 12,
            background: 'linear-gradient(135deg, #D4AF37, #B8962E)',
            border: 'none', borderRadius: 8, color: '#000',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
          + 添加好友
        </button>
      </div>

      {/* 添加好友弹窗 */}
      {showAdd && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            width: '100%', maxWidth: 360,
            background: '#151b26', borderRadius: 14,
            border: '1px solid #1c2636',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '20px 20px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#e6edf3' }}>添加好友</h2>
                <button onClick={() => { setShowAdd(false); setSearchResult(null); setSearchId(''); }}
                  style={{ background: 'none', border: 'none', color: '#484f58', fontSize: 18, cursor: 'pointer', padding: 4 }}>
                  ✕
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <input
                  type="text" placeholder="输入用户ID 或 手机号" value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  style={{
                    flex: 1, padding: '10px 14px', background: '#0d1117',
                    border: '1px solid #1c2636', borderRadius: 8,
                    color: '#e6edf3', fontSize: 13, outline: 'none',
                  }}
                  autoFocus
                />
                <button onClick={handleSearch} disabled={sending}
                  style={{
                    padding: '10px 16px', background: 'linear-gradient(135deg, #D4AF37, #B8962E)',
                    border: 'none', borderRadius: 8, color: '#000',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    opacity: sending ? 0.6 : 1,
                  }}>
                  {sending ? '...' : '查找'}
                </button>
              </div>
              <div style={{ fontSize: 11, color: '#484f58', marginBottom: 8 }}>
                格式: @用户名:matrix.4.dpjp.cn 或 手机号
              </div>
            </div>

            {searchResult && (
              <div style={{ padding: '0 20px 20px' }}>
                <div style={{
                  padding: 12, borderRadius: 8,
                  background: searchResult.includes('找到') ? 'rgba(63,185,80,0.08)' : 'rgba(248,81,73,0.08)',
                  border: `1px solid ${searchResult.includes('找到') ? 'rgba(63,185,80,0.2)' : 'rgba(248,81,73,0.2)'}`,
                }}>
                  <div style={{ fontSize: 13, color: searchResult.includes('找到') ? '#3fb950' : '#f85149', marginBottom: 8 }}>
                    {searchResult}
                  </div>
                  {searchResult.includes('找到') && (
                    <button onClick={sendFriendRequest}
                      style={{
                        padding: '8px 16px', background: 'linear-gradient(135deg, #D4AF37, #B8962E)',
                        border: 'none', borderRadius: 6, color: '#000',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}>
                      发送好友请求
                    </button>
                  )}
                </div>
              </div>
            )}

            <div style={{ padding: '14px 20px', borderTop: '1px solid #1c2636', textAlign: 'center' }}>
              <span style={{ fontSize: 12, color: '#7d8590' }}>也可让对方搜索你的ID: </span>
              <span style={{ fontSize: 12, color: '#D4AF37', fontFamily: 'monospace' }}>
                @{user?.displayName || '用户'}:matrix.4.dpjp.cn
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
