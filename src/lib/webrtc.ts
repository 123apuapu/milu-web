// webrtc.ts - 密鹿 WebRTC 信令管理器 + 在线状态
export type CallState = 'idle' | 'connecting' | 'calling' | 'ringing' | 'connected' | 'failed';
export type CallDirection = 'outgoing' | 'incoming';

let socket: any = null;
let pc: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let currentUserId = '';
let pendingOffer: RTCSessionDescriptionInit | null = null;

export const callState: any = {
  state: 'idle',
  direction: 'outgoing',
  conversationId: '',
  remoteUserId: '',
  remoteUserName: '',
  isVideo: true,
  remoteStream: null,
  lastError: '',
};

let onStateChange: Array<() => void> = [];
let chatMessageListeners: Array<(msg: any) => void> = [];
let onlineStatusListeners: Array<(data: { userId: string; online: boolean }) => void> = [];

export function bindStateChange(fn: () => void) {
  onStateChange.push(fn);
  return () => { onStateChange = onStateChange.filter((f) => f !== fn); };
}
export function addChatMessageListener(fn: (msg: any) => void) {
  chatMessageListeners.push(fn);
  return () => { chatMessageListeners = chatMessageListeners.filter((f) => f !== fn); };
}
export function addOnlineStatusListener(fn: (data: { userId: string; online: boolean }) => void) {
  onlineStatusListeners.push(fn);
  return () => { onlineStatusListeners = onlineStatusListeners.filter((f) => f !== fn); };
}

function setState(s: string) {
  callState.state = s;
  onStateChange.forEach((fn) => fn());
}

const ICE: RTCIceServer[] = [
  { urls: 'stun:101.47.73.177:3478' },
  { urls: 'turn:101.47.73.177:3478', username: 'milu', credential: 'milu123' },
];

export function getSocket() { return socket; }
export function connectSocket(userId: string) {
  currentUserId = userId;
  if (socket?.connected) return;
  socket = io(window.location.origin, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    query: { userId },
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {});
  socket.on('disconnect', () => { if (callState.state !== 'idle') hangup(false); });

  // 在线状态广播
  socket.on('user:status', (data: any) => {
    onlineStatusListeners.forEach((fn) => fn(data));
  });

  socket.on('call:offer', (data: any) => {
    if (callState.state === 'calling' && data.fromId === currentUserId) return;
    if (callState.state !== 'idle') { socket?.emit('call:end', { conversationId: data.conversationId, reason: 'busy' }); return; }
    if (data.offer) pendingOffer = data.offer;
    callState.direction = 'incoming';
    callState.conversationId = data.conversationId || '';
    callState.remoteUserId = data.fromId || '';
    callState.remoteUserName = data.remoteUserName || '';
    callState.isVideo = !!data.video;
    callState.lastError = '';
    setState('ringing');
  });

  socket.on('call:answer', (data: any) => {
    if (!pc || callState.state !== 'calling') return;
    if (data.answer) {
      pc.setRemoteDescription(new RTCSessionDescription(data.answer)).then(() => setState('connected')).catch(() => setState('failed'));
    }
  });

  socket.on('call:ice-candidate', (data: any) => {
    if (!pc || (callState.state !== 'calling' && callState.state !== 'connected')) return;
    if (data.candidate) pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(() => {});
  });

  socket.on('call:end', (data: any) => {
    if (data?.fromId === currentUserId) return;
    if (callState.state !== 'idle') { cleanup(); setState('idle'); }
  });

  socket.on('chat:message', (msg: any) => {
    if (msg.senderId === currentUserId) return;
    chatMessageListeners.forEach((fn) => fn(msg));
  });

  socket.on('connect_error', () => {});
}

export function disconnectSocket() {
  if (callState.state !== 'idle') hangup(false);
  try { socket?.disconnect(); } catch {}
  socket = null;
}

function getStream(video: boolean): Promise<MediaStream | null> {
  if (!navigator.mediaDevices?.getUserMedia) {
    console.warn('getUserMedia not supported');
    return Promise.resolve(null);
  }
  const constraints: any = { audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } };
  if (video) constraints.video = { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' };
  return navigator.mediaDevices.getUserMedia(constraints).catch((err) => {
    console.warn('getUserMedia failed:', err.name, err.message);
    callState.lastError = '麦克风/摄像头权限被拒绝: ' + err.message;
    return null;
  });
}

