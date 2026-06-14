import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';

const menuItems = [
  { icon: '📋', label: '个人资料', path: '/profile-edit' },
  { icon: '🪪', label: '实名认证', path: '/verification' },
  { icon: '🔐', label: '账号安全', path: '/security' },
  { icon: '📦', label: '我的送拍', path: '/send-pledge' },
  { icon: '💳', label: '我的钱包', path: '/wallet' },
  { icon: '🛡️', label: '通用设置', path: '/settings' },
  { icon: '📞', label: '投诉', path: '/complaint' },
  { icon: 'ℹ️', label: '关于我们', path: '/about' },
];

const auctionRules = ['征集规则', '违约名单', '征集师背书'];

export default function Profile() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setAuthUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    api.getProfile().then((p) => {
      setAuthUser({
        id: p.id,
        displayName: p.displayName || p.username,
        nickname: p.nickname || p.username,
        avatar: p.avatar,
        phone: p.phone,
        role: p.role || 'user',
        isVerified: p.isVerified || false,
        balance: p.balance || 0,
      });
      setBalance(p.balance);
    }).catch(() => {});
  }, []);

  const roleLabel: Record<string, string> = {
    admin: '管理员',
    manager: '客户经理',
    user: '买家',
  };

  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      <div className="px-4 pt-4 pb-6 bg-gradient-to-b from-[#161b22] to-transparent">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#21262d] flex items-center justify-center text-3xl border-2 border-[#D4AF37]">
            {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" /> : '👤'}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{user?.nickname || user?.displayName || '用户'}</h2>
            <p className="text-[#8b949e] text-xs mt-0.5">ID: {user?.id?.slice(0, 12) || '****'}</p>
            <p className="text-[#D4AF37] text-xs mt-0.5">{roleLabel[user?.role || 'user'] || '买家'}</p>
          </div>
        </div>
      </div>

      <div className="mx-4 mb-4 bg-[#161b22] rounded-lg border border-[#30363d] overflow-hidden">
        {auctionRules.map((rule, i) => (
          <button key={rule}
            className={`w-full flex items-center justify-between px-4 py-3 ${i < auctionRules.length - 1 ? 'border-b border-[#30363d]' : ''} active:bg-[#1c2128]`}>
            <span className="text-sm text-[#8b949e]">{rule}</span>
            <span className="text-[#30363d]">›</span>
          </button>
        ))}
      </div>

      <div className="mx-4 bg-[#161b22] rounded-lg border border-[#30363d] overflow-hidden">
        {menuItems.map((item, i) => (
          <button key={item.label}
            onClick={() => item.path && navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 ${i < menuItems.length - 1 ? 'border-b border-[#30363d]' : ''} active:bg-[#1c2128]`}>
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm text-white flex-1 text-left">{item.label}</span>
            {item.label === '我的钱包' && balance !== null && (
              <span className="text-[#D4AF37] text-xs font-bold">¥{balance.toLocaleString()}</span>
            )}
            <span className="text-[#30363d]">›</span>
          </button>
        ))}
      </div>

      {/* 管理后台入口（管理员/经理可见） */}
      {(user?.role === 'admin' || user?.role === 'manager') && (
        <div className="mx-4 mt-4 bg-[#161b22] rounded-lg border border-[#D4AF37]/30 overflow-hidden">
          <a href="/admin/"
            className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-[#1c2128] no-underline">
            <span className="text-lg">🎛️</span>
            <span className="text-sm text-[#D4AF37] flex-1 text-left font-medium">管理后台</span>
            <span style={{ fontSize: 11, color: '#7d8590' }}>外部打开</span>
            <span className="text-[#D4AF37]">↗</span>
          </a>
        </div>
      )}

      <div className="mx-4 mt-6 mb-4">
        <button onClick={() => { logout(); navigate('/login'); }}
          className="w-full py-3 bg-[#21262d] border border-[#30363d] rounded-lg text-red-400 text-sm active:bg-[#161b22]">
          退出登录
        </button>
      </div>
    </div>
  );
}
