import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { path: '/messages', label: '微信', icon: '💬' },
  { path: '/contacts', label: '通讯录', icon: '👥' },
  { path: '/moments', label: '发现', icon: '🔍' },
  { path: '/official', label: '官网', icon: '🏛️' },
  { path: '/profile', label: '我', icon: '👤' },
];

export default function Layout() {
  const loc = useLocation();
  const nav = useNavigate();
  const isChat = loc.pathname.startsWith('/messages/') && loc.pathname !== '/messages';

  if (isChat) {
    return <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#111' }}><Outlet /></div>;
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#111' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}><Outlet /></div>
      <nav style={{ background: '#1A1A1A', borderTop: '1px solid #252525', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '4px 0', paddingBottom: 'calc(4px + env(safe-area-inset-bottom, 0px))' }}>
        {tabs.map(tab => {
          const active = loc.pathname.startsWith(tab.path);
          return (
            <button key={tab.path} onClick={() => nav(tab.path)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 12px', border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <span style={{ fontSize: 22, lineHeight: 1, color: active ? '#07C160' : '#7F7F7F' }}>{tab.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 500, color: active ? '#07C160' : '#7F7F7F', lineHeight: 1 }}>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
