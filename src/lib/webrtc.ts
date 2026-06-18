// ===== Web Audio sounds =====
export var _audioCtx_export: AudioContext | null = null;
export function unlockAudio() {
  if (!_audioCtx_export) {
    _audioCtx_export = new AudioContext();
  }
  if (_audioCtx_export.state === 'suspended') {
    _audioCtx_export.resume();
  }
}
function _getCtx(): AudioContext {
  unlockAudio();
  return _audioCtx_export!;
}
function _playTone(freq: number, duration: number, type: OscillatorType, vol: number) {
  try {
    var ctx = _getCtx();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}
function _playMessageSound() { _playTone(880, 0.12, 'sine', 0.25); }
var _ringTimer: any = null;
function _startRingtone() {
  _stopRingtone();
  _playTone(520, 0.4, 'square', 0.2);
  _ringTimer = setInterval(function() { _playTone(520, 0.4, 'square', 0.2); }, 800);
}
function _stopRingtone() { if (_ringTimer) { clearInterval(_ringTimer); _ringTimer = null; } }
function _playHangupSound() { _playTone(330, 0.25, 'sine', 0.2); }

export type CallState = 'idle' | 'connecting' | 'calling' | 'ringing' | 'connected' | 'failed';

export var unreadMap: Record<string, number> = {};
var socket: any = null;
var pc: RTCPeerConnection | null = null;
var localStream: MediaStream | null = null;
var currentUserId = '';
var pendingOffer: RTCSessionDescriptionInit | null = null;

export var callState: any = {
  state: 'idle', direction: 'outgoing', conversationId: '', remoteUserId: '',
  remoteUserName: '', isVideo: true, remoteStream: null, lastError: '',
};

var onStateChange: Array<() => void> = [];
var chatMsgListeners: Array<(msg: any) => void> = [];

export function bindStateChange(fn: () => void) {
  onStateChange.push(fn);
  return function() { onStateChange = onStateChange.filter(function(f) { return f !== fn; }); };
}
export function addChatMessageListener(fn: (msg: any) => void) {
  chatMsgListeners.push(fn);
  return function() { chatMsgListeners = chatMsgListeners.filter(function(f) { return f !== fn; }); };
}

function setState(s: string) {
  callState.state = s;
  onStateChange.forEach(function(fn) { fn(); });
}

var ICE: RTCIceServer[] = [
  { urls: 'stun:101.47.73.177:3478' },
  { urls: 'turn:101.47.73.177:3478', username: 'milu', credential: 'milu123' },
];

export function getSocket() { return socket; }

export function connectSocket(userId: string) {
  currentUserId = userId;
  if (socket?.connected) return;
  try {
    socket = io(window.location.origin, {
      path: '/socket.io', transports: ['websocket', 'polling'],
      query: { userId: userId },
      reconnection: true, reconnectionAttempts: 20, reconnectionDelay: 1000,
    });
  } catch (e) { return; }

  socket.on('connect', function() {});
  socket.on('disconnect', function(_reason: any) {
    if (callState.state !== 'idle') hangup(false);
  });

  socket.on('call:offer', function(data: any) {
    if (callState.state === 'calling' && data.fromId === currentUserId) return;
    if (callState.state !== 'idle') {
      socket?.emit('call:end', { conversationId: data.conversationId, reason: 'busy' });
      return;
    }
    if (data.offer) pendingOffer = data.offer;
    callState.conversationId = data.conversationId;
    callState.remoteUserId = data.fromId || '';
    callState.remoteUserName = data.fromName || '';
    callState.lastError = '';
    callState.direction = 'incoming';
    callState.isVideo = data.isVideo ?? true;
    _startRingtone();
    setState('ringing');
  });

  socket.on('call:answer', async function(data: any) {
    if (callState.state !== 'calling' || !pc) return;
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      _stopRingtone();
      setState('connected');
    } catch (e) {
      callState.lastError = 'setRemoteDesc answer: ' + String(e);
      setState('failed');
    }
  });

  socket.on('call:ice-candidate', async function(data: any) {
    if (!pc || !data.candidate || data.conversationId !== callState.conversationId) return;
    try { await pc.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch {}
  });

  socket.on('call:end', function(_data: any) {
    _stopRingtone();
    if (callState.state !== 'idle') hangup(false);
  });

  socket.on('chat:message', function(msg: any) {
    _playMessageSound();
    if (msg.senderId !== currentUserId) {
      try { (window as any).addUnread?.(1); } catch {}
      try { (window as any).SubiO_sounds?.notify?.(); } catch {}
      try { (window as any).SubiAndroid?.addBadge?.(1); } catch {}
      unreadMap[msg.conversationId] = (unreadMap[msg.conversationId] || 0) + 1;
    }
    chatMsgListeners.forEach(function(fn) { fn(msg); });
  });
}

export function disconnectSocket() {
  if (callState.state !== 'idle') hangup(false);
  _stopRingtone();
  socket?.disconnect();
  socket = null;
}

export async function startCall(opts: any) {
  if (callState.state !== 'idle') return;
  Object.assign(callState, opts, { direction: 'outgoing', remoteStream: null });
  pendingOffer = null;
  setState('connecting');
  try {
    pc = new RTCPeerConnection({ iceServers: ICE, iceCandidatePoolSize: 5 });
    pc.onicecandidate = function(e: any) {
      if (e.candidate && callState.conversationId)
        socket?.emit('call:ice-candidate', { conversationId: callState.conversationId, candidate: e.candidate.toJSON() });
    };
    pc.ontrack = function(e: any) {
      if (e.streams[0]) { callState.remoteStream = e.streams[0]; onStateChange.forEach(function(fn) { fn(); }); }
    };
    pc.oniceconnectionstatechange = function() {
      if ((pc?.iceConnectionState === 'failed' || pc?.iceConnectionState === 'disconnected') && callState.state === 'connected')
        hangup(true);
    };
    pc.onconnectionstatechange = function() {
      if ((pc?.connectionState === 'failed' || pc?.connectionState === 'disconnected') && callState.state === 'connected')
        hangup(true);
    };

    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callState.isVideo ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } : false,
      });
    } catch (e) {}
    if (localStream) {
      for (var _i = 0; _i < localStream.getTracks().length; _i++) pc.addTrack(localStream.getTracks()[_i], localStream);
    }

    var offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket?.emit('call:offer', {
      conversationId: callState.conversationId,
      offer: { sdp: offer.sdp, type: offer.type },
      fromName: localStorage.getItem('displayName') || '',
      isVideo: !!callState.isVideo,
    });
    setState('calling');
  } catch (e: any) {
    callState.lastError = 'startCall: ' + String(e);
    setState('failed');
  }
}

