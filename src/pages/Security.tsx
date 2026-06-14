import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


export default function Security() {
  const navigate = useNavigate();
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    setError('');
    if (!oldPwd || !newPwd) { setError('请填写完整'); return; }
    if (newPwd.length < 6) { setError('密码至少6位'); return; }
    if (newPwd !== confirmPwd) { setError('两次密码不一致'); return; }
    // Matrix 没有直接改密码API，先提示
    alert('密码修改功能需在Matrix服务端配置，请联系管理员操作');
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
        <h1 style={{ fontSize: 16, fontWeight: 600, color: '#e6edf3' }}>账号安全</h1>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: 20 }}>
        <div style={{
          background: '#151b26', border: '1px solid #1c2636',
          borderRadius: 12, overflow: 'hidden', marginBottom: 20,
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1c2636' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 4 }}>修改密码</div>
            <div style={{ fontSize: 12, color: '#7d8590' }}>建议定期更换密码以保障账号安全</div>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input type="password" placeholder="当前密码" value={oldPwd}
              onChange={(e) => setOldPwd(e.target.value)}
              style={{
                width: '100%', padding: '11px 14px', background: '#0d1117',
                border: '1px solid #1c2636', borderRadius: 8,
                color: '#e6edf3', fontSize: 13, outline: 'none',
              }} />
            <input type="password" placeholder="新密码（至少6位）" value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              style={{
                width: '100%', padding: '11px 14px', background: '#0d1117',
                border: '1px solid #1c2636', borderRadius: 8,
                color: '#e6edf3', fontSize: 13, outline: 'none',
              }} />
            <input type="password" placeholder="确认新密码" value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              style={{
                width: '100%', padding: '11px 14px', background: '#0d1117',
                border: '1px solid #1c2636', borderRadius: 8,
                color: '#e6edf3', fontSize: 13, outline: 'none',
              }} />
            {error && <div style={{ fontSize: 12, color: '#f85149' }}>{error}</div>}
            <button onClick={handleChangePassword}
              style={{
                width: '100%', padding: 11,
                background: 'linear-gradient(135deg, #D4AF37, #B8962E)',
                border: 'none', borderRadius: 8, color: '#000',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
              修改密码
            </button>
          </div>
        </div>

        <div style={{
          background: '#151b26', border: '1px solid #1c2636',
          borderRadius: 12, overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 4 }}>登录设备</div>
            <div style={{ fontSize: 12, color: '#7d8590' }}>当前设备：密鹿 Web</div>
          </div>
        </div>
      </div>
    </div>
  );
}
