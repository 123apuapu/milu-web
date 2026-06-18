import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

const categories = ['中国书画', '瓷器', '玉器', '杂项', '钱币', '古籍', '珠宝', '名酒'];
const API = '/api/auction';

export default function Official() {
  const user = useAuthStore((s) => s.user);
  const [auction, setAuction] = useState<any>(null);
  const [lots, setLots] = useState<any[]>([]);
  const [queryId, setQueryId] = useState('');
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'auction' | 'query'>('auction');
  const isAuthorized = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    fetch(API).then(r => r.json()).then((data) => {
      if (data.length > 0) {
        setAuction(data[0]);
        fetch(`${API}/${data[0].id}`).then(r => r.json()).then((detail) => setLots(detail.lots || [])).catch(() => {});
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleQuery = async () => {
    if (!isAuthorized) { setShowAuthAlert(true); setTimeout(() => setShowAuthAlert(false), 3000); return; }
    if (!queryId) return;
    try {
      const res = await fetch(`${API}/inquiry/${queryId}`, { headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('milu-auth') || '{}')?.state?.token || ''}` } });
      const data = await res.json();
      setQueryResult(res.ok ? `拍卖函 #${queryId}: ${data.lotName || data.title}\n状态: ${data.status === 'pending' ? '待处理' : '已处理'}` : (data.error || '未找到'));
    } catch { setQueryResult('查询失败'); }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#080b12' }}>
      {/* 头部 */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        padding: '24px 20px 20px', position: 'relative',
      }}>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏛️</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: 2 }}>尚龙阁</h1>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 2, letterSpacing: 1 }}>SHANLONGGE AUCTION</p>
        </div>
      </div>

      {/* 拍卖会信息 */}
      {auction && (
        <div style={{ margin: '-12px 12px 12px', padding: 14, background: '#151b26', borderRadius: 12, border: '1px solid #1c2636', position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 6 }}>{auction.name}</div>
          <div style={{ fontSize: 12, color: '#7d8590', lineHeight: 1.6 }}>
            <span>📅 {auction.date}</span> · <span>📍 {auction.location}</span>
          </div>
        </div>
      )}

      {/* Tab切换 */}
      <div style={{ display: 'flex', margin: '4px 12px 12px', gap: 4 }}>
        {[
          { key: 'auction', label: '🏺 拍品' },
          { key: 'query', label: '📄 查询' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: tab === t.key ? 'linear-gradient(135deg, #D4AF37, #B8962E)' : '#151b26',
              color: tab === t.key ? '#000' : '#7d8590', fontSize: 13, fontWeight: tab === t.key ? 700 : 400,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '0 12px 12px' }}>
        {tab === 'auction' && (
          <>
            {/* 分类 */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {categories.map(c => (
                <span key={c} style={{ padding: '4px 10px', background: '#151b26', borderRadius: 16, border: '1px solid #1c2636', fontSize: 11, color: '#7d8590' }}>{c}</span>
              ))}
            </div>

            {/* 拍品列表 */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#484f58' }}>加载中...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {lots.length === 0 ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#484f58' }}>
                    <div style={{ fontSize: 36, marginBottom: 8, opacity: 0.4 }}>🏺</div>
                    <div>暂无拍品</div>
                  </div>
                ) : (
                  lots.slice(0, 20).map((lot: any, i: number) => (
                    <div key={lot.id || i} style={{ background: '#151b26', borderRadius: 10, border: '1px solid #1c2636', overflow: 'hidden' }}>
                      <div style={{ height: 120, background: `linear-gradient(135deg, hsl(${(i * 47) % 360}, 30%, 20%), hsl(${(i * 47 + 40) % 360}, 30%, 15%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                        <img src={`/images/auctions/sync-${i % 8}.jpg`} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                      </div>
                      <div style={{ padding: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3', marginBottom: 4, lineHeight: 1.4 }}>{lot.name}</div>
                        <div style={{ fontSize: 12, color: '#D4AF37', fontWeight: 700 }}>¥{lot.estimate}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {tab === 'query' && (
          <div style={{ background: '#151b26', borderRadius: 12, border: '1px solid #1c2636', padding: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 12 }}>📄 查询拍卖函</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="text" placeholder="输入编号查询" value={queryId}
                onChange={(e) => setQueryId(e.target.value)}
                style={{ flex: 1, padding: '10px 12px', background: '#0d1117', border: '1px solid #1c2636', borderRadius: 8, color: '#e6edf3', fontSize: 13, outline: 'none' }} />
              <button onClick={handleQuery}
                style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #D4AF37, #B8962E)', border: 'none', borderRadius: 8, color: '#000', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                查询
              </button>
            </div>
            {queryResult && (
              <div style={{ marginTop: 12, padding: 12, background: '#0d1117', borderRadius: 8, border: '1px solid #1c2636', fontSize: 12, color: '#e6edf3', whiteSpace: 'pre-wrap' }}>
                {queryResult}
              </div>
            )}
            {!isAuthorized && <p style={{ fontSize: 11, color: '#484f58', marginTop: 8 }}>🔒 需授权账号方可查询</p>}
          </div>
        )}
      </div>

      {showAuthAlert && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#151b26', borderRadius: 14, border: '1px solid #1c2636', padding: 24, textAlign: 'center', maxWidth: 300, width: '100%' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
            <h3 style={{ color: '#e6edf3', fontWeight: 700, marginBottom: 8 }}>权限不足</h3>
            <p style={{ color: '#7d8590', fontSize: 13, marginBottom: 16 }}>请登录您的买家账号</p>
            <button onClick={() => setShowAuthAlert(false)} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #D4AF37, #B8962E)', border: 'none', borderRadius: 8, color: '#000', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
