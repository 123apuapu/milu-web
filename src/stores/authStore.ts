import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  token: string | null;
  matrixClient: any | null;
  setUser: (user: UserProfile) => void;
  setToken: (token: string) => void;
  setMatrixClient: (client: any) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      matrixClient: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setMatrixClient: (client) => set({ matrixClient: client }),
      logout: () => set({ user: null, token: null, matrixClient: null }),
      isAuthenticated: () => !!get().token,
    }),
    { name: 'milu-auth' }
  )
);