export async function startCall(opts: any) {
  if (callState.state !== 'idle') return;
  callState.direction = 'outgoing';
  callState.conversationId = opts.conversationId;
  callState.remoteUserId = opts.remoteUserId;
  callState.remoteUserName = opts.remoteUserName;
  callState.isVideo = opts.video;
  callState.lastError = '';
  setState('connecting');

  try {
    pc = new RTCPeerConnection({ iceServers: ICE });
    pc.onicecandidate = (e: any) => { if (e.candidate) socket?.emit('call:ice-candidate', { conversationId: callState.conversationId, candidate: e.candidate.toJSON() }); };
    pc.ontrack = (e: any) => { if (e.streams[0]) { callState.remoteStream = e.streams[0]; onStateChange.forEach((fn) => fn()); } };
    pc.oniceconnectionstatechange = () => { if ((pc?.iceConnectionState === 'failed' || pc?.iceConnectionState === 'disconnected') && callState.state === 'connected') hangup(true); };
    pc.onconnectionstatechange = () => { if ((pc?.connectionState === 'failed' || pc?.connectionState === 'disconnected') && callState.state === 'connected') hangup(true); };

    localStream = await getStream(opts.video);
    if (localStream) { for (const t of localStream.getTracks()) pc.addTrack(t, localStream); }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket?.emit('call:offer', {
      conversationId: callState.conversationId,
      offer: { sdp: offer.sdp, type: offer.type },
      remoteUserName: callState.remoteUserName,
      video: opts.video,
    });
    setState('calling');
  } catch (e: any) {
    callState.lastError = 'startCall: ' + (e?.message || String(e));
    setState('failed');
  }
}

export async function answerCall(video: boolean = false) {
  if (callState.state !== 'ringing' || !pendingOffer) return;
  try {
    pc = new RTCPeerConnection({ iceServers: ICE });
    pc.onicecandidate = (e: any) => { if (e.candidate) socket?.emit('call:ice-candidate', { conversationId: callState.conversationId, candidate: e.candidate.toJSON() }); };
    pc.ontrack = (e: any) => { if (e.streams[0]) { callState.remoteStream = e.streams[0]; onStateChange.forEach((fn) => fn()); } };
    pc.oniceconnectionstatechange = () => { if ((pc?.iceConnectionState === 'failed' || pc?.iceConnectionState === 'disconnected') && callState.state === 'connected') hangup(true); };
    pc.onconnectionstatechange = () => { if ((pc?.connectionState === 'failed' || pc?.connectionState === 'disconnected') && callState.state === 'connected') hangup(true); };

    localStream = await getStream(video);
    if (localStream) { for (const t of localStream.getTracks()) pc.addTrack(t, localStream); }

    await pc.setRemoteDescription(new RTCSessionDescription(pendingOffer));
    pendingOffer = null;

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket?.emit('call:answer', { conversationId: callState.conversationId, answer: { sdp: answer.sdp, type: answer.type } });
    setState('connected');
  } catch (e: any) {
    callState.lastError = 'answerCall: ' + (e?.message || String(e));
    setState('failed');
  }
}

export function hangup(notifyRemote = true) {
  if (callState.state === 'idle') return;
  if (notifyRemote) socket?.emit('call:end', { conversationId: callState.conversationId });
  cleanup();
  setState('idle');
}

export function rejectCall() {
  if (callState.state !== 'ringing') return;
  socket?.emit('call:end', { conversationId: callState.conversationId, reason: 'rejected' });
  cleanup();
  setState('idle');
}

export function toggleMute() {
  const t = localStream?.getAudioTracks()[0];
  if (t) t.enabled = !t.enabled;
}

function cleanup() {
  try { pc?.close(); } catch {}
  pc = null;
  if (localStream) { localStream.getTracks().forEach((t: any) => t.stop()); localStream = null; }
  callState.remoteStream = null;
  callState.conversationId = '';
  callState.remoteUserId = '';
  callState.remoteUserName = '';
  callState.lastError = '';
  pendingOffer = null;
}
