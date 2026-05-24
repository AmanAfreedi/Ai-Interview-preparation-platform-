export type FirebaseEnvConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId?: string
}

const ENV_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const

function readEnv(key: (typeof ENV_KEYS)[number]): string | undefined {
  const value = import.meta.env[key]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

export function getMissingFirebaseEnvKeys(): string[] {
  return ENV_KEYS.filter((key) => !readEnv(key))
}

export function isFirebaseConfigured(): boolean {
  return getMissingFirebaseEnvKeys().length === 0
}

export function getFirebaseEnvConfig(): FirebaseEnvConfig {
  const missing = getMissingFirebaseEnvKeys()

  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase environment variables: ${missing.join(', ')}. ` +
        'Copy .env.example to .env.local and add your Firebase web app config.',
    )
  }

  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID

  return {
    apiKey: readEnv('VITE_FIREBASE_API_KEY')!,
    authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN')!,
    projectId: readEnv('VITE_FIREBASE_PROJECT_ID')!,
    storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET')!,
    messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID')!,
    appId: readEnv('VITE_FIREBASE_APP_ID')!,
    ...(typeof measurementId === 'string' && measurementId.length > 0
      ? { measurementId }
      : {}),
  }
}
