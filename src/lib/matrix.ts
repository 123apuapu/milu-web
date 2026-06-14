import { createClient } from 'matrix-js-sdk';

let client: any = null;

export function initMatrixClient(baseUrl: string, accessToken: string, userId: string) {
  if (client) return client;
  client = createClient({
    baseUrl,
    accessToken,
    userId,
  });
  client.startClient({ initialSyncLimit: 10 });
  return client;
}

export function getMatrixClient() {
  return client;
}

export async function getConversations() {
  if (!client) return [];
  try {
    const rooms = client.getRooms();
    return rooms
      .filter((room: any) => room.getMyMembership() === 'join')
      .map((room: any) => ({
        id: room.roomId,
        name: room.name || room.getDefaultRoomName(client.getUserId()),
        avatar: getRoomAvatar(room),
        lastMsg: getLastMessage(room),
        time: getLastEventTime(room),
        unread: room.getUnreadNotificationCount() || 0,
        top: false,
      }));
  } catch {
    return [];
  }
}

export async function getRoomMessages(roomId: string, limit = 30) {
  if (!client) return [];
  try {
    const room = client.getRoom(roomId);
    if (!room) return [];
    const timeline = room.getLiveTimeline().getEvents();
    return timeline.slice(-limit).map((event: any) => ({
      id: event.getId(),
      from: event.getSender(),
      content: event.getContent()?.body || '',
      time: new Date(event.getTs()).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      type: event.getType(),
    }));
  } catch {
    return [];
  }
}

export async function sendMessage(roomId: string, content: string) {
  if (!client) return;
  await client.sendTextMessage(roomId, content);
}

function getRoomAvatar(room: any): string {
  try {
    const avatar = room.getAvatarUrl('https://matrix.4.dpjp.cn', 48, 48, 'crop');
    return avatar || '💬';
  } catch { return '💬'; }
}

function getLastMessage(room: any): string {
  try {
    const timeline = room.getLiveTimeline().getEvents();
    const last = timeline[timeline.length - 1];
    if (!last) return '';
    return last.getContent()?.body || '';
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
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch { return ''; }
}
