import { useAuthStore } from '@/stores/auth-store'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const loading = useAuthStore((state) => state.loading)
  const error = useAuthStore((state) => state.error)
  const signIn = useAuthStore((state) => state.signIn)
  const signUp = useAuthStore((state) => state.signUp)
  const signOut = useAuthStore((state) => state.signOut)
  const clearError = useAuthStore((state) => state.clearError)

  return { user, profile, loading, error, signIn, signUp, signOut, clearError }
}
