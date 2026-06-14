import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();
  const [friendVerify, setFriendVerify] = useState(true);
  const [soundOn, setSoundOn] = useState(true);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
        <button onClick={() => navigate('/profile')} className="text-[#8b949e] text-lg">‹</button>
        <h1 className="text-white font-medium text-sm">通用设置</h1>
      </div>
      <div className="flex-1 p-4 space-y-4">
        <div className="bg-[#161b22] rounded-lg border border-[#30363d] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#30363d]">
            <span className="text-sm text-white">加好友时需要验证</span>
            <button onClick={() => setFriendVerify(!friendVerify)} className={`w-11 h-6 rounded-full relative transition-colors ${friendVerify ? 'bg-[#D4AF37]' : 'bg-[#30363d]'}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${friendVerify ? 'left-5.5' : 'left-0.5'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm text-white">消息提示音</span>
            <button onClick={() => setSoundOn(!soundOn)} className={`w-11 h-6 rounded-full relative transition-colors ${soundOn ? 'bg-[#D4AF37]' : 'bg-[#30363d]'}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${soundOn ? 'left-5.5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
