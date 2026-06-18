import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { startCall, addChatMessageListener } from '../lib/webrtc';
import { useAuthStore } from '../stores/authStore';
const EMOJIS = [
  '😀','😃','😄','😁','😆','😂','🤣','😊','😇','🙂','😉','😌','😍','🥰','😘','😗',
  '😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤔','🤐','😐','😑','😶','😏','😒','🙄',
  '😬','😮','😯','😲','😳','🥺','😢','😭','😤','😠','😡','🤬','😈','👿','💀','☠️',
  '💩','🤡','👹','👺','👻','👽','👾','🤖','🎃','😺','😸','😹','😻','😼','😽','🙀',
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💕','💞','💗','💖','💘','💝','💟',
  '👍','👎','👊','✊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✌️','🤘','🤙','💪',
  '🎉','🎊','🎈','🎁','🏆','🥇','🥈','🥉','🏅','🎖️','🌟','✨','⭐','🔥','💯','✅',
  '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈',
  '🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝',
  '☕','🍵','🥤','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧊','🥄','🍴','🥣','🍽️','🎂',
];
export default function ChatRoom() {
  const { roomId } = useParams() as { roomId: string };
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [roomName, setRoomName] = useState('聊天');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [uploading] = useState(false);
  void uploading;
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!roomId) return;
    api.getMessages(roomId).then(setMessages).catch(() => {});
    api.getConversations().then((convs: any[]) => {
      const conv = convs.find((c: any) => c.id === roomId);
      if (conv) setRoomName(conv.name);
    }).catch(() => {});
  }, [roomId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => {
    const unsub = addChatMessageListener((msg: any) => {
      if (msg.senderId === user?.id) return;
      if (msg.conversationId === roomId) {
        setMessages((prev: any[]) => {
          if (prev.some((m: any) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    });
    return () => unsub();
  }, [roomId, user?.id]);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setShowEmoji(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const handleSend = async (content: string, type = 'text') => {
    if (!content.trim()) return;
    setInput('');
    const tempId = 'temp-' + Date.now();
    setMessages((prev: any[]) => [...prev, { id: tempId, senderId: user?.id, sender: { username: 'me' }, content, type, createdAt: new Date().toISOString() }]);
    try { const msg = await api.sendMessage(roomId, content, type); setMessages((prev: any[]) => prev.map((m: any) => m.id === tempId ? msg : m)); }
    catch { setMessages((prev: any[]) => prev.filter((m: any) => m.id !== tempId)); }
  };
  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = async () => { const base64 = reader.result as string; const { url } = await api.uploadImage(base64); await handleSend(url, 'image'); };
      reader.readAsDataURL(file);
    } catch { alert('上传失败'); }
    if (fileRef.current) fileRef.current.value = '';
  };
  const handleEmojiClick = (emoji: string) => { setInput(prev => prev + emoji); setShowEmoji(false); };
  const handleCall = (video: boolean) => { startCall({ conversationId: roomId, remoteUserId: '', remoteUserName: roomName, video }); };
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#111' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', background: '#1A1A1A', borderBottom: '1px solid #252525' }}>
        <button onClick={() => navigate('/messages')} style={{ background: 'none', border: 'none', color: '#07C160', fontSize: 18, cursor: 'pointer', padding: '0 8px 0 0', lineHeight: 1 }}>‹ 返回</button>
        <div style={{ flex: 1, textAlign: 'center', color: '#E6E6E6', fontWeight: 600, fontSize: 16 }}>{roomName}</div>
        <div style={{ width: 28 }} />
      </div>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
        {messages.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <p style={{ color: '#7F7F7F', fontSize: 13 }}>暂无消息</p>
          </div>
        ) : messages.map((msg: any) => {
          const isMe = msg.senderId === user?.id || msg.id?.startsWith('temp-');
          const isImg = msg.type === 'image';
          const initial = isMe ? '' : (msg.sender?.displayName?.[0] || roomName[0] || '?');
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 14, alignItems: 'flex-start' }}>
              {/* Avatar theirs */}
              {!isMe && <div style={{ width: 36, height: 36, borderRadius: 4, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#E6E6E6', flexShrink: 0 }}>{initial}</div>}
              {/* Arrow + Bubble */}
              <div style={{ display: 'flex', alignItems: 'stretch', flexDirection: isMe ? 'row' : 'row-reverse', margin: '0 8px' }}>
                {/* Arrow */}
                <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', marginTop: 12, ...(isMe ? { borderLeft: '8px solid #07C160' } : { borderRight: '8px solid #262626' }) }} />
                {/* Bubble */}
                {isImg ? (
                  <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #333', maxWidth: 200 }}>
                    <img src={msg.content} alt="" style={{ width: '100%', maxHeight: 250, objectFit: 'cover', display: 'block', background: '#0d1117' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                ) : (
                  <div style={{ padding: '8px 12px', borderRadius: 8, background: isMe ? '#07C160' : '#262626', color: isMe ? '#fff' : '#E6E6E6', fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word', maxWidth: '66%' }}>
                    {msg.content}
                  </div>
                )}
              </div>
              {/* Avatar mine */}
              {isMe && <div style={{ width: 36, height: 36, borderRadius: 4, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#E6E6E6', flexShrink: 0 }} />}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      {/* Input Bar */}
      <div style={{ borderTop: '1px solid #2B2B2B', background: '#1B1B1B' }}>
        {/* Main row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px' }}>
          <button style={{ background: 'none', border: 'none', color: '#B3B3B3', fontSize: 20, cursor: 'pointer', padding: 4, lineHeight: 1, flexShrink: 0 }}>🎤</button>
          <input type="text" placeholder="输入消息" value={input}
            onChange={e => { setInput(e.target.value); if (showMore) setShowMore(false); }}
            onFocus={() => { if (showMore) setShowMore(false); }}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(input); }}
            style={{ flex: 1, padding: '8px 10px', background: '#282828', border: 'none', borderRadius: 6, color: '#E6E6E6', fontSize: 14, outline: 'none' }} />
          <button onClick={() => { setShowEmoji(!showEmoji); if (showMore) setShowMore(false); }}
            style={{ background: 'none', border: 'none', color: '#B3B3B3', fontSize: 20, cursor: 'pointer', padding: 4, lineHeight: 1, flexShrink: 0 }}>😊</button>
          <button onClick={() => { setShowMore(!showMore); if (showEmoji) setShowEmoji(false); }}
            style={{ background: 'none', border: 'none', color: '#B3B3B3', fontSize: 22, cursor: 'pointer', padding: 4, lineHeight: 1, flexShrink: 0 }}>➕</button>
        </div>
        {/* Emoji panel */}
        {showEmoji && (
          <div ref={emojiRef} style={{ maxHeight: 200, overflowY: 'auto', background: '#252525', borderTop: '1px solid #333', padding: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {EMOJIS.map((e, i) => <button key={i} onClick={() => handleEmojiClick(e)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: 4, lineHeight: 1 }}>{e}</button>)}
          </div>
        )}
        {/* + panel */}
        {showMore && (
          <div style={{ background: '#1B1B1B', borderTop: '1px solid #2B2B2B', padding: '16px 12px 24px', height: 180, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <button onClick={() => { setShowMore(false); handleCall(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 8 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#2C2C2C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>📞</div>
              <span style={{ color: '#B3B3B3', fontSize: 11 }}>语音通话</span>
            </button>
            <button onClick={() => { setShowMore(false); handleCall(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 8 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#2C2C2C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>📹</div>
              <span style={{ color: '#B3B3B3', fontSize: 11 }}>视频通话</span>
            </button>
            <button onClick={() => { setShowMore(false); fileRef.current?.click(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 8 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#2C2C2C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🖼️</div>
              <span style={{ color: '#B3B3B3', fontSize: 11 }}>照片</span>
            </button>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImagePick} />
      </div>
    </div>
  );
}
