import { useState, useEffect } from 'react';
import { adminFetch } from '../../lib/api';

export default function AdminCrm() {
  const [tags, setTags] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [newTag, setNewTag] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [message, setMessage] = useState('');
  const [broadcastResult, setBroadcastResult] = useState<any>(null);

  const load = () => {
    adminFetch('/crm/tags').then(setTags).catch(() => {});
    adminFetch('/users?limit=50').then(d => setUsers(d.users || [])).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const addTag = async () => {
    if (!newTag) return;
    await adminFetch('/crm/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTag }),
    });
    setNewTag('');
    load();
  };

  const broadcast = async () => {
    if (!selectedTag || !message) return;
    const data = await adminFetch('/crm/broadcast', {
      method: 'POST',
      body: JSON.stringify({ tagIds: [selectedTag], message }),
    });
    setBroadcastResult(data);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-4">CRM 客户管理</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 标签管理 */}
        <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-4">
          <h2 className="text-sm font-bold text-white mb-3">🏷️ 客户标签</h2>
          <div className="flex gap-2 mb-3">
            <input type="text" placeholder="新标签名称" value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs placeholder-[#8b949e] outline-none" />
            <button onClick={addTag} className="px-3 py-2 bg-[#D4AF37] text-black text-xs font-bold rounded-lg">添加</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((t: any) => (
              <span key={t.id} className="px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full text-xs text-[#D4AF37]">
                {t.name} ({t._count?.users || 0})
              </span>
            ))}
          </div>
        </div>

        {/* 群发消息 */}
        <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-4">
          <h2 className="text-sm font-bold text-white mb-3">📢 群发消息</h2>
          <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)}
            className="w-full px-3 py-2 mb-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs outline-none">
            <option value="">选择标签组</option>
            {tags.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <textarea placeholder="输入群发消息内容..." value={message} rows={4}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs placeholder-[#8b949e] outline-none resize-none mb-3" />
          <button onClick={broadcast} disabled={!selectedTag || !message}
            className="px-4 py-2 bg-[#D4AF37] text-black text-xs font-bold rounded-lg disabled:opacity-50">发送群发</button>
          {broadcastResult && (
            <div className="mt-3 p-3 bg-[#0d1117] rounded-lg border border-[#30363d]">
              <p className="text-xs text-[#3fb950]">✓ 已发送给 {broadcastResult.count} 个用户</p>
            </div>
          )}
        </div>
      </div>

      {/* 用户列表 */}
      <div className="mt-6 bg-[#161b22] rounded-lg border border-[#30363d] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#30363d]">
          <h2 className="text-xs font-bold text-white">客户列表</h2>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-[#8b949e] text-xs">
            <th className="text-left px-4 py-3">用户名</th>
            <th className="text-left px-4 py-3">邀请码</th>
            <th className="text-left px-4 py-3">角色</th>
            <th className="text-left px-4 py-3">状态</th>
          </tr></thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-b border-[#30363d] hover:bg-[#1c2128]">
                <td className="px-4 py-3 text-white text-xs">{u.username}</td>
                <td className="px-4 py-3 text-[#8b949e] text-xs">{u.inviteCode || '-'}</td>
                <td className="px-4 py-3 text-xs">{u.role === 'admin' ? '管理员' : u.role === 'manager' ? '经理' : '用户'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs ${u.status === 'active' ? 'text-[#3fb950]' : 'text-[#D4AF37]'}`}>
                    {u.status === 'active' ? '已激活' : u.status === 'pending' ? '待审核' : '已禁用'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
