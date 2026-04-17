import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState, User } from '../types/index.ts'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setAuth: (user: User, token: string) =>
        set({
          user,
          token,
          isAuthenticated: true,
          error: null,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        }),

      setError: (error: string | null) => set({ error }),

      setLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: 'interviewer-auth',
    }
  )
)
