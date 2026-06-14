import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useEffect } from 'react';

const navItems = [
  { path: '/app/admin', label: '总览', icon: '📊' },
  { path: '/app/admin/users', label: '用户管理', icon: '👥' },
  { path: '/app/admin/pledges', label: '送拍管理', icon: '📄' },
  { path: '/app/admin/invites', label: '邀请码', icon: '🔑' },
  { path: '/app/admin/auctions', label: '拍卖会', icon: '🏛️' },
  { path: '/app/admin/crm', label: 'CRM', icon: '📋' },
  { path: '/app/admin/water-army', label: '水军', icon: '🤖' },
  { path: '/app/admin/content', label: '内容管理', icon: '📝' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'manager') {
      navigate('/app/messages', { replace: true });
    }
  }, [user]);

  const isActive = (path: string) => {
    if (path === '/app/admin') return location.pathname === '/app/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-full flex bg-[#0d1117]">
      {/* 侧边栏 */}
      <div className="w-48 bg-[#161b22] border-r border-[#30363d] flex flex-col flex-shrink-0">
        <div className="px-4 py-4 border-b border-[#30363d]">
          <h2 className="text-[#D4AF37] font-bold text-sm">🎛️ 管理后台</h2>
          <p className="text-[#8b949e] text-xs mt-1">{user?.displayName || '管理员'}</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors ${
                isActive(item.path)
                  ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-r-2 border-[#D4AF37]'
                  : 'text-[#8b949e] hover:text-white hover:bg-[#1c2128]'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-[#30363d]">
          <button
            onClick={() => navigate('/app/messages')}
            className="w-full text-xs text-[#8b949e] hover:text-white text-left"
          >
            ← 返回主界面
          </button>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
