
const mockGroups = [
  { id: 'g1', name: '尚龙阁VIP客户群', members: 128, avatar: '👑', lastMsg: '张经理: 各位好，本次春拍...' },
  { id: 'g2', name: '瓷器收藏交流群', members: 56, avatar: '🏺', lastMsg: '王收藏家: 这件乾隆官窑...' },
  { id: 'g3', name: '字画鉴赏群', members: 89, avatar: '🖼️', lastMsg: '李老师: 这幅画的笔墨...' },
];

export default function Groups() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-4 pb-2 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">群聊</h1>
        <span className="text-[#D4AF37] text-sm">+ 创建群聊</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {mockGroups.map((g) => (
          <div key={g.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#30363d] active:bg-[#1c2128] cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-[#21262d] flex items-center justify-center text-xl flex-shrink-0">{g.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-medium text-sm">{g.name}</h3>
                <span className="text-[#8b949e] text-xs">{g.members}人</span>
              </div>
              <p className="text-[#8b949e] text-sm truncate mt-0.5">{g.lastMsg}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
