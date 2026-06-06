import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore'

import { getFirestoreDb } from '@/lib/firebase/app'
import { extractTextFromPdf } from '@/lib/pdf/extract-text'
import type { Resume, ResumeStatus } from '@/types/resume'

export const RESUME_MAX_BYTES = 5 * 1024 * 1024
export const RESUME_MIME_TYPE = 'application/pdf'
const TEXT_PREVIEW_LENGTH = 300
const MIN_EXTRACTED_TEXT_LENGTH = 50

export function validateResumeFile(file: File): void {
  if (file.type !== RESUME_MIME_TYPE) {
    throw new Error('Only PDF files are supported.')
  }

  if (file.size > RESUME_MAX_BYTES) {
    throw new Error('File must be 5 MB or smaller.')
  }
}

export function mapResumeDoc(id: string, data: DocumentData): Resume {
  const createdAt = data.createdAt
  const extractedText =
    typeof data.extractedText === 'string' ? data.extractedText : null

  return {
    id,
    userId: data.userId,
    fileName: data.fileName,
    fileSize: data.fileSize,
    status: normalizeResumeStatus(data.status, extractedText),
    extractedText,
    textPreview:
      typeof data.textPreview === 'string'
        ? data.textPreview
        : extractedText?.slice(0, TEXT_PREVIEW_LENGTH) ?? null,
    errorMessage: data.errorMessage ?? null,
    createdAt:
      createdAt && typeof createdAt.toDate === 'function'
        ? createdAt.toDate()
        : new Date(),
  }
}

export function subscribeToUserResumes(
  userId: string,
  onChange: (resumes: Resume[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const resumesQuery = query(
    collection(getFirestoreDb(), 'resumes'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  )

  return onSnapshot(
    resumesQuery,
    (snapshot) => {
      const resumes = snapshot.docs.map((entry) =>
        mapResumeDoc(entry.id, entry.data()),
      )
      onChange(resumes)
    },
    (error) => onError(error),
  )
}

/**
 * Parses a PDF in the browser and saves only the extracted text to Firestore.
 * The PDF file is never uploaded to Storage.
 */
export async function saveResumeFromPdf(
  userId: string,
  file: File,
): Promise<string> {
  validateResumeFile(file)

  const resumeId = crypto.randomUUID()
  const resumeRef = doc(getFirestoreDb(), 'resumes', resumeId)

  let extractedText: string
  try {
    extractedText = await extractTextFromPdf(file)
  } catch {
    throw new Error(
      'Could not read this PDF. Try a different file or a text-based PDF export.',
    )
  }

  const normalized = extractedText.replace(/\s+/g, ' ').trim()
  if (normalized.length < MIN_EXTRACTED_TEXT_LENGTH) {
    throw new Error(
      'Not enough text found in this PDF. Use a text-based resume (not a scanned image-only PDF).',
    )
  }

  await setDoc(resumeRef, {
    userId,
    fileName: file.name,
    fileSize: file.size,
    status: 'ready',
    extractedText: normalized,
    textPreview: normalized.slice(0, TEXT_PREVIEW_LENGTH),
    errorMessage: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return resumeId
}

export async function deleteResume(resume: Resume): Promise<void> {
  await deleteDoc(doc(getFirestoreDb(), 'resumes', resume.id))
}

function normalizeResumeStatus(
  status: unknown,
  extractedText: string | null,
): ResumeStatus {
  if (status === 'ready' || status === 'error' || status === 'processing') {
    return status
  }

  if (extractedText && extractedText.length >= MIN_EXTRACTED_TEXT_LENGTH) {
    return 'ready'
  }

  return 'error'
}
