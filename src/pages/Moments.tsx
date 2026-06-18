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
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});

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
      setNewContent(''); setShowPublish(false); setPage(1); loadMoments(1);
    } catch (e: any) { alert('发布失败: ' + (e.message || '')); }
  };

  const toggleLike = async (id: string) => {
    try {
      await api.toggleLike(id);
      setMoments(prev => prev.map(m => {
        if (m.id !== id) return m;
        const liked = m.likes?.some((l: any) => l.userId === user?.id);
        return { ...m, likes: liked ? m.likes.filter((l: any) => l.userId !== user?.id) : [...(m.likes || []), { userId: user?.id, user: { id: user?.id, displayName: user?.displayName } }] };
      }));
    } catch {}
  };

  const addComment = async (momentId: string, content: string) => {
    try { const c = await api.addComment(momentId, content); setMoments(prev => prev.map(m => m.id === momentId ? { ...m, comments: [...(m.comments || []), c] } : m)); } catch {}
  };

  const fmt = (t: string) => {
    const d = new Date(t);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return '刚刚';
    if (diff < 3600) return Math.floor(diff / 60) + '分前';
    if (diff < 86400) return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    if (diff < 86400*7) return Math.floor(diff / 86400) + '天前';
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#111' }}>
      {/* Header Banner */}
      <div style={{ height: 240, background: '#1A1A1A', position: 'relative', overflow: 'hidden' }}>
        <div style={{ height: 200, background: 'linear-gradient(135deg, #1A1A2E, #2C2C3E)' }} />
        <div style={{ position: 'absolute', right: 16, bottom: 0, display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <span style={{ color: '#E6E6E6', fontSize: 16, fontWeight: 500, marginBottom: 30 }}>{user?.displayName || (user as any)?.username || '我'}</span>
          <div style={{ width: 72, height: 72, borderRadius: 8, border: '3px solid #191919', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>👤</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#7F7F7F' }}>加载中...</div>
        ) : moments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#7F7F7F' }}>
            <div style={{ fontSize: 48, opacity: 0.3, marginBottom: 12 }}>📱</div>
            <div style={{ fontSize: 14 }}>暂无动态</div>
          </div>
        ) : (
          <>
            {moments.map((m: any) => {
              const liked = m.likes?.some((l: any) => l.userId === user?.id);
              return (
                <div key={m.id} style={{ display: 'flex', padding: '14px 16px', borderBottom: '1px solid #252525' }}>
                  {/* Avatar column */}
                  <div style={{ width: 40, flexShrink: 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 4, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
                  </div>
                  {/* Content column */}
                  <div style={{ flex: 1, minWidth: 0, marginLeft: 12 }}>
                    <div style={{ color: '#576B95', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{(m.user as any)?.displayName || (m.user as any)?.username || '用户'}</div>
                    <p style={{ color: '#E6E6E6', fontSize: 14, lineHeight: 1.6, marginBottom: 8, whiteSpace: 'pre-wrap' }}>{m.content}</p>
                    {m.images && (() => {
                      let imgs: string[];
                      try { imgs = typeof m.images === 'string' ? JSON.parse(m.images) : m.images; } catch { imgs = []; }
                      return imgs.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: imgs.length === 1 ? '1fr' : 'repeat(3,1fr)', gap: 4, marginBottom: 8 }}>
                          {imgs.map((img: string, i: number) => (
                            <div key={i} style={{ aspectRatio: '1', borderRadius: 4, overflow: 'hidden', background: '#0d1117' }}>
                              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                    <div style={{ color: '#7F7F7F', fontSize: 11, marginBottom: 8 }}>{fmt(m.createdAt)}</div>
                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                      <button onClick={() => toggleLike(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: liked ? '#07C160' : '#7F7F7F', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                        {liked ? '❤️' : '🤍'} {m.likes?.length || 0}
                      </button>
                      <span style={{ fontSize: 12, color: '#7F7F7F', display: 'flex', alignItems: 'center', gap: 4 }}>💬 {m.comments?.length || 0}</span>
                    </div>
                    {/* Comments */}
                    {m.comments && m.comments.length > 0 && (
                      <div style={{ background: '#191919', borderRadius: 6, padding: 10, marginBottom: 8 }}>
                        {m.comments.map((c: any) => (
                          <div key={c.id} style={{ marginBottom: 4, fontSize: 12, color: '#E6E6E6', lineHeight: 1.6 }}>
                            <span style={{ color: '#576B95', fontWeight: 500 }}>{c.user?.displayName || (c.user as any)?.username}：</span>{c.content}
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Comment input */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input type="text" placeholder="写评论..." value={commentInput[m.id] || ''}
                        onChange={e => setCommentInput(prev => ({ ...prev, [m.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter' && (commentInput[m.id] || '').trim()) { addComment(m.id, (commentInput[m.id] || '').trim()); setCommentInput(prev => ({ ...prev, [m.id]: '' })); } }}
                        style={{ flex: 1, padding: '6px 10px', background: '#282828', border: 'none', borderRadius: 4, color: '#E6E6E6', fontSize: 12, outline: 'none' }} />
                    </div>
                  </div>
                </div>
              );
            })}
            {hasMore && (
              <div style={{ textAlign: 'center', padding: 16 }}>
                <button onClick={() => { const np = page + 1; setPage(np); loadMoments(np); }}
                  style={{ padding: '8px 20px', background: '#252525', border: 'none', borderRadius: 4, color: '#B3B3B3', fontSize: 12, cursor: 'pointer' }}>加载更多</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Publish btn */}
      <div style={{ position: 'fixed', right: 16, bottom: 80 }}>
        <button onClick={() => setShowPublish(true)} style={{ width: 48, height: 48, borderRadius: '50%', background: '#07C160', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>✏️</button>
      </div>

      {showPublish && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowPublish(false)}>
          <div style={{ width: '100%', maxWidth: 500, background: '#1B1B1B', borderRadius: '16px 16px 0 0', padding: 20 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#E6E6E6', margin: 0 }}>发表动态</h2>
              <button onClick={() => setShowPublish(false)} style={{ background: 'none', border: 'none', color: '#7F7F7F', fontSize: 18, cursor: 'pointer', padding: 4 }}>✕</button>
            </div>
            <textarea placeholder="说点什么..." value={newContent} onChange={e => setNewContent(e.target.value)}
              style={{ width: '100%', minHeight: 120, padding: 12, background: '#282828', border: 'none', borderRadius: 8, color: '#E6E6E6', fontSize: 13, outline: 'none', resize: 'none' }} />
            <button onClick={publish} disabled={!newContent.trim()}
              style={{ width: '100%', marginTop: 12, padding: 10, background: '#07C160', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: newContent.trim() ? 1 : 0.4 }}>
              发布
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
