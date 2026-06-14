import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function Complaint() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!content.trim()) return;
    try {
      await api.submitComplaint(content);
      setDone(true);
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (done) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
          <button onClick={() => navigate('/profile')} className="text-[#8b949e] text-lg">‹</button>
          <h1 className="text-white font-medium text-sm">投诉</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-white">投诉已提交，我们会尽快处理</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
        <button onClick={() => navigate('/profile')} className="text-[#8b949e] text-lg">‹</button>
        <h1 className="text-white font-medium text-sm">投诉</h1>
      </div>
      <div className="flex-1 p-4">
        <textarea className="w-full h-40 px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-lg text-white text-sm placeholder-[#8b949e] outline-none resize-none" placeholder="请描述您的问题..." value={content} onChange={(e) => setContent(e.target.value)} />
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        <button onClick={handleSubmit} disabled={!content.trim()} className="w-full mt-4 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black font-bold rounded-lg disabled:opacity-50">提交投诉</button>
      </div>
    </div>
  );
}
