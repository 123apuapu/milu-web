// webrtc.ts - 密鹿 WebRTC 信令管理器
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
export function bindStateChange(fn: () => void) {
  onStateChange.push(fn);
  return () => { onStateChange = onStateChange.filter(f => f !== fn); };
}
export function addChatMessageListener(fn: (msg: any) => void) {
  chatMessageListeners.push(fn);
  return () => { chatMessageListeners = chatMessageListeners.filter(f => f !== fn); };
}

function setState(s: string) {
  console.log('[DEBUG] setState:', s, 'prev:', callState.state, 'uid:', currentUserId?.slice(0, 8));
  callState.state = s;
  onStateChange.forEach(fn => fn());
}

const ICE: RTCIceServer[] = [
  { urls: 'stun:101.47.73.177:3478' },
  { urls: 'turn:101.47.73.177:3478', username: 'milu', credential: 'milu123' },
];

export function getSocket() { return socket; }
export function connectSocket(userId: string) {
  currentUserId = userId;
  console.log('[DEBUG] connectSocket:', userId?.slice(0, 8));
  if (socket?.connected) { console.log('[DEBUG] already connected'); return; }
  try {
    socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      query: { userId },
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
    });
  } catch (e) { console.error('[DEBUG] io error:', e); return; }

  socket.on('connect', () => { console.log('[DEBUG] socket connected, id:', socket.id); });
  socket.on('disconnect', (reason: any) => {
    console.log('[DEBUG] socket disconnect:', reason);
    if (callState.state !== 'idle') hangup(false);
  });

  socket.on('call:offer', (data: any) => {
    console.log('[DEBUG] recv call:offer from:', data.fromId?.slice(0, 8), 'conv:', data.conversationId?.slice(0, 8), 'myState:', callState.state);
    if (callState.state === 'calling' && data.fromId === currentUserId) {
      console.log('[DEBUG] self-filter: skip own offer');
      return;
    }
    if (callState.state !== 'idle') {
      console.log('[DEBUG] busy, sending call:end (busy)');
      socket?.emit('call:end', { conversationId: data.conversationId, reason: 'busy' });
      return;
    }
    if (data.offer) {
      pendingOffer = data.offer;
      console.log('[DEBUG] stored pendingOffer, sdp len:', data.offer.sdp?.length);
    } else {
      console.warn('[DEBUG] NO OFFER in data!');
    }
    callState.conversationId = data.conversationId;
    callState.remoteUserId = data.fromId || '';
    callState.remoteUserName = data.fromName || '';
    callState.lastError = '';
    callState.direction = 'incoming';
    callState.isVideo = data.isVideo ?? true;
    setState('ringing');
  });

  socket.on('call:answer', async (data: any) => {
    console.log('[DEBUG] recv call:answer, myState:', callState.state, 'hasPc:', !!pc);
    if (callState.state !== 'calling' || !pc) {
      console.log('[DEBUG] skip answer: not calling or no pc');
      return;
    }
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      console.log('[DEBUG] setRemoteDesc(ANSWER) SUCCESS');
      setState('connected');
    } catch (e) {
      console.error('[DEBUG] setRemoteDesc(ANSWER) FAILED:', e);
      callState.lastError = 'setRemoteDesc answer: ' + String(e);
      setState('failed');
    }
  });

  socket.on('call:ice-candidate', async (data: any) => {
    if (!pc || !data.candidate || data.conversationId !== callState.conversationId) {
      if (data.candidate) console.log('[DEBUG] skip ice: no pc/wrong conv');
      return;
    }
    try { await pc.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch {}
  });

  socket.on('call:end', (_data: any) => {
    console.log('[DEBUG] recv call:end, myState:', callState.state);
    if (callState.state !== 'idle') hangup(false);
  });

  // 实时消息推送
  socket.on('chat:message', (msg: any) => {
    chatMessageListeners.forEach(fn => fn(msg));
  });
}

export function disconnectSocket() {
  if (callState.state !== 'idle') hangup(false);
  socket?.disconnect();
  socket = null;
}

