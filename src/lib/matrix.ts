import { createClient } from 'matrix-js-sdk';

let client: any = null;
let roomListeners: Record<string, (rooms: any[]) => void> = {};
let messageListeners: Record<string, (roomId: string, msg: any) => void> = {};
let listenerId = 0;
let incomingCallHandler: ((roomId: string, callType: 'voice' | 'video') => void) | null = null;

export function initMatrixClient(baseUrl: string, accessToken: string, userId: string, deviceId?: string) {
  if (client) return client;
  client = createClient({ baseUrl, accessToken, userId, deviceId });
  
  client.on('sync', (state: string) => {
    if (state === 'PREPARED') {
      // 同步完成，通知所有监听器
      Object.values(roomListeners).forEach(fn => fn(getAllRooms()));
    }
  });
  
  // 监听新消息
  client.on('Room.timeline', (event: any, room: any) => {
    const eventType = event.getType();
    if (eventType === 'm.room.message') {
      const msg = eventToMessage(event);
      Object.values(messageListeners).forEach(fn => fn(room.roomId, msg));
    }
    // 监听来电 m.call.invite
    if (eventType === 'm.call.invite') {
      const content = event.getContent();
      const callType = content?.offer?.type === 'video' ? 'video' : 'voice';
      const sender = event.getSender();
      if (sender === client.getUserId()) return; // 不响应自己发的
      console.log('📞 CALL INVITE from', sender, 'type:', callType);
      if (incomingCallHandler) {
        incomingCallHandler(room.roomId, callType);
      }
    }
  });
  
  client.startClient({ initialSyncLimit: 20 });
  return client;
}

export function getMatrixClient() {
  return client;
}

export function onRoomsChange(fn: (rooms: any[]) => void): () => void {
  const id = ++listenerId;
  roomListeners[id] = fn;
  // 如果有缓存的房间，立即回调
  if (client) {
    const rooms = getAllRooms();
    if (rooms.length > 0) fn(rooms);
  }
  return () => { delete roomListeners[id]; };
}

export function onMessage(fn: (roomId: string, msg: any) => void): () => void {
  const id = ++listenerId;
  messageListeners[id] = fn;
  return () => { delete messageListeners[id]; };
}

/** 注册来电监听 */
export function onIncomingCall(fn: (roomId: string, callType: 'voice' | 'video') => void): () => void {
  incomingCallHandler = fn;
  return () => { incomingCallHandler = null; };
}

function getAllRooms(): any[] {
  if (!client) return [];
  try {
    return client.getRooms()
      .filter((room: any) => room.getMyMembership() === 'join')
      .map((room: any) => ({
        id: room.roomId,
        name: room.name || room.getDefaultRoomName(client.getUserId()),
        avatar: room.getAvatarUrl('https://matrix.4.dpjp.cn', 48, 48, 'crop') || getRoomEmoji(room.roomId),
        lastMsg: getLastMessage(room),
        time: getLastEventTime(room),
        unread: room.getUnreadNotificationCount() || 0,
        top: room.tags?.hasOwnProperty?.('m.favourite') || false,
      }))
      .sort((a: any, b: any) => (b.top ? 1 : 0) - (a.top ? 1 : 0) || (a.unread ? -1 : 0));
  } catch { return []; }
}

export function getConversations(): any[] {
  return getAllRooms();
}

export function getRoomMessages(roomId: string, limit = 50): any[] {
  if (!client) return [];
  try {
    const room = client.getRoom(roomId);
    if (!room) return [];
    const timeline = room.getLiveTimeline().getEvents();
    return timeline.slice(-limit).map(eventToMessage);
  } catch { return []; }
}

export async function sendMessage(roomId: string, content: string) {
  if (!client) return;
  await client.sendTextMessage(roomId, content);
}

export async function createRoom(name: string, userId: string) {
  if (!client) return;
  await client.createRoom({ name, invite: [userId] });
}

function eventToMessage(event: any): any {
  const content = event.getContent();
  return {
    id: event.getId(),
    from: event.getSender(),
    content: content?.body || '',
    time: new Date(event.getTs()).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    type: event.getType(),
  };
}

function getRoomEmoji(roomId: string): string {
  const emojis = ['💬', '👥', '📢', '🏠', '💼', '🎯'];
  let hash = 0;
  for (let i = 0; i < roomId.length; i++) hash = roomId.charCodeAt(i) + ((hash << 5) - hash);
  return emojis[Math.abs(hash) % emojis.length];
}

function getLastMessage(room: any): string {
  try {
    const timeline = room.getLiveTimeline().getEvents();
    const last = timeline[timeline.length - 1];
    if (!last || last.getType() !== 'm.room.message') return '';
    const sender = last.getSender()?.split(':')[0]?.replace('@', '') || '';
    const body = last.getContent()?.body || '';
    return `${sender}: ${body}`;
  } catch { return ''; }
}

function getLastEventTime(room: any): string {
  try {
    const timeline = room.getLiveTimeline().getEvents();
    const last = timeline[timeline.length - 1];
    if (!last) return '';
    const now = new Date();
    const d = new Date(last.getTs());
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
    if (diff < 86400) return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch { return ''; }
}
