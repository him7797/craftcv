import mammoth from 'mammoth'

export type DocxExtractResult = {
  text: string
}

export class DocxExtractError extends Error {
  constructor(public readonly code: 'CORRUPT') {
    super(code)
    this.name = 'DocxExtractError'
  }
}

export async function extractDocx(buffer: Buffer): Promise<DocxExtractResult> {
  let result: Awaited<ReturnType<typeof mammoth.extractRawText>>

  try {
    result = await mammoth.extractRawText({ buffer })
  } catch {
    throw new DocxExtractError('CORRUPT')
  }

  const text = result.value.trim()

  if (text.length < 50) {
    throw new DocxExtractError('CORRUPT')
  }

  return { text }
}
