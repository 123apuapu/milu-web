import { useState, useEffect } from 'react';
import { adminFetch } from '../../lib/api';

export default function AdminInvites() {
  const [codes, setCodes] = useState<any[]>([]);
  const [count, setCount] = useState(1);
  const [managerName, setManagerName] = useState('');

  const load = () => {
    adminFetch('/invite-codes').then(setCodes).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    await adminFetch('/invite-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count, managerName: managerName || undefined }),
    });
    setCount(1);
    setManagerName('');
    load();
  };

  const copyAll = () => {
    const text = codes.filter(c => !c.usedBy).map(c => c.code).join('\n');
    navigator.clipboard?.writeText(text);
    alert('已复制未使用的邀请码');
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-4">邀请码管理</h1>

      <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-4 mb-6">
        <h2 className="text-sm font-bold text-white mb-3">生成新邀请码</h2>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <label className="text-[#8b949e] text-xs block mb-1">归属经理</label>
            <input type="text" placeholder="经理名称（选填）" value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs placeholder-[#8b949e] outline-none" />
          </div>
          <div className="w-24">
            <label className="text-[#8b949e] text-xs block mb-1">数量</label>
            <input type="number" min={1} max={100} value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs outline-none" />
          </div>
          <button onClick={generate}
            className="mt-5 px-4 py-2 bg-[#D4AF37] text-black text-xs font-bold rounded-lg">生成</button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <p className="text-[#8b949e] text-xs">共 {codes.length} 个邀请码（未使用: {codes.filter(c => !c.usedBy).length}）</p>
        <button onClick={copyAll} className="text-[#D4AF37] text-xs">📋 复制全部未使用</button>
      </div>

      <div className="bg-[#161b22] rounded-lg border border-[#30363d] overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-[#30363d] text-[#8b949e] text-xs">
            <th className="text-left px-4 py-3">邀请码</th>
            <th className="text-left px-4 py-3">归属经理</th>
            <th className="text-left px-4 py-3">状态</th>
            <th className="text-left px-4 py-3">使用人</th>
            <th className="text-left px-4 py-3">创建时间</th>
          </tr></thead>
          <tbody>
            {codes.map((c: any) => (
              <tr key={c.id} className="border-b border-[#30363d] hover:bg-[#1c2128]">
                <td className="px-4 py-3 text-white font-mono text-xs">{c.code}</td>
                <td className="px-4 py-3 text-[#8b949e] text-xs">{c.managerName || '-'}</td>
                <td className="px-4 py-3">
                  <span className={c.usedBy ? 'text-[#8b949e]' : 'text-[#3fb950]'}>
                    {c.usedBy ? '已使用' : '未使用'}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#8b949e] text-xs">{c.usedBy || '-'}</td>
                <td className="px-4 py-3 text-[#8b949e] text-xs">
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString('zh-CN') : '-'}
                </td>
              </tr>
            ))}
            {codes.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-[#8b949e]">暂无邀请码</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
