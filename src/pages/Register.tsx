import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ username: '', password: '', inviteCode: '', phone: '' });
  const [inviteInfo, setInviteInfo] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const checkInviteCode = async () => {
    setError('');
    try {
      const data = await api.verifyInvite(form.inviteCode);
      if (!data.valid) {
        setError('邀请码无效或已被使用');
        return;
      }
      setInviteInfo(data);
      setStep(2);
    } catch (err: any) {
      setError(err.message || '验证失败');
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      await api.register(form.username, form.password, form.inviteCode, form.phone);
      setStep(3);
    } catch (err: any) {
      setError(err.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 bg-[#0d1117]">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-white mb-2">申请已提交</h2>
        <p className="text-[#8b949e] text-center mb-6">请耐心等待审核<br/>审核通过后即可登录使用</p>
        <button onClick={() => navigate('/login')} className="px-8 py-3 bg-[#D4AF37] text-black font-bold rounded-lg">返回登录</button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 bg-[#0d1117]">
      <div className="text-5xl mb-4">🦌</div>
      <h2 className="text-xl font-bold text-white mb-6">注册密鹿账号</h2>
      <div className="w-full max-w-sm space-y-4">
        {step === 1 && (
          <>
            <input type="text" placeholder="用户名" value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-lg text-white placeholder-[#8b949e] outline-none focus:border-[#D4AF37]" />
            <input type="password" placeholder="密码（至少6位）" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-lg text-white placeholder-[#8b949e] outline-none focus:border-[#D4AF37]" />
            <input type="text" placeholder="邀请码（必填）" value={form.inviteCode}
              onChange={(e) => setForm({ ...form, inviteCode: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-lg text-white placeholder-[#8b949e] outline-none focus:border-[#D4AF37]" />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={checkInviteCode}
              disabled={!form.username || !form.password || !form.inviteCode}
              className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black font-bold rounded-lg disabled:opacity-50">
              下一步
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <div className="p-3 bg-[#161b22] rounded-lg border border-[#30363d] text-sm text-[#8b949e]">
              <p>邀请码验证通过</p>
              {inviteInfo?.managerName && <p className="text-[#D4AF37] mt-1">归属经理：{inviteInfo.managerName}</p>}
            </div>
            <input type="tel" placeholder="手机号（选填）" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-lg text-white placeholder-[#8b949e] outline-none focus:border-[#D4AF37]" />
            <button onClick={handleRegister} disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black font-bold rounded-lg disabled:opacity-50">
              {loading ? '提交中...' : '提交申请'}
            </button>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={() => setStep(1)} className="w-full text-[#8b949e] text-sm">返回上一步</button>
          </>
        )}
        <p className="text-center text-[#8b949e] text-sm">
          已有账号？<button onClick={() => navigate('/login')} className="text-[#D4AF37] underline ml-1">登录</button>
        </p>
      </div>
    </div>
  );
}
