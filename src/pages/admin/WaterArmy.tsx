import { useState } from 'react';
import { adminFetch } from '../../lib/api';

export default function AdminWaterArmy() {
  const [count, setCount] = useState(5);
  const [prefix, setPrefix] = useState('bot_');
  const [roomId, setRoomId] = useState('');
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const createBots = async () => {
    setLoading(true);
    try {
      const data = await adminFetch('/water-army/create', {
        method: 'POST',
        body: JSON.stringify({ count, prefix, roomId: roomId || undefined }),
      });
      setBots(data.bots || []);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-4">🤖 水军系统</h1>

      <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-4 mb-6">
        <h2 className="text-sm font-bold text-white mb-3">创建小号</h2>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-[#8b949e] text-xs block mb-1">数量</label>
            <input type="number" min={1} max={50} value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs outline-none" />
          </div>
          <div>
            <label className="text-[#8b949e] text-xs block mb-1">前缀</label>
            <input type="text" value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs outline-none" />
          </div>
          <div>
            <label className="text-[#8b949e] text-xs block mb-1">群聊房间ID（选填）</label>
            <input type="text" value={roomId} placeholder="留空只创建账号"
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs outline-none" />
          </div>
        </div>
        <button onClick={createBots} disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black text-xs font-bold rounded-lg disabled:opacity-50">
          {loading ? '创建中...' : `创建 ${count} 个小号`}
        </button>
      </div>

      {bots.length > 0 && (
        <div className="bg-[#161b22] rounded-lg border border-[#30363d] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#30363d] flex justify-between items-center">
            <h2 className="text-sm font-bold text-white">已创建 {bots.length} 个小号</h2>
            <button onClick={() => {
              const text = bots.map((b: any) => `${b.username}\t${b.password}`).join('\n');
              navigator.clipboard?.writeText(text);
              alert('已复制账号信息');
            }} className="text-[#D4AF37] text-xs">📋 复制全部</button>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-[#8b949e] text-xs">
              <th className="text-left px-4 py-3">用户名</th>
              <th className="text-left px-4 py-3">密码</th>
              <th className="text-left px-4 py-3">状态</th>
            </tr></thead>
            <tbody>
              {bots.map((b: any, i: number) => (
                <tr key={i} className="border-b border-[#30363d] hover:bg-[#1c2128]">
                  <td className="px-4 py-3 text-white text-xs font-mono">{b.username}</td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs font-mono">{b.password}</td>
                  <td className="px-4 py-3"><span className="text-[#3fb950] text-xs">已创建</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
