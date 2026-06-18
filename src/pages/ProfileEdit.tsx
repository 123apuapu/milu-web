import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setAuthUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({ nickname: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getProfile().then((p) => {
      setForm({ nickname: p.nickname || p.displayName || '', phone: p.phone || '' });
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile({ nickname: form.nickname, phone: form.phone });
      if (user) setAuthUser({ ...user, nickname: form.nickname, phone: form.phone });
      alert('保存成功');
    } catch (e: any) {
      alert(e.message || '保存失败');
    } finally { setSaving(false); }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#080b12' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px', background: '#0f141c',
        borderBottom: '1px solid #1c2636',
      }}>
        <button onClick={() => navigate('/profile')}
          style={{ background: 'none', border: 'none', color: '#7d8590', fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>
          ‹
        </button>
        <h1 style={{ fontSize: 16, fontWeight: 600, color: '#e6edf3' }}>个人资料</h1>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: 20 }}>
        {/* 头像 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #D4AF37, #B8962E)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, color: '#000', fontWeight: 700, marginBottom: 12,
            border: '3px solid rgba(212,175,55,0.3)',
          }}>
            {(user?.displayName || '?')[0].toUpperCase()}
          </div>
          <button style={{
            background: '#151b26', border: '1px solid #1c2636',
            borderRadius: 8, padding: '6px 16px', color: '#D4AF37',
            fontSize: 12, cursor: 'pointer',
          }}>更换头像</button>
        </div>

        {/* 表单 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ fontSize: 12, color: '#7d8590', display: 'block', marginBottom: 6, fontWeight: 500 }}>用户名</label>
            <div style={{
              padding: '11px 14px', background: '#0d1117',
              border: '1px solid #1c2636', borderRadius: 8,
              color: '#484f58', fontSize: 13,
            }}>
              @{user?.displayName || user?.id?.slice(0, 12)}
            </div>
            <div style={{ fontSize: 11, color: '#484f58', marginTop: 4 }}>用户名不可修改</div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#7d8590', display: 'block', marginBottom: 6, fontWeight: 500 }}>昵称</label>
            <input type="text" value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              style={{
                width: '100%', padding: '11px 14px', background: '#0d1117',
                border: '1px solid #1c2636', borderRadius: 8,
                color: '#e6edf3', fontSize: 13, outline: 'none',
              }}
              placeholder="设置你的昵称" />
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#7d8590', display: 'block', marginBottom: 6, fontWeight: 500 }}>手机号</label>
            <input type="tel" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              style={{
                width: '100%', padding: '11px 14px', background: '#0d1117',
                border: '1px solid #1c2636', borderRadius: 8,
                color: '#e6edf3', fontSize: 13, outline: 'none',
              }}
              placeholder="绑定手机号" />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          style={{
            width: '100%', marginTop: 28, padding: 12,
            background: 'linear-gradient(135deg, #D4AF37, #B8962E)',
            border: 'none', borderRadius: 8, color: '#000',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            opacity: saving ? 0.6 : 1,
          }}>
          {saving ? '保存中...' : '保存修改'}
        </button>
      </div>
    </div>
  );
}
