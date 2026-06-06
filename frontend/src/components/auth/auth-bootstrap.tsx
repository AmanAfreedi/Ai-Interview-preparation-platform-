import { useEffect, type ReactNode } from 'react'

import { FirebaseSetupRequired } from '@/components/auth/firebase-setup-required'
import { initFirebaseAnalytics } from '@/lib/firebase/analytics'
import { isFirebaseConfigured } from '@/lib/firebase/env'
import { useAuthStore } from '@/stores/auth-store'

export function AuthBootstrap({ children }: { children: ReactNode }) {
  if (!isFirebaseConfigured()) {
    return <FirebaseSetupRequired />
  }

  return <AuthListener>{children}</AuthListener>
}

function AuthListener({ children }: { children: ReactNode }) {
  useEffect(() => {
    void initFirebaseAnalytics()
    return useAuthStore.getState().initialize()
  }, [])

  return <>{children}</>
}
