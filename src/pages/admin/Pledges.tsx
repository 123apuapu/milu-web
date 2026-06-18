import { useState, useEffect } from 'react';
import { adminFetch } from '../../lib/api';

export default function AdminPledges() {
  const [pledges, setPledges] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ userId: '', type: 'direct', title: '', lotName: '' });
  const [users, setUsers] = useState<any[]>([]);

  const load = () => {
    adminFetch('/pledges').then(setPledges).catch(() => {});
    adminFetch('/users?limit=100').then(d => setUsers(d.users || [])).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const imageUrl = ev.target?.result as string;
        await adminFetch('/pledges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, imageUrl }),
        });
        setShowForm(false);
        setForm({ userId: '', type: 'direct', title: '', lotName: '' });
        load();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-white">送拍管理</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#D4AF37] text-black text-xs font-bold rounded-lg">
          + 上传拍卖函
        </button>
      </div>

      {showForm && (
        <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-4 mb-4">
          <h2 className="text-sm font-bold text-white mb-3">上传新拍卖函</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <select value={form.userId} onChange={(e) => setForm({...form, userId: e.target.value})}
              className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs outline-none">
              <option value="">选择客户</option>
              {users.map((u: any) => (
                <option key={u.id} value={u.id}>{u.username} ({u.displayName || ''})</option>
              ))}
            </select>
            <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}
              className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs outline-none">
              <option value="direct">定向送拍</option>
              <option value="guarantee">担保送拍</option>
            </select>
            <input type="text" placeholder="标题（如：2026春拍-001）" value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
              className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs placeholder-[#8b949e] outline-none" />
            <input type="text" placeholder="拍品名称（选填）" value={form.lotName}
              onChange={(e) => setForm({...form, lotName: e.target.value})}
              className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs placeholder-[#8b949e] outline-none" />
          </div>
          <button onClick={handleUpload} disabled={!form.userId || !form.title}
            className="px-4 py-2 bg-[#D4AF37] text-black text-xs font-bold rounded-lg disabled:opacity-50">
            选择图片并上传
          </button>
        </div>
      )}

      <div className="bg-[#161b22] rounded-lg border border-[#30363d] overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-[#30363d] text-[#8b949e] text-xs">
            <th className="text-left px-4 py-3">客户</th>
            <th className="text-left px-4 py-3">类型</th>
            <th className="text-left px-4 py-3">标题</th>
            <th className="text-left px-4 py-3">拍品</th>
            <th className="text-left px-4 py-3">状态</th>
            <th className="text-left px-4 py-3">时间</th>
          </tr></thead>
          <tbody>
            {pledges.map((p: any) => (
              <tr key={p.id} className="border-b border-[#30363d] hover:bg-[#1c2128]">
                <td className="px-4 py-3 text-white text-xs">{p.user?.username || p.userId}</td>
                <td className="px-4 py-3">
                  <span className="text-xs">{p.type === 'direct' ? '定向送拍' : '担保送拍'}</span>
                </td>
                <td className="px-4 py-3 text-[#8b949e] text-xs">{p.title}</td>
                <td className="px-4 py-3 text-[#8b949e] text-xs">{p.lotName || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs ${p.status === 'pending' ? 'text-[#D4AF37]' : 'text-[#3fb950]'}`}>
                    {p.status === 'pending' ? '待处理' : '已处理'}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#8b949e] text-xs">
                  {p.createdAt ? new Date(p.createdAt).toLocaleDateString('zh-CN') : '-'}
                </td>
              </tr>
            ))}
            {pledges.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-[#8b949e]">暂无送拍记录</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
