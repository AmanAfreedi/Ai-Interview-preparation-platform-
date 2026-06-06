import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics'

import { getFirebaseApp } from '@/lib/firebase/app'
import { getFirebaseEnvConfig } from '@/lib/firebase/env'

let analytics: Analytics | undefined

export async function initFirebaseAnalytics(): Promise<void> {
  if (analytics) {
    return
  }

  const { measurementId } = getFirebaseEnvConfig()
  if (!measurementId) {
    return
  }

  if (!(await isSupported())) {
    return
  }

  analytics = getAnalytics(getFirebaseApp())
}