export async function answerCall(video: boolean = true) {
  if (callState.state !== 'ringing') return;
  if (!pendingOffer) { callState.lastError = 'pendingOffer is null'; setState('failed'); return; }
  _stopRingtone();
  callState.isVideo = video;
  setState('connecting');
  try {
    pc = new RTCPeerConnection({ iceServers: ICE, iceCandidatePoolSize: 5 });
    pc.onicecandidate = function(e: any) {
      if (e.candidate && callState.conversationId)
        socket?.emit('call:ice-candidate', { conversationId: callState.conversationId, candidate: e.candidate.toJSON() });
    };
    pc.ontrack = function(e: any) {
      if (e.streams[0]) { callState.remoteStream = e.streams[0]; onStateChange.forEach(function(fn) { fn(); }); }
    };
    pc.oniceconnectionstatechange = function() {
      if ((pc?.iceConnectionState === 'failed' || pc?.iceConnectionState === 'disconnected') && callState.state === 'connected')
        hangup(true);
    };
    pc.onconnectionstatechange = function() {
      if ((pc?.connectionState === 'failed' || pc?.connectionState === 'disconnected') && callState.state === 'connected')
        hangup(true);
    };

    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: video ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } : false,
      });
    } catch (e) {}
    if (localStream) {
      for (var _i2 = 0; _i2 < localStream.getTracks().length; _i2++) pc.addTrack(localStream.getTracks()[_i2], localStream);
    }

    await pc.setRemoteDescription(new RTCSessionDescription(pendingOffer));
    pendingOffer = null;
    var answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket?.emit('call:answer', { conversationId: callState.conversationId, answer: { sdp: answer.sdp, type: answer.type } });
    setState('connected');
  } catch (e: any) {
    callState.lastError = 'answerCall: ' + (e?.message || String(e));
    setState('failed');
  }
}

export function hangup(notifyRemote: boolean = true) {
  if (callState.state === 'idle') return;
  _stopRingtone();
  if (notifyRemote) { socket?.emit('call:end', { conversationId: callState.conversationId }); _playHangupSound(); }
  cleanup();
  setState('idle');
}

export function rejectCall() {
  if (callState.state !== 'ringing') return;
  _stopRingtone();
  socket?.emit('call:end', { conversationId: callState.conversationId, reason: 'rejected' });
  cleanup();
  setState('idle');
}

export function toggleMute() {
  var t = localStream?.getAudioTracks()[0];
  if (t) t.enabled = !t.enabled;
}

function cleanup() {
  _stopRingtone();
  try { pc?.close(); } catch {}
  pc = null;
  if (localStream) { localStream.getTracks().forEach(function(t: any) { t.stop(); }); localStream = null; }
  callState.remoteStream = null;
  callState.conversationId = '';
  callState.remoteUserId = '';
  callState.remoteUserName = '';
  callState.lastError = '';
  pendingOffer = null;
}
