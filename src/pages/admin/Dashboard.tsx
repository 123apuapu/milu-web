import { useState, useEffect } from 'react';
import { adminFetch } from '../../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, pending: 0, invites: 0, pledges: 0 });

  useEffect(() => {
    Promise.all([
      adminFetch('/users?limit=1'),
      adminFetch('/users?status=pending'),
      adminFetch('/invite-codes'),
      adminFetch('/pledges'),
    ]).then(([u, p, i, pl]) => {
      setStats({
        users: u.total || 0,
        pending: p.total || 0,
        invites: Array.isArray(i) ? i.length : 0,
        pledges: Array.isArray(pl) ? pl.length : 0,
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: '总用户', value: stats.users, color: '#58a6ff' },
    { label: '待审核', value: stats.pending, color: '#D4AF37' },
    { label: '邀请码', value: stats.invites, color: '#3fb950' },
    { label: '送拍申请', value: stats.pledges, color: '#f0883e' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-6">管理总览</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-[#161b22] rounded-lg border border-[#30363d] p-4">
            <p className="text-[#8b949e] text-xs mb-1">{c.label}</p>
            <p className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-4">
        <h2 className="text-sm font-bold text-white mb-2">快速操作</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '👥', label: '用户管理', path: 'users' },
            { icon: '🔑', label: '生成邀请码', path: 'invites' },
            { icon: '📄', label: '送拍管理', path: 'pledges' },
            { icon: '🤖', label: '水军系统', path: 'water-army' },
          ].map((btn) => (
            <a key={btn.label} href={btn.path}
              className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d] text-sm text-white hover:border-[#D4AF37] transition-colors">
              <span className="mr-2">{btn.icon}</span>{btn.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
