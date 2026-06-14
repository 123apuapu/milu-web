import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout';
import Messages from './pages/Messages';
import Contacts from './pages/Contacts';
import Official from './pages/Official';
import Groups from './pages/Groups';
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
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={<ProtectedRoute><Layout /></ProtectedRoute>}
      >
        <Route index element={<Navigate to="/messages" replace />} />
        <Route path="messages" element={<Messages />} />
        <Route path="messages/:roomId" element={<ChatRoom />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="official" element={<Official />} />
        <Route path="groups" element={<Groups />} />
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
  );
}
