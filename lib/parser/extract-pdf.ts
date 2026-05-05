import pdfParse from 'pdf-parse'

export type PdfExtractResult = {
  text: string
  pageCount: number
  hasImages: boolean
}

export class PdfExtractError extends Error {
  constructor(public readonly code: 'SCANNED' | 'CORRUPT' | 'TOO_MANY_PAGES') {
    super(code)
    this.name = 'PdfExtractError'
  }
}

export async function extractPdf(buffer: Buffer): Promise<PdfExtractResult> {
  let result: Awaited<ReturnType<typeof pdfParse>>

  try {
    result = await pdfParse(buffer)
  } catch {
    throw new PdfExtractError('CORRUPT')
  }

  if (result.numpages > 10) {
    throw new PdfExtractError('TOO_MANY_PAGES')
  }

  const text = result.text.trim()

  if (text.length < 50) {
    throw new PdfExtractError('SCANNED')
  }

  const hasImages = buffer.length / result.numpages > 50_000

  return {
    text,
    pageCount: result.numpages,
    hasImages,
  }
}
