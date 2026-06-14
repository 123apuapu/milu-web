import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function Verification() {
  const navigate = useNavigate();
  const [frontImg, setFrontImg] = useState<string | null>(null);
  const [backImg, setBackImg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = (side: 'front' | 'back') => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (side === 'front') setFrontImg(ev.target?.result as string);
        else setBackImg(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleSubmit = async () => {
    if (!frontImg || !backImg) return;
    setError('');
    try {
      await api.submitVerification(frontImg, backImg);
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || '提交失败');
    }
  };

  if (submitted) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
          <button onClick={() => navigate('/profile')} className="text-[#8b949e] text-lg">‹</button>
          <h1 className="text-white font-medium text-sm">实名认证</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-white font-bold mb-2">提交成功</h2>
          <p className="text-[#8b949e] text-sm text-center">认证信息已提交<br/>我们将在1-3个工作日内审核</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
        <button onClick={() => navigate('/profile')} className="text-[#8b949e] text-lg">‹</button>
        <h1 className="text-white font-medium text-sm">实名认证</h1>
      </div>
      <div className="flex-1 p-4 space-y-4">
        <p className="text-[#8b949e] text-xs">请上传身份证正反面照片</p>
        <div onClick={() => handleUpload('front')} className="h-40 bg-[#161b22] rounded-lg border border-dashed border-[#30363d] flex flex-col items-center justify-center cursor-pointer active:border-[#D4AF37]">
          {frontImg ? <img src={frontImg} className="h-full object-contain p-2" /> : <><span className="text-3xl mb-2">📷</span><span className="text-[#8b949e] text-xs">点击上传身份证正面</span></>}
        </div>
        <div onClick={() => handleUpload('back')} className="h-40 bg-[#161b22] rounded-lg border border-dashed border-[#30363d] flex flex-col items-center justify-center cursor-pointer active:border-[#D4AF37]">
          {backImg ? <img src={backImg} className="h-full object-contain p-2" /> : <><span className="text-3xl mb-2">📷</span><span className="text-[#8b949e] text-xs">点击上传身份证反面</span></>}
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button onClick={handleSubmit} disabled={!frontImg || !backImg}
          className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black font-bold rounded-lg text-sm disabled:opacity-50">提交认证</button>
      </div>
    </div>
  );
}
