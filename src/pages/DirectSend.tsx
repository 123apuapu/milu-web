import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function DirectSend() {
  const navigate = useNavigate();
  const [pledges, setPledges] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    api.getPledges().then((data) => setPledges(data || [])).catch(() => {});
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
        <button onClick={() => navigate('/send-pledge')} className="text-[#8b949e] text-lg">‹</button>
        <h1 className="text-white font-medium text-sm">定向送拍</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {pledges.length === 0 ? (
          <div className="text-center text-[#8b949e] py-12">
            <p className="text-4xl mb-3">📄</p>
            <p>暂无送拍记录</p>
            <p className="text-xs mt-2">由后台管理员为您上传拍卖函</p>
          </div>
        ) : selected === null ? (
          <div className="space-y-3">
            <p className="text-[#8b949e] text-xs mb-2">您的拍卖函（由后台管理员上传）</p>
            {pledges.map((doc: any, i: number) => (
              <div key={doc.id || i} onClick={() => setSelected(i)}
                className="bg-[#161b22] rounded-lg border border-[#30363d] overflow-hidden active:border-[#D4AF37] cursor-pointer">
                <div className="h-40 bg-[#21262d] flex items-center justify-center text-6xl opacity-30">📄</div>
                <div className="p-3">
                  <p className="text-white text-sm font-medium">{doc.title}</p>
                  <p className="text-[#8b949e] text-xs mt-0.5">{doc.lotName || ''}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <button onClick={() => setSelected(null)} className="text-[#8b949e] text-sm mb-4">‹ 返回列表</button>
            <div className="bg-[#161b22] rounded-lg border border-[#30363d] overflow-hidden">
              <div className="h-64 bg-[#21262d] flex items-center justify-center text-8xl opacity-20">
                {pledges[selected]?.imageUrl ? <img src={pledges[selected].imageUrl} className="w-full h-full object-contain" /> : '📄'}
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold mb-2">{pledges[selected]?.title}</h3>
                <p className="text-[#8b949e] text-sm">{pledges[selected]?.lotName || ''}</p>
                <p className="text-[#D4AF37] text-xs mt-4">状态: {pledges[selected]?.status === 'pending' ? '待处理' : '已处理'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
