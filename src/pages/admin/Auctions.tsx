import { useState, useEffect } from 'react';
import { getToken } from '../../lib/api';

const AUCTION_API = '/api/auction';

export default function AdminAuctions() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [lots, setLots] = useState<any[]>([]);

  const authFetch = (url: string) => {
    const headers: Record<string, string> = {};
    const t = getToken();
    if (t) headers['Authorization'] = 'Bearer ' + t;
    return fetch(url, { headers }).then(r => r.json());
  };

  useEffect(() => {
    authFetch(AUCTION_API).then(setAuctions).catch(() => {});
  }, []);

  const loadDetail = async (id: string) => {
    const data = await authFetch(`${AUCTION_API}/${id}`);
    setSelected(data);
    setLots(data.lots || []);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-4">🏛️ 拍卖会管理</h1>

      {!selected ? (
        <div className="grid gap-3">
          {auctions.map((a: any) => (
            <div key={a.id} onClick={() => loadDetail(a.id)}
              className="bg-[#161b22] rounded-lg border border-[#30363d] p-4 cursor-pointer hover:border-[#D4AF37]">
              <h3 className="text-white font-medium text-sm">{a.name}</h3>
              <p className="text-[#8b949e] text-xs mt-1">{a.date} · {a.location}</p>
              <p className="text-[#8b949e] text-xs">{a._count?.lots || 0} 件拍品</p>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelected(null)} className="text-[#8b949e] text-sm mb-4">‹ 返回列表</button>
          <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-4 mb-4">
            <h2 className="text-white font-bold mb-2">{selected.name}</h2>
            <p className="text-[#8b949e] text-xs">{selected.date} · {selected.location}</p>
            <p className="text-[#8b949e] text-xs">预展: {selected.preview}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {lots.map((lot: any, i: number) => (
              <div key={lot.id || i} className="bg-[#161b22] rounded-lg border border-[#30363d] p-3">
                <div className="h-24 bg-[#21262d] rounded flex items-center justify-center text-2xl mb-2">
                  {lot.imageUrl ? <img src={lot.imageUrl} className="h-full object-cover rounded" /> : '🏺'}
                </div>
                <p className="text-white text-xs line-clamp-2">{lot.name}</p>
                <p className="text-[#D4AF37] text-xs mt-1">¥{lot.estimate}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
