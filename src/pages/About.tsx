import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
        <button onClick={() => navigate('/profile')} className="text-[#8b949e] text-lg">‹</button>
        <h1 className="text-white font-medium text-sm">关于我们</h1>
      </div>
      <div className="flex-1 p-4 space-y-4">
        <div className="text-center py-6">
          <div className="text-5xl mb-3">🦌</div>
          <h2 className="text-white font-bold text-lg">密鹿 · 尚龙阁</h2>
          <p className="text-[#8b949e] text-sm">安全端到端加密通讯平台</p>
        </div>
        <button className="w-full p-4 bg-[#161b22] rounded-lg border border-[#30363d] text-left flex items-center justify-between">
          <span className="text-sm text-white">用户协议</span>
          <span className="text-[#30363d]">›</span>
        </button>
        <button className="w-full p-4 bg-[#161b22] rounded-lg border border-[#30363d] text-left flex items-center justify-between">
          <span className="text-sm text-white">隐私政策</span>
          <span className="text-[#30363d]">›</span>
        </button>
        <p className="text-[#585e66] text-xs text-center pt-4">尚龙阁拍卖行 © 2026</p>
      </div>
    </div>
  );
}
