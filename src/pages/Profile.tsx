import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';

const menuItems = [
  { icon: '📋', label: '个人资料', path: '/profile-edit' },
  { icon: '🪪', label: '实名认证', path: '/verification' },
  { icon: '🔐', label: '账号安全', path: '/security' },
  { icon: '💳', label: '我的钱包', path: '/wallet' },
  { icon: '🛡️', label: '通用设置', path: '/settings' },
  { icon: '📦', label: '我的送拍', path: '/send-pledge', staffOnly: true },
  { icon: '📞', label: '投诉', path: '/complaint' },
  { icon: 'ℹ️', label: '关于我们', path: '/about' },
];

export default function Profile() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setAuthUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    api.getProfile().then((p) => {
      setAuthUser({ userId: p.userId || 0, id: p.id, displayName: p.displayName || p.username, nickname: p.nickname || p.username, avatar: p.avatar, phone: p.phone, role: p.role || 'user', isVerified: p.isVerified || false, balance: p.balance || 0 });
      setBalance(p.balance);
    }).catch(() => {});
  }, []);

  const isStaff = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'customer_service';
  const roleLabel: Record<string, string> = { admin: '管理员', manager: '客户经理', customer_service: '客服', user: '买家' };
  const filteredItems = menuItems.filter(item => !item.staffOnly || isStaff);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#111' }}>
      {/* Profile Header */}
      <div style={{ padding: '60px 16px 24px', background: '#1A1A1A', borderBottom: '1px solid #252525' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 8, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, border: '2px solid #252525' }}>
            {user?.avatar ? <img src={user.avatar} style={{ width: '100%', height: '100%', borderRadius: 6, objectFit: 'cover' }} /> : '👤'}
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#E6E6E6', margin: 0 }}>{user?.nickname || user?.displayName || '用户'}</h2>
            <p style={{ color: '#7F7F7F', fontSize: 12, margin: '4px 0 0' }}>{roleLabel[user?.role || 'user']}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div style={{ margin: '12px 16px', background: '#191919', borderRadius: 10, overflow: 'hidden' }}>
        {filteredItems.map((item, i) => (
          <button key={item.label} onClick={() => item.path && navigate(item.path)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: i < filteredItems.length - 1 ? '1px solid #252525' : 'none' }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span style={{ fontSize: 14, color: '#E6E6E6', flex: 1, textAlign: 'left' }}>{item.label}</span>
            {item.label === '我的钱包' && balance !== null && <span style={{ color: '#07C160', fontSize: 12, fontWeight: 600 }}>¥{balance.toLocaleString()}</span>}
            <span style={{ color: '#7F7F7F', fontSize: 14 }}>›</span>
          </button>
        ))}
      </div>

      {/* Admin link */}
      {isStaff && (
        <div style={{ margin: '0 16px' }}>
          <a href="/admin/" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#191919', borderRadius: 10, textDecoration: 'none' }}>
            <span style={{ fontSize: 18 }}>🎛️</span>
            <span style={{ fontSize: 14, color: '#07C160', flex: 1, textAlign: 'left', fontWeight: 500 }}>管理后台</span>
            <span style={{ color: '#7F7F7F', fontSize: 12 }}>↗</span>
          </a>
        </div>
      )}

      {/* Logout */}
      <div style={{ margin: '24px 16px' }}>
        <button onClick={() => { logout(); navigate('/login'); }}
          style={{ width: '100%', padding: 12, background: '#191919', border: 'none', borderRadius: 10, color: '#E6E6E6', fontSize: 14, cursor: 'pointer' }}>
          退出登录
        </button>
      </div>
    </div>
  );
}
