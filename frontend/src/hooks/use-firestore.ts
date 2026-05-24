import { useMemo } from 'react'
import type { Firestore } from 'firebase/firestore'

import { getFirestoreDb } from '@/lib/firebase'

export function useFirestore(): Firestore {
  return useMemo(() => getFirestoreDb(), [])
}
