import { useState, useEffect } from 'react';
import { adminFetch } from '../../lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  const loadUsers = () => {
    let url = `/users?page=${page}&limit=20`;
    if (filter) url += `&status=${filter}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    adminFetch(url).then(d => {
      setUsers(d.users || []);
      setTotal(d.total || 0);
    }).catch(() => {});
  };

  useEffect(() => { loadUsers(); }, [page, filter]);

  const updateStatus = (id: string, status: string) => {
    adminFetch(`/users/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(() => loadUsers());
  };

  const statusColor: Record<string, string> = {
    pending: 'text-[#D4AF37]',
    active: 'text-[#3fb950]',
    banned: 'text-red-400',
  };
  const statusLabel: Record<string, string> = {
    pending: '待审核',
    active: '已激活',
    banned: '已禁用',
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-4">用户管理</h1>

      <div className="flex gap-2 mb-4">
        <input type="text" placeholder="搜索用户名/手机号..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
          className="flex-1 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs placeholder-[#8b949e] outline-none" />
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-[#161b22] border border-[#30363d] rounded-lg text-white text-xs outline-none">
          <option value="">全部</option>
          <option value="pending">待审核</option>
          <option value="active">已激活</option>
          <option value="banned">已禁用</option>
        </select>
      </div>

      <div className="bg-[#161b22] rounded-lg border border-[#30363d] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#30363d] text-[#8b949e] text-xs">
              <th className="text-left px-4 py-3">用户名</th>
              <th className="text-left px-4 py-3">昵称</th>
              <th className="text-left px-4 py-3">手机</th>
              <th className="text-left px-4 py-3">角色</th>
              <th className="text-left px-4 py-3">状态</th>
              <th className="text-left px-4 py-3">注册时间</th>
              <th className="text-right px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-b border-[#30363d] hover:bg-[#1c2128]">
                <td className="px-4 py-3 text-white">{u.username}</td>
                <td className="px-4 py-3 text-[#8b949e]">{u.displayName || '-'}</td>
                <td className="px-4 py-3 text-[#8b949e]">{u.phone || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`${u.role === 'admin' ? 'text-[#D4AF37]' : u.role === 'manager' ? 'text-[#58a6ff]' : 'text-[#8b949e]'}`}>
                    {u.role === 'admin' ? '管理员' : u.role === 'manager' ? '经理' : '用户'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={statusColor[u.status] || ''}>{statusLabel[u.status] || u.status}</span>
                </td>
                <td className="px-4 py-3 text-[#8b949e] text-xs">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString('zh-CN') : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  {u.status === 'pending' && (
                    <button onClick={() => updateStatus(u.id, 'active')}
                      className="px-3 py-1 bg-[#3fb950] text-black text-xs rounded mr-1">通过</button>
                  )}
                  {u.status === 'active' ? (
                    <button onClick={() => updateStatus(u.id, 'banned')}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded">禁用</button>
                  ) : u.status === 'banned' ? (
                    <button onClick={() => updateStatus(u.id, 'active')}
                      className="px-3 py-1 bg-[#3fb950] text-black text-xs rounded">解禁</button>
                  ) : null}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-[#8b949e]">暂无用户</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {total > 20 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs text-white disabled:opacity-50">上一页</button>
          <span className="text-xs text-[#8b949e] self-center">第 {page} 页 / 共 {Math.ceil(total / 20)} 页</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}
            className="px-3 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs text-white disabled:opacity-50">下一页</button>
        </div>
      )}
    </div>
  );
}
