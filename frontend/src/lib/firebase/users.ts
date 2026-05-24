import { deleteUser, type User } from 'firebase/auth'
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

import { getFirestoreDb } from '@/lib/firebase/app'
import type { UserProfile } from '@/types/user'

const USERNAME_MIN = 3
const USERNAME_MAX = 20
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/

export function validateUsername(username: string): string {
  const trimmed = username.trim()

  if (trimmed.length < USERNAME_MIN || trimmed.length > USERNAME_MAX) {
    throw new Error(
      `Username must be ${USERNAME_MIN}-${USERNAME_MAX} characters long.`,
    )
  }

  if (!USERNAME_PATTERN.test(trimmed)) {
    throw new Error(
      'Username can only contain letters, numbers, and underscores.',
    )
  }

  return trimmed
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(getFirestoreDb(), 'users', uid))
  if (!snapshot.exists()) {
    return null
  }

  const data = snapshot.data()
  return {
    username: data.username,
    usernameLower: data.usernameLower,
    email: data.email,
  }
}

export async function createUserProfile(
  user: User,
  username: string,
): Promise<void> {
  const db = getFirestoreDb()
  const trimmed = validateUsername(username)
  const usernameLower = trimmed.toLowerCase()

  const usernameRef = doc(db, 'usernames', usernameLower)
  const userRef = doc(db, 'users', user.uid)

  const existingUsername = await getDoc(usernameRef)
  if (existingUsername.exists()) {
    throw new Error('Username is already taken. Please choose another.')
  }

  await setDoc(usernameRef, { uid: user.uid })

  try {
    await setDoc(userRef, {
      username: trimmed,
      usernameLower,
      email: user.email ?? '',
      createdAt: serverTimestamp(),
    })
  } catch (error) {
    await deleteDoc(usernameRef).catch(() => undefined)
    throw error
  }
}

export async function rollbackFailedSignup(user: User): Promise<void> {
  await deleteUser(user)
}
