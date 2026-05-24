import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { create } from 'zustand'

import { getFirebaseAuth } from '@/lib/firebase'
import {
  createUserProfile,
  fetchUserProfile,
  rollbackFailedSignup,
} from '@/lib/firebase/users'
import type { UserProfile } from '@/types/user'

type AuthState = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  initialize: () => () => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  initialize: () => {
    const auth = getFirebaseAuth()
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        set({ user: null, profile: null, loading: false, error: null })
        return
      }

      try {
        const profile = await fetchUserProfile(user.uid)
        set({ user, profile, loading: false, error: null })
      } catch {
        set({ user, profile: null, loading: false, error: null })
      }
    })
    return unsubscribe
  },

  signIn: async (email, password) => {
    set({ error: null })
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
    } catch (err) {
      set({ error: getAuthErrorMessage(err) })
      throw err
    }
  },

  signUp: async (email, password, username) => {
    set({ error: null })
    let createdUser: User | null = null

    try {
      const credential = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        email,
        password,
      )
      createdUser = credential.user
      await createUserProfile(credential.user, username)
    } catch (err) {
      if (createdUser) {
        await rollbackFailedSignup(createdUser).catch(() => undefined)
      }
      set({ error: getAuthErrorMessage(err) })
      throw err
    }
  },

  signOut: async () => {
    set({ error: null })
    await firebaseSignOut(getFirebaseAuth())
    set({ profile: null })
  },

  clearError: () => set({ error: null }),
}))

function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'Something went wrong. Please try again.'
}
