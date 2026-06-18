import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function Wallet() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [bankCards, setBankCards] = useState<any[]>([]);
  const [showRecharge, setShowRecharge] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showBind, setShowBind] = useState(false);
  const [amount, setAmount] = useState('');
  const [bank, setBank] = useState({ name: '', cardNo: '', bankName: '' });

  const loadWallet = async () => {
    try {
      const data = await api.getWallet();
      setBalance(data.balance || 0);
      setBankCards(data.bankCards || []);
    } catch {} }


  useEffect(() => { loadWallet(); }, []);

  const handleRecharge = async () => {
    try { const data = await api.recharge(Number(amount)); setBalance(data.balance); setShowRecharge(false); setAmount(''); } catch (e: any) { alert(e.message); }
  };

  const handleWithdraw = async () => {
    const card = bankCards[0];
    if (!card) { alert('请先绑定银行卡'); return; }
    try { const data = await api.withdraw(Number(amount), card.cardNo); setBalance(data.balance); setShowWithdraw(false); setAmount(''); } catch (e: any) { alert(e.message); }
  };

  const handleBindCard = async () => {
    try { await api.bindBankCard(bank.name, bank.cardNo, bank.bankName); setShowBind(false); loadWallet(); } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
        <button onClick={() => navigate('/profile')} className="text-[#8b949e] text-lg">‹</button>
        <h1 className="text-white font-medium text-sm">我的钱包</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-6 text-center mb-4">
          <p className="text-[#8b949e] text-sm mb-1">账户余额</p>
          <p className="text-3xl font-bold text-[#D4AF37]">¥{balance.toLocaleString()}</p>
        </div>
        <div className="flex gap-3 mb-4">
          <button onClick={() => setShowRecharge(true)} className="flex-1 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black font-bold rounded-lg text-sm">充值</button>
          <button onClick={() => bankCards.length > 0 ? setShowWithdraw(true) : setShowBind(true)} className="flex-1 py-3 bg-[#21262d] border border-[#30363d] text-white rounded-lg text-sm">{bankCards.length > 0 ? '提现' : '绑定银行卡'}</button>
        </div>
        <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm font-bold">我的银行卡</h3>
            <button onClick={() => setShowBind(true)} className="text-[#D4AF37] text-xs">+ 添加</button>
          </div>
          {bankCards.length === 0 ? (
            <p className="text-[#8b949e] text-xs text-center py-4">暂无绑定银行卡</p>
          ) : (
            bankCards.map((card, i) => (
              <div key={i} className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d] text-sm">
                <p className="text-white">{card.bankName}</p>
                <p className="text-[#8b949e] text-xs">**** {card.cardNo.slice(-4)}</p>
                <p className="text-[#8b949e] text-xs">{card.name}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {showRecharge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-white font-bold mb-4">充值</h3>
            <input type="number" placeholder="充值金额（元）" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-sm placeholder-[#8b949e] outline-none mb-4" />
            <button onClick={handleRecharge} className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black font-bold rounded-lg text-sm mb-2">确认充值</button>
            <button onClick={() => setShowRecharge(false)} className="w-full text-[#8b949e] text-sm">取消</button>
          </div>
        </div>
      )}

      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-white font-bold mb-4">提现</h3>
            <input type="number" placeholder="提现金额（元）" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-sm placeholder-[#8b949e] outline-none mb-3" />
            <p className="text-[#8b949e] text-xs mb-4">提现至：{bankCards[0]?.bankName} ({bankCards[0]?.cardNo?.slice(-4)})</p>
            <button onClick={handleWithdraw} className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black font-bold rounded-lg text-sm mb-2">确认提现</button>
            <button onClick={() => setShowWithdraw(false)} className="w-full text-[#8b949e] text-sm">取消</button>
          </div>
        </div>
      )}

      {showBind && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-white font-bold mb-4">绑定银行卡</h3>
            <div className="space-y-3 mb-4">
              <input type="text" placeholder="持卡人姓名" value={bank.name} onChange={(e) => setBank({...bank, name: e.target.value})}
                className="w-full px-3 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs placeholder-[#8b949e] outline-none" />
              <input type="text" placeholder="银行卡号" value={bank.cardNo} onChange={(e) => setBank({...bank, cardNo: e.target.value})}
                className="w-full px-3 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs placeholder-[#8b949e] outline-none" />
              <input type="text" placeholder="银行名称（如：中国工商银行）" value={bank.bankName} onChange={(e) => setBank({...bank, bankName: e.target.value})}
                className="w-full px-3 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs placeholder-[#8b949e] outline-none" />
            </div>
            <button onClick={handleBindCard} className="w-full py-2.5 bg-[#D4AF37] text-black text-xs font-bold rounded-lg mb-2">保存银行卡</button>
            <button onClick={() => setShowBind(false)} className="w-full text-[#8b949e] text-sm">取消</button>
          </div>
        </div>
      )}
    </div>
  );
}
