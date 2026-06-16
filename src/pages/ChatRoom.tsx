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
  const [uploading, setUploading] = useState(false);
  const [showPlus, setShowPlus] = useState(false);
  const [showCallSub, setShowCallSub] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const plusRef = useRef<HTMLDivElement>(null);

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

  // Click outside to close panels
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
      if (plusRef.current && !plusRef.current.contains(e.target as Node)) {
        setShowPlus(false);
        setShowCallSub(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSend = async (content: string, type = 'text') => {
    if (!content.trim()) return;
    setInput('');
    const tempId = 'temp-' + Date.now();
    setMessages((prev: any[]) => [...prev, {
      id: tempId, senderId: user?.id, sender: { username: 'me' },
      content, type, createdAt: new Date().toISOString(),
    }]);
    try {
      const msg = await api.sendMessage(roomId, content, type);
      setMessages((prev: any[]) => prev.map((m: any) => m.id === tempId ? msg : m));
    } catch {
      setMessages((prev: any[]) => prev.filter((m: any) => m.id !== tempId));
    }
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const { url } = await api.uploadImage(base64);
        await handleSend(url, 'image');
      };
      reader.readAsDataURL(file);
    } catch { alert('图片上传失败'); }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
    setShowPlus(false);
  };

  const handleCameraPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const { url } = await api.uploadImage(base64);
        await handleSend(url, 'image');
      };
      reader.readAsDataURL(file);
    } catch { alert('拍照上传失败'); }
    setUploading(false);
    if (cameraRef.current) cameraRef.current.value = '';
    setShowPlus(false);
  };

  const handleEmojiClick = (emoji: string) => {
    setInput(prev => prev + emoji);
    setShowEmoji(false);
  };

  const handleCall = (video: boolean) => {
    setShowPlus(false);
    setShowCallSub(false);
    startCall({ conversationId: roomId, remoteUserId: '', remoteUserName: roomName, video });
  };

  const formatTime = (t: string) => {
    const d = new Date(t);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#080b12' }}>
      {/* 头部 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#0f141c', borderBottom: '1px solid #1c2636' }}>
        <button onClick={() => navigate('/messages')} style={{ background: 'none', border: 'none', color: '#7d8590', fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>&#8249;</button>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#151b26', border: '1px solid #1c2636', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>&#128172;</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#e6edf3', fontWeight: 600, fontSize: 14 }}>{roomName}</div>
          <div style={{ color: '#484f58', fontSize: 11 }}>{messages.length} 条消息</div>
        </div>
        <button onClick={() => handleCall(false)} style={{ background: 'none', border: 'none', color: '#3fb950', fontSize: 20, cursor: 'pointer', padding: 6 }}>&#128222;</button>
        <button onClick={() => handleCall(true)} style={{ background: 'none', border: 'none', color: '#D4AF37', fontSize: 20, cursor: 'pointer', padding: 6 }}>&#128250;</button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '16px 16px 8px' }}>
        {messages.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, opacity: 0.3, marginBottom: 8 }}>&#128172;</div>
              <p style={{ color: '#484f58', fontSize: 13 }}>暂无消息</p>
            </div>
          </div>
        ) : (
          messages.map((msg: any) => {
            const isMe = msg.senderId === user?.id || msg.id?.startsWith('temp-');
            const isImage = msg.type === 'image';
            const initial = isMe ? '我' : (msg.sender?.displayName?.[0] || roomName[0] || '?');
            const avatarColor = isMe ? '#D4AF37' : '#30363d';
            const bubbleColor = isMe ? '#151b26' : 'linear-gradient(135deg, #D4AF37, #B8962E)';
            const textColor = isMe ? '#e6edf3' : '#000';
            const bubbleRadius = isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px';
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 16, alignItems: 'flex-end' }}>
                {isMe && (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0, marginLeft: 8 }}>
                    {initial}
                  </div>
                )}
                <div style={{ maxWidth: isImage ? '240px' : '70%' }}>
                  {isImage ? (
                    <div style={{ borderRadius: bubbleRadius, overflow: 'hidden', border: '1px solid #1c2636' }}>
                      <img src={msg.content} alt="图片" style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block', background: '#0d1117' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  ) : (
                    <div style={{ padding: '10px 14px', borderRadius: bubbleRadius, background: bubbleColor, color: textColor, fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word' }}>
                      {msg.content}
                    </div>
                  )}
                  <div style={{ textAlign: isMe ? 'right' : 'left', marginTop: 4, padding: '0 4px' }}>
                    <span style={{ fontSize: 10, color: '#484f58' }}>{formatTime(msg.createdAt)}</span>
                  </div>
                </div>
                {!isMe && (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#D4AF37', flexShrink: 0, marginRight: 8 }}>
                    {initial}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* 输入区 - 微信风格 */}
      <div ref={plusRef} style={{ padding: '0', borderTop: '1px solid #1c2636', background: '#0f141c', position: 'relative' }}>
        {/* 表情面板 */}
        {showEmoji && (
          <div ref={emojiRef} style={{
            position: 'absolute', bottom: '100%', left: 0, right: 0,
            maxHeight: 240, overflowY: 'auto', background: '#151b26',
            border: '1px solid #1c2636', borderRadius: 10, padding: 10,
            display: 'flex', flexWrap: 'wrap', gap: 4, zIndex: 100,
          }}>
            {EMOJIS.map((e, i) => (
              <button key={i} onClick={() => handleEmojiClick(e)}
                style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: 4, lineHeight: 1 }}>
                {e}
              </button>
            ))}
          </div>
        )}

        {/* Plus menu popup */}
        {showPlus && (
          <div style={{
            padding: '16px 20px 8px', background: '#0f141c',
            borderTop: '1px solid #1c2636',
          }}>
            {!showCallSub ? (
              <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-start' }}>
                <div onClick={() => cameraRef.current?.click()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', width: 64 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: '#1a2332', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>📷</div>
                  <span style={{ fontSize: 11, color: '#7d8590' }}>拍照</span>
                </div>
                <div onClick={() => fileRef.current?.click()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', width: 64 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: '#1a2332', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🖼️</div>
                  <span style={{ fontSize: 11, color: '#7d8590' }}>图片</span>
                </div>
                <div onClick={() => setShowCallSub(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', width: 64 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: '#1a2332', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>📹</div>
                  <span style={{ fontSize: 11, color: '#7d8590' }}>视频通话</span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'center' }}>
                <div onClick={() => handleCall(false)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', width: 72 }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#1a3a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🎧</div>
                  <span style={{ fontSize: 12, color: '#e6edf3' }}>语音通话</span>
                </div>
                <div onClick={() => handleCall(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', width: 72 }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#3a2a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📹</div>
                  <span style={{ fontSize: 12, color: '#e6edf3' }}>视频通话</span>
                </div>
                <div onClick={() => setShowCallSub(false)} style={{ padding: '8px 24px', background: '#1c2636', borderRadius: 20, cursor: 'pointer', fontSize: 13, color: '#7d8590' }}>
                  取消
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hidden file inputs */}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImagePick} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleCameraPick} />

        {/* Input bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px' }}>
          {/* Emoji button - left side */}
          <button onClick={() => { setShowEmoji(!showEmoji); setShowPlus(false); setShowCallSub(false); }}
            style={{ background: 'none', border: 'none', color: '#7d8590', fontSize: 20, cursor: 'pointer', padding: 4, flexShrink: 0, lineHeight: 1 }}>
            😊
          </button>
          {/* Text input */}
          <input type="text" placeholder="输入消息..." value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(input); }}
            onClick={() => { setShowPlus(false); setShowCallSub(false); }}
            style={{ flex: 1, padding: '10px 14px', background: '#0d1117', border: '1px solid #1c2636', borderRadius: 20, color: '#e6edf3', fontSize: 14, outline: 'none' }} />
          {/* + button - right side */}
          <button onClick={() => { setShowPlus(!showPlus); setShowEmoji(false); }}
            style={{ background: 'none', border: 'none', color: '#7d8590', fontSize: 24, cursor: 'pointer', padding: 4, flexShrink: 0, lineHeight: 1, fontWeight: 300 }}>
            +
          </button>
        </div>
      </div>
    </div>
  );
}
