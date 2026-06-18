import { useState, useEffect } from 'react';
import { adminFetch } from '../../lib/api';

export default function AdminCrm() {
  const [tags, setTags] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [newTag, setNewTag] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [message, setMessage] = useState('');
  const [broadcastResult, setBroadcastResult] = useState<any>(null);
  const [managers, setManagers] = useState<any[]>([]);
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferResult, setTransferResult] = useState<any>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [newManagerUser, setNewManagerUser] = useState('');
  const [newManagerName, setNewManagerName] = useState('');
  const [newManagerRole, setNewManagerRole] = useState('manager');
  const [showAddManager, setShowAddManager] = useState(false);

  const load = () => {
    adminFetch('/crm/tags').then(setTags).catch(() => {});
    adminFetch('/users?limit=200').then(d => setUsers(d.users || [])).catch(() => {});
    adminFetch('/customer/managers').then(setManagers).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const addTag = async () => {
    if (!newTag) return;
    await adminFetch('/crm/tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newTag }) });
    setNewTag(''); load();
  };

  const broadcast = async () => {
    if (!selectedTag || !message) return;
    const data = await adminFetch('/crm/broadcast', { method: 'POST', body: JSON.stringify({ tagIds: [selectedTag], message }) });
    setBroadcastResult(data);
  };

  const doTransfer = async () => {
    if (!transferFrom || !transferTo) return;
    setTransferResult(null);
    const data = await adminFetch('/customer/customers/transfer', {
      method: 'POST',
      body: JSON.stringify({ fromManagerId: transferFrom, toManagerId: transferTo }),
    });
    setTransferResult(data);
    load();
  };

  const addManager = async () => {
    if (!newManagerUser) return;
    await adminFetch('/customer/managers', {
      method: 'POST',
      body: JSON.stringify({ username: newManagerUser, displayName: newManagerName, role: newManagerRole }),
    });
    setNewManagerUser(''); setNewManagerName(''); load();
  };

  // 给用户添加标签

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-white">CRM 客户管理</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowTransfer(!showTransfer)} className="px-3 py-2 bg-[#30363d] text-white text-xs rounded-lg">{showTransfer ? '关闭转移' : '客户转移'}</button>
          <button onClick={() => setShowAddManager(!showAddManager)} className="px-3 py-2 bg-[#D4AF37] text-black text-xs font-bold rounded-lg">{showAddManager ? '关闭' : '新建经理'}</button>
        </div>
      </div>

      {/* 客户转移 */}
      {showTransfer && (
        <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-4">
          <h2 className="text-sm font-bold text-white mb-3">🔄 客户转移（经理离职）</h2>
          <div className="flex gap-2 mb-3">
            <select value={transferFrom} onChange={e => setTransferFrom(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs outline-none">
              <option value="">选择源经理</option>
              {managers.map((m: any) => <option key={m.id} value={m.id}>{m.displayName} ({m.customerCount}人)</option>)}
            </select>
            <span className="text-[#8b949e] text-xs self-center">→</span>
            <select value={transferTo} onChange={e => setTransferTo(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs outline-none">
              <option value="">选择目标经理</option>
              {managers.filter((m: any) => m.id !== transferFrom).map((m: any) => <option key={m.id} value={m.id}>{m.displayName}</option>)}
            </select>
            <button onClick={doTransfer} disabled={!transferFrom || !transferTo}
              className="px-4 py-2 bg-[#C8102E] text-white text-xs font-bold rounded-lg disabled:opacity-50">执行转移</button>
          </div>
          {transferResult && (
            <div className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d]">
              <p className="text-xs text-[#3fb950]">✓ 已将 {transferResult.from} 名下 {transferResult.count} 个客户转移到 {transferResult.to}</p>
            </div>
          )}
        </div>
      )}

      {/* 新建经理 */}
      {showAddManager && (
        <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-4">
          <h2 className="text-sm font-bold text-white mb-3">👤 新建经理/客服</h2>
          <div className="flex gap-2 mb-3">
            <input type="text" placeholder="用户名" value={newManagerUser}
              onChange={e => setNewManagerUser(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs placeholder-[#8b949e] outline-none" />
            <input type="text" placeholder="显示名称" value={newManagerName}
              onChange={e => setNewManagerName(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs placeholder-[#8b949e] outline-none" />
            <select value={newManagerRole} onChange={e => setNewManagerRole(e.target.value)}
              className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs outline-none">
              <option value="manager">经理</option>
              <option value="customer_service">客服</option>
            </select>
            <button onClick={addManager} disabled={!newManagerUser}
              className="px-4 py-2 bg-[#D4AF37] text-black text-xs font-bold rounded-lg disabled:opacity-50">创建</button>
          </div>
          <p className="text-[#8b949e] text-2xs">初始密码: 123456</p>
        </div>
      )}

      {managers.length > 0 && (
        <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-4">
          <h2 className="text-sm font-bold text-white mb-3">👥 经理列表</h2>
          <div className="flex flex-wrap gap-2">
            {managers.map((m: any) => (
              <span key={m.id} className="px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full text-xs text-[#D4AF37]">
                {m.displayName} ({m.customerCount}客户) {m.role === 'admin' ? '⭐' : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 标签管理 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

      {/* 客户列表 */}
      <div className="bg-[#161b22] rounded-lg border border-[#30363d] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#30363d] flex justify-between items-center">
          <h2 className="text-xs font-bold text-white">客户列表 ({users.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-[#8b949e] text-xs">
              <th className="text-left px-4 py-3">用户名</th>
              <th className="text-left px-4 py-3">显示名</th>
              <th className="text-left px-4 py-3">手机</th>
              <th className="text-left px-4 py-3">角色</th>
              <th className="text-left px-4 py-3">归属经理</th>
              <th className="text-left px-4 py-3">状态</th>
              <th className="text-left px-4 py-3">余额</th>
            </tr></thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-b border-[#30363d] hover:bg-[#1c2128]">
                  <td className="px-4 py-3 text-white text-xs">{u.username}</td>
                  <td className="px-4 py-3 text-[#e6edf3] text-xs">{u.displayName || '-'}</td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">{u.phone || '-'}</td>
                  <td className="px-4 py-3 text-xs">{u.role === 'admin' ? '管理员' : u.role === 'manager' ? '经理' : u.role === 'customer_service' ? '客服' : '用户'}</td>
                  <td className="px-4 py-3 text-xs text-[#8b949e]">{u.managedBy ? managers.find((m: any) => m.id === u.managedBy)?.displayName || u.managedBy?.slice(0, 8) : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${u.status === 'active' ? 'text-[#3fb950]' : u.status === 'pending' ? 'text-[#D4AF37]' : 'text-[#f85149]'}`}>
                      {u.status === 'active' ? '已激活' : u.status === 'pending' ? '待审核' : '已禁用'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#D4AF37] text-xs">¥{u.balance || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
