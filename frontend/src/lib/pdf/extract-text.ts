import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'

GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export async function extractTextFromPdf(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const pdf = await getDocument({ data: bytes }).promise

  const parts: string[] = []
  for (let page = 1; page <= pdf.numPages; page += 1) {
    const pageContent = await pdf.getPage(page)
    const text = await pageContent.getTextContent()
    const pageText = text.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    parts.push(pageText)
  }

  return parts.join('\n\n').replace(/\s+/g, ' ').trim()
}
