import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

import { getFirebaseEnvConfig } from './env'

let firebaseApp: FirebaseApp | undefined
let firebaseAuth: Auth | undefined
let firebaseDb: Firestore | undefined
let firebaseStorage: FirebaseStorage | undefined

export function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    firebaseApp =
      getApps().length > 0 ? getApp() : initializeApp(getFirebaseEnvConfig())
  }
  return firebaseApp
}

export function getFirebaseAuth(): Auth {
  if (!firebaseAuth) {
    firebaseAuth = getAuth(getFirebaseApp())
  }
  return firebaseAuth
}

export function getFirestoreDb(): Firestore {
  if (!firebaseDb) {
    firebaseDb = getFirestore(getFirebaseApp())
  }
  return firebaseDb
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!firebaseStorage) {
    firebaseStorage = getStorage(getFirebaseApp())
  }
  return firebaseStorage
}
