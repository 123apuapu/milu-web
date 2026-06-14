import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { path: '/messages', label: '消息', icon: '💬' },
  { path: '/contacts', label: '通讯录', icon: '👥' },
  { path: '/official', label: '官网', icon: '🏛️' },
  { path: '/groups', label: '群聊', icon: '👪' },
  { path: '/profile', label: '我', icon: '👤' },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isChat = location.pathname.startsWith('/messages/') && location.pathname !== '/messages';

  if (isChat) {
    return (
      <div className="h-full flex flex-col bg-[#0d1117]">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
      <nav className="safe-bottom bg-[#161b22] border-t border-[#30363d] flex items-center justify-around py-1 px-2">
        {tabs.map((tab) => {
          const active = location.pathname.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 py-2 px-4 rounded-lg transition-colors ${
                active ? 'text-[#D4AF37]' : 'text-[#8b949e]'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
