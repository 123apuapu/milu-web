import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initMatrixClient } from '../lib/matrix';

export interface UserProfile {
  id: string;
  displayName: string;
  nickname: string;
  avatar?: string;
  phone?: string;
  inviteCode?: string;
  role: 'user' | 'admin' | 'manager';
  isVerified: boolean;
  balance: number;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;        // JWT 本地用户令牌
  matrixToken: string | null;  // Matrix access_token
  matrixUserId: string | null;
  matrixDeviceId: string | null;
  setUser: (user: UserProfile) => void;
  setToken: (token: string) => void;
  setMatrixInfo: (accessToken: string, userId: string, deviceId: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  initMatrixOnLoad: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      matrixToken: null,
      matrixUserId: null,
      matrixDeviceId: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setMatrixInfo: (accessToken, userId, deviceId) => set({ matrixToken: accessToken, matrixUserId: userId, matrixDeviceId: deviceId }),
      logout: () => set({ user: null, token: null, matrixToken: null, matrixUserId: null, matrixDeviceId: null }),
      isAuthenticated: () => !!get().token,
      initMatrixOnLoad: () => {
        const { matrixToken, matrixUserId, matrixDeviceId } = get();
        if (matrixToken && matrixUserId) {
          const deviceId = matrixDeviceId || `web_${Date.now()}`;
          try { initMatrixClient('https://matrix.4.dpjp.cn', matrixToken, matrixUserId, deviceId); } catch {}
        }
      },
    }),
    {
      name: 'milu-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        matrixToken: state.matrixToken,
        matrixUserId: state.matrixUserId,
        matrixDeviceId: state.matrixDeviceId,
      }),
    }
  )
);
