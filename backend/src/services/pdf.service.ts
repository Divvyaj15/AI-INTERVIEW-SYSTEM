import pdfParse from 'pdf-parse'

export interface ParsedResume {
  text: string
  pageCount: number
}

export async function extractTextFromPDF(buffer: Buffer): Promise<ParsedResume> {
  try {
    const data = await pdfParse(buffer)
    const cleaned = cleanText(data.text)

    if (!cleaned || cleaned.length < 50) {
      throw new Error('PDF appears to be empty or unreadable')
    }

    return {
      text: cleaned,
      pageCount: data.numpages,
    }
  } catch (err) {
    throw new Error(`PDF parsing failed: ${(err as Error).message}`)
  }
}

function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}