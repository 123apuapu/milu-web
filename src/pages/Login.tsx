import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import api from "../lib/api";

export default function Login() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuthUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.login(user, password);
      const token = data.local_token || data.access_token;
      setToken(token);
      const localUser = data.local_user || { id: data.user_id, displayName: user, nickname: user, role: "user", isVerified: false, balance: 0 };
      setAuthUser({
        userId: localUser.userId || 0,
        id: localUser.id, displayName: localUser.displayName || user, nickname: localUser.nickname || user,
        avatar: localUser.avatar, phone: localUser.phone, role: localUser.role || "user",
        isVerified: localUser.isVerified || false, balance: localUser.balance || 0,
      });
      try { const p = await api.getProfile(); setAuthUser(p); } catch {}
      navigate("/messages");
    } catch (err: any) {
      setError(err.message || "登录失败");
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
        <input type="text" placeholder="用户名" value={user} onChange={e => setUser(e.target.value)}
          className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-lg text-white placeholder-[#8b949e] outline-none focus:border-[#D4AF37]" />
        <input type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-lg text-white placeholder-[#8b949e] outline-none focus:border-[#D4AF37]" />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black font-bold rounded-lg disabled:opacity-50">
          {loading ? "登录中..." : "登录"}
        </button>
      </form>
      <p className="mt-6 text-[#8b949e] text-sm">没有账号？<button onClick={() => navigate("/register")} className="text-[#D4AF37] underline">注册</button></p>
    </div>
  );
}
