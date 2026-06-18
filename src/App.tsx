import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { connectSocket, disconnectSocket, callState, bindStateChange, addChatMessageListener, unlockAudio } from './lib/webrtc';
import Layout from './components/Layout';
import CallScreen from './components/CallScreen';
import Messages from './pages/Messages';
import Contacts from './pages/Contacts';
import Moments from './pages/Moments';
import Official from './pages/Official';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatRoom from './pages/ChatRoom';
import SendPledge from './pages/SendPledge';
import DirectSend from './pages/DirectSend';
import ProfileEdit from './pages/ProfileEdit';
import Security from './pages/Security';
import Wallet from './pages/Wallet';
import Verification from './pages/Verification';
import Complaint from './pages/Complaint';
import About from './pages/About';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const [calling, setCalling] = useState(false);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  // Unlock AudioContext on first touch (iOS WKWebView requires user gesture)
  useEffect(() => {
    var unlocked = false;
    function unlock() {
      if (unlocked) return;
      unlocked = true;
      unlockAudio()
    }
    document.addEventListener('touchstart', unlock, { once: true });
    document.addEventListener('click', unlock, { once: true });
    return function() {
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('click', unlock);
    };
  }, []);

  useEffect(() => {
    if (token && user?.id) {
      localStorage.setItem('displayName', user.displayName || '');
      connectSocket(user.id);
    } else {
      disconnectSocket();
    }
  }, [token, user?.id]);

  useEffect(() => {
    const unsub1 = bindStateChange(() => setCalling(callState.state !== 'idle'));
    return () => unsub1();
  }, []);

  useEffect(() => {
    const unsub = addChatMessageListener((msg: any) => {
      if (document.hidden) {
        document.title = '[新消息] ' + (msg.senderName || '消息');
        setTimeout(() => { document.title = 'milu-web'; }, 4000);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (callState.state === 'ringing' && document.hidden) {
      document.title = '[来电] ' + (callState.remoteUserName || '未知用户');
    } else if (callState.state === 'idle') {
      document.title = 'milu-web';
    }
  }, [callState.state, callState.remoteUserName]);

  return (
    <>
      {calling && <CallScreen />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/messages" replace />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:roomId" element={<ChatRoom />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="moments" element={<Moments />} />
          <Route path="official" element={<Official />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile-edit" element={<ProfileEdit />} />
          <Route path="security" element={<Security />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="verification" element={<Verification />} />
          <Route path="send-pledge" element={<SendPledge />} />
          <Route path="direct-send" element={<DirectSend />} />
          <Route path="complaint" element={<Complaint />} />
          <Route path="about" element={<About />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </>
  );
}