export async function startCall(opts: any) {
  if (callState.state !== 'idle') { console.log('[DEBUG] startCall ignored: not idle'); return; }
  Object.assign(callState, opts, { direction: 'outgoing', remoteStream: null });
  pendingOffer = null;
  setState('connecting');
  console.log('[DEBUG] startCall conv:', callState.conversationId?.slice(0, 8));
  try {
    pc = new RTCPeerConnection({ iceServers: ICE, iceCandidatePoolSize: 5 });
    pc.onicecandidate = (e: any) => {
      if (e.candidate && callState.conversationId)
        socket?.emit('call:ice-candidate', { conversationId: callState.conversationId, candidate: e.candidate.toJSON() });
    };
    pc.ontrack = (e: any) => {
      if (e.streams[0]) { callState.remoteStream = e.streams[0]; onStateChange.forEach(fn => fn()); }
    };
    pc.oniceconnectionstatechange = () => {
      console.log('[DEBUG] iceConnState:', pc?.iceConnectionState, 'appState:', callState.state);
      if ((pc?.iceConnectionState === 'failed' || pc?.iceConnectionState === 'disconnected') && callState.state === 'connected')
        { console.log('[DEBUG] ICE fail -> hangup'); hangup(true); }
    };
    pc.onconnectionstatechange = () => {
      console.log('[DEBUG] connState:', pc?.connectionState, 'appState:', callState.state);
      if ((pc?.connectionState === 'failed' || pc?.connectionState === 'disconnected') && callState.state === 'connected')
        { console.log('[DEBUG] conn fail -> hangup'); hangup(true); }
    };

    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callState.isVideo ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } : false,
      });
      console.log('[DEBUG] got local media');
    } catch (e) {
      console.warn('[DEBUG] media unavailable:', e);
    }
    if (localStream) {
      for (const t of localStream.getTracks()) pc.addTrack(t, localStream);
    }

    const offer = await pc.createOffer();
    console.log('[DEBUG] offer created, sdp len:', offer.sdp?.length);
    await pc.setLocalDescription(offer);
    console.log('[DEBUG] local desc set (offer)');

    socket?.emit('call:offer', {
      conversationId: callState.conversationId,
      offer: { sdp: offer.sdp, type: offer.type },
      fromName: localStorage.getItem('displayName') || '',
      isVideo: !!callState.isVideo,
    });
    console.log('[DEBUG] call:offer emitted');
    setState('calling');
  } catch (e) {
    console.error('[DEBUG] startCall failed:', e);
    callState.lastError = 'startCall: ' + String(e);
    setState('failed');
  }
}

export async function answerCall(video = true) {
  if (callState.state !== 'ringing') {
    console.log('[DEBUG] answerCall ignored: not ringing, state:', callState.state);
    return;
  }
  if (!pendingOffer) {
    console.error('[DEBUG] NO PENDING OFFER!');
    callState.lastError = 'pendingOffer is null';
    setState('failed');
    return;
  }
  callState.isVideo = video;
  setState('connecting');
  console.log('[DEBUG] answerCall conv:', callState.conversationId?.slice(0, 8));
  try {
    pc = new RTCPeerConnection({ iceServers: ICE, iceCandidatePoolSize: 5 });
    pc.onicecandidate = (e: any) => {
      if (e.candidate && callState.conversationId)
        socket?.emit('call:ice-candidate', { conversationId: callState.conversationId, candidate: e.candidate.toJSON() });
    };
    pc.ontrack = (e: any) => {
      if (e.streams[0]) { callState.remoteStream = e.streams[0]; onStateChange.forEach(fn => fn()); }
    };
    pc.oniceconnectionstatechange = () => {
      console.log('[DEBUG] ans iceConn:', pc?.iceConnectionState, 'app:', callState.state);
      if ((pc?.iceConnectionState === 'failed' || pc?.iceConnectionState === 'disconnected') && callState.state === 'connected')
        hangup(true);
    };
    pc.onconnectionstatechange = () => {
      console.log('[DEBUG] ans conn:', pc?.connectionState, 'app:', callState.state);
      if ((pc?.connectionState === 'failed' || pc?.connectionState === 'disconnected') && callState.state === 'connected')
        hangup(true);
    };

    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: video ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } : false,
      });
      console.log('[DEBUG] ans got media');
    } catch (e) {
      console.warn('[DEBUG] ans media unavailable:', e);
    }
    if (localStream) {
      for (const t of localStream.getTracks()) pc.addTrack(t, localStream);
    }

    console.log('[DEBUG] setting remote desc (offer), sdp len:', (pendingOffer as any).sdp?.length);
    await pc.setRemoteDescription(new RTCSessionDescription(pendingOffer));
    pendingOffer = null;
    console.log('[DEBUG] setRemoteDesc(OFFER) SUCCESS');

    const answer = await pc.createAnswer();
    console.log('[DEBUG] answer created, sdp len:', answer.sdp?.length);
    await pc.setLocalDescription(answer);
    console.log('[DEBUG] local desc set (answer)');

    socket?.emit('call:answer', { conversationId: callState.conversationId, answer: { sdp: answer.sdp, type: answer.type } });
    console.log('[DEBUG] call:answer emitted');
    setState('connected');
  } catch (e: any) {
    console.error('[DEBUG] answerCall failed:', e?.message || e);
    callState.lastError = 'answerCall: ' + (e?.message || String(e));
    setState('failed');
  }
}

export function hangup(notifyRemote = true) {
  console.log('[DEBUG] hangup called, state:', callState.state, 'notify:', notifyRemote);
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
