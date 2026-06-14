export default function AdminContent() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-4">📝 内容管理</h1>
      <div className="space-y-4">
        <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-4">
          <h2 className="text-sm font-bold text-white mb-3">征集规则</h2>
          <textarea className="w-full h-32 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs placeholder-[#8b949e] outline-none resize-none" 
            defaultValue="征集规则内容待更新，请在此编辑..." />
        </div>
        <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-4">
          <h2 className="text-sm font-bold text-white mb-3">违约名单</h2>
          <textarea className="w-full h-32 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs placeholder-[#8b949e] outline-none resize-none"
            defaultValue="违约名单内容待更新，请在此编辑..." />
        </div>
        <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-4">
          <h2 className="text-sm font-bold text-white mb-3">征集师背书</h2>
          <textarea className="w-full h-32 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-xs placeholder-[#8b949e] outline-none resize-none"
            defaultValue="征集师背书内容待更新，请在此编辑..." />
        </div>
        <button className="px-6 py-2 bg-[#D4AF37] text-black text-xs font-bold rounded-lg">保存所有内容</button>
      </div>
    </div>
  );
}