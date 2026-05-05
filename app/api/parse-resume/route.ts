import { parseResume } from '@/lib/parser/parse-resume'
import { NextResponse } from 'next/server'

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const ACCEPTED_EXTENSIONS = ['.pdf', '.docx']

export async function POST(request: Request) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      { status: 'error', reason: 'corrupt', message: 'Could not read request body.' },
      { status: 400 },
    )
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json(
      { status: 'error', reason: 'wrong-format', message: 'No file field found in request.' },
      { status: 400 },
    )
  }

  const name = file.name.toLowerCase()
  const ext = name.slice(name.lastIndexOf('.'))

  // Reject .doc explicitly
  if (ext === '.doc') {
    return NextResponse.json(
      {
        status: 'error',
        reason: 'wrong-format',
        message: 'Old .doc format not supported. Save as .docx and try again.',
      },
      { status: 400 },
    )
  }

  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { status: 'error', reason: 'wrong-format', message: 'PDF or DOCX only.' },
      { status: 400 },
    )
  }

  if (file.size === 0) {
    return NextResponse.json(
      { status: 'error', reason: 'corrupt', message: 'File appears to be empty.' },
      { status: 400 },
    )
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { status: 'error', reason: 'too-large', message: 'File too large (max 10MB).' },
      { status: 400 },
    )
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  try {
    const result = await parseResume(buffer, file.type)

    if (result.status === 'success') {
      return NextResponse.json(result, { status: 200 })
    }
    if (result.status === 'partial') {
      return NextResponse.json(result, { status: 206 })
    }
    // error
    const httpStatus =
      result.reason === 'scanned' || result.reason === 'non-english' ? 422 : 400
    return NextResponse.json(result, { status: httpStatus })
  } catch {
    return NextResponse.json(
      { status: 'error', reason: 'corrupt', message: 'Unexpected error during parsing.' },
      { status: 500 },
    )
  }
}
