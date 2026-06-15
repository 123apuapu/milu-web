import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  userId: number;
  displayName: string;
  nickname: string;
  avatar?: string;
  phone?: string;
  inviteCode?: string;
  role: 'user' | 'admin' | 'manager' | 'customer_service';
  isVerified: boolean;
  balance: number;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  setUser: (user: UserProfile) => void;
  setToken: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'milu-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
