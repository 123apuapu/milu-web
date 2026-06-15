import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';

export default function Moments() {
  const user = useAuthStore(s => s.user);
  const [moments, setMoments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [showPublish, setShowPublish] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadMoments = (p = 1) => {
    api.getMoments(p).then(data => {
      setMoments(prev => p === 1 ? data.moments : [...prev, ...data.moments]);
      setHasMore(data.hasMore);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadMoments(1); }, []);

  const publish = async () => {
    if (!newContent.trim()) return;
    try {
      await api.createMoment(newContent.trim());
      setNewContent('');
      setShowPublish(false);
      setPage(1);
      loadMoments(1);
    } catch (e: any) { alert('发布失败: ' + (e.message || '')); }
  };

  const toggleLike = async (id: string) => {
    try {
      await api.toggleLike(id);
      setMoments(prev => prev.map(m => {
        if (m.id !== id) return m;
        const liked = m.likes?.some((l: any) => l.userId === user?.id);
        return {
          ...m,
          likes: liked
            ? m.likes.filter((l: any) => l.userId !== user?.id)
            : [...(m.likes || []), { userId: user?.id, user: { id: user?.id, displayName: user?.displayName } }],
        };
      }));
    } catch {}
  };

  const addComment = async (momentId: string, content: string) => {
    try {
      const comment = await api.addComment(momentId, content);
      setMoments(prev => prev.map(m =>
        m.id === momentId ? { ...m, comments: [...(m.comments || []), comment] } : m
      ));
    } catch {}
  };

  const [commentInput, setCommentInput] = useState<Record<string, string>>({});

  function formatTime(t: string) {
    const d = new Date(t);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
    if (diff < 86400) return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}天前`;
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
  }

  return (
    <div className="h-full flex flex-col" style={{ background: '#080b12' }}>
      <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #1c2636', background: 'linear-gradient(180deg, #0f141c 0%, transparent 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3' }}>动态</h1>
          <button onClick={() => setShowPublish(true)}
            style={{ width: 36, height: 36, borderRadius: 10, background: '#151b26', border: '1px solid #1c2636', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, color: '#7d8590' }}>✏️</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#484f58' }}>加载中...</div>
        ) : moments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#484f58' }}>
            <div style={{ fontSize: 48, opacity: 0.3, marginBottom: 12 }}>📱</div>
            <div style={{ fontSize: 14, marginBottom: 4 }}>暂无动态</div>
            <div style={{ fontSize: 12 }}>点击右上角发布第一条动态</div>
          </div>
        ) : (
          <>
            {moments.map((m: any) => {
              const liked = m.likes?.some((l: any) => l.userId === user?.id);
              return (
                <div key={m.id} style={{ padding: '16px 20px', borderBottom: '1px solid #1c2636' }}>
                  {/* 用户信息 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#151b26', border: '1px solid #1c2636', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3' }}>{m.user?.displayName || m.user?.username || '用户'}</div>
                      <div style={{ fontSize: 11, color: '#484f58' }}>{formatTime(m.createdAt)}</div>
                    </div>
                  </div>

                  {/* 内容 */}
                  <p style={{ color: '#e6edf3', fontSize: 14, lineHeight: 1.6, marginBottom: 10, whiteSpace: 'pre-wrap' }}>{m.content}</p>

                  {/* 图片 */}
                  {m.images && (() => {
                    let imgs: string[];
                    try { imgs = typeof m.images === 'string' ? JSON.parse(m.images) : m.images; } catch { imgs = []; }
                    return imgs.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: imgs.length === 1 ? '1fr' : 'repeat(3, 1fr)', gap: 4, marginBottom: 10 }}>
                        {imgs.map((img: string, i: number) => (
                          <div key={i} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', background: '#0d1117' }}>
                            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* 操作栏 */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                    <button onClick={() => toggleLike(m.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: liked ? '#D4AF37' : '#7d8590', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                      {liked ? '❤️' : '🤍'} {m.likes?.length || 0}
                    </button>
                    <span style={{ fontSize: 12, color: '#7d8590', display: 'flex', alignItems: 'center', gap: 4 }}>
                      💬 {m.comments?.length || 0}
                    </span>
                  </div>

                  {/* 评论 */}
                  {m.comments && m.comments.length > 0 && (
                    <div style={{ background: '#0d1117', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                      {m.comments.map((c: any) => (
                        <div key={c.id} style={{ marginBottom: 6, fontSize: 12, color: '#e6edf3' }}>
                          <span style={{ color: '#D4AF37', fontWeight: 500 }}>{c.user?.displayName || c.user?.username}：</span>
                          {c.content}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 评论输入 */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input type="text" placeholder="写评论..." value={commentInput[m.id] || ''}
                      onChange={e => setCommentInput(prev => ({ ...prev, [m.id]: e.target.value }))}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && (commentInput[m.id] || '').trim()) {
                          addComment(m.id, (commentInput[m.id] || '').trim());
                          setCommentInput(prev => ({ ...prev, [m.id]: '' }));
                        }
                      }}
                      style={{ flex: 1, padding: '8px 10px', background: '#0d1117', border: '1px solid #1c2636', borderRadius: 6, color: '#e6edf3', fontSize: 12, outline: 'none' }} />
                  </div>
                </div>
              );
            })}
            {hasMore && (
              <div style={{ textAlign: 'center', padding: 16 }}>
                <button onClick={() => { const np = page + 1; setPage(np); loadMoments(np); }}
                  style={{ padding: '8px 20px', background: '#151b26', border: '1px solid #1c2636', borderRadius: 8, color: '#7d8590', fontSize: 12, cursor: 'pointer' }}>
                  加载更多
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 发布动态弹窗 */}
      {showPublish && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => { setShowPublish(false); }}>
          <div style={{ width: '100%', maxWidth: 380, background: '#151b26', borderRadius: 14, border: '1px solid #1c2636', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#e6edf3' }}>发布动态</h2>
                <button onClick={() => setShowPublish(false)} style={{ background: 'none', border: 'none', color: '#484f58', fontSize: 18, cursor: 'pointer', padding: 4 }}>✕</button>
              </div>
              <textarea placeholder="说点什么..." value={newContent} onChange={e => setNewContent(e.target.value)}
                style={{ width: '100%', minHeight: 120, padding: 12, background: '#0d1117', border: '1px solid #1c2636', borderRadius: 8, color: '#e6edf3', fontSize: 13, outline: 'none', resize: 'none' }} />
              <button onClick={publish} disabled={!newContent.trim()}
                style={{ width: '100%', marginTop: 12, padding: 10, background: 'linear-gradient(135deg, #D4AF37, #B8962E)', border: 'none', borderRadius: 8, color: '#000', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: newContent.trim() ? 1 : 0.5 }}>
                发布
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
