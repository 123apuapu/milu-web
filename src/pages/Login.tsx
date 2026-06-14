import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';
import { initMatrixClient } from '../lib/matrix';

export default function Login() {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuthUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  const setMatrixInfo = useAuthStore((s) => s.setMatrixInfo);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(user, password);
      setToken(data.local_token || data.access_token);

      // 设置本地用户
      const localUser = data.local_user || { id: data.user_id, displayName: user, nickname: user, role: 'user', isVerified: false, balance: 0 };
      setAuthUser({
        id: localUser.id,
        displayName: localUser.displayName || user,
        nickname: localUser.nickname || user,
        avatar: localUser.avatar,
        phone: localUser.phone,
        role: localUser.role || 'user',
        isVerified: localUser.isVerified || false,
        balance: localUser.balance || 0,
      });
      setToken(data.local_token);
      setMatrixInfo(data.access_token, data.user_id, data.device_id || '');

      // 初始化 Matrix 客户端
      try {
        const deviceId = data.device_id || `web_${Date.now()}`;
        initMatrixClient('https://matrix.4.dpjp.cn', data.access_token, data.user_id, deviceId);
      } catch {}

      // 获取完整用户资料
      try {
        const profile = await api.getProfile();
        setAuthUser({
          id: profile.id,
          displayName: profile.displayName || user,
          nickname: profile.nickname || user,
          avatar: profile.avatar,
          phone: profile.phone,
          role: profile.role || 'user',
          isVerified: profile.isVerified || false,
          balance: profile.balance || 0,
        });
      } catch {}

      navigate('/messages');
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 bg-[#0d1117]">
      <div className="text-5xl mb-4">🦌</div>
      <h1 className="text-2xl font-bold mb-1 text-white">密鹿</h1>
      <p className="text-[#8b949e] mb-8">尚龙阁 · 安全加密通讯</p>
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <input type="text" placeholder="用户名" value={user}
          onChange={(e) => setUser(e.target.value)}
          className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-lg text-white placeholder-[#8b949e] outline-none focus:border-[#D4AF37]" />
        <input type="password" placeholder="密码" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-lg text-white placeholder-[#8b949e] outline-none focus:border-[#D4AF37]" />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black font-bold rounded-lg disabled:opacity-50">
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
      <p className="mt-6 text-[#8b949e] text-sm">
        没有账号？{' '}
        <button onClick={() => navigate('/register')} className="text-[#D4AF37] underline">注册</button>
      </p>
    </div>
  );
}
