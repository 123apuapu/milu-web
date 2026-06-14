import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function SendPledge() {
  const navigate = useNavigate();
  const [pledges, setPledges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPledges().then(data => setPledges(data || [])).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const typeLabel: Record<string, { label: string; icon: string; desc: string }> = {
    guarantee: { label: '担保送拍', icon: '🛡️', desc: '平台担保送拍，安全可靠' },
    direct: { label: '定向送拍', icon: '🎯', desc: '指定拍卖师一对一服务' },
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#080b12' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px', background: '#0f141c',
        borderBottom: '1px solid #1c2636',
      }}>
        <button onClick={() => navigate('/profile')}
          style={{ background: 'none', border: 'none', color: '#7d8590', fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>
          ‹
        </button>
        <h1 style={{ fontSize: 16, fontWeight: 600, color: '#e6edf3' }}>我的送拍</h1>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: 16 }}>
        {/* 送拍类型入口 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {Object.entries(typeLabel).map(([key, val]) => (
            <button key={key} onClick={() => navigate(key === 'direct' ? '/direct-send' : '/send-pledge')}
              style={{
                padding: 20, background: '#151b26', border: '1px solid #1c2636',
                borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                transition: 'border-color .2s',
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = '#D4AF37'}
              onMouseOut={e => e.currentTarget.style.borderColor = '#1c2636'}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{val.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 4 }}>{val.label}</div>
              <div style={{ fontSize: 12, color: '#7d8590' }}>{val.desc}</div>
            </button>
          ))}
        </div>

        {/* 历史记录 */}
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 12 }}>送拍记录</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#484f58' }}>加载中...</div>
        ) : pledges.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 40,
            background: '#151b26', borderRadius: 12, border: '1px solid #1c2636',
          }}>
            <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.4 }}>📦</div>
            <div style={{ color: '#7d8590', fontSize: 14, marginBottom: 4 }}>暂无送拍记录</div>
            <div style={{ color: '#484f58', fontSize: 12 }}>由后台管理员为您上传拍卖函</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pledges.map((p: any) => (
              <div key={p.id} style={{
                padding: 14, background: '#151b26', borderRadius: 10,
                border: '1px solid #1c2636',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 4 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: '#7d8590' }}>{p.lotName || ''}</div>
                  </div>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 10,
                    background: p.status === 'pending' ? 'rgba(210,153,34,0.15)' : 'rgba(63,185,80,0.15)',
                    color: p.status === 'pending' ? '#d29922' : '#3fb950',
                  }}>
                    {p.status === 'pending' ? '待处理' : '已完成'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
