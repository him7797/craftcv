'use client'

import DropZone from '@/components/upload/DropZone'
import FileCard from '@/components/upload/FileCard'
import ParseError from '@/components/upload/ParseError'
import ParseProgress from '@/components/upload/ParseProgress'
import ParseSuccess from '@/components/upload/ParseSuccess'
import Nav from '@/components/Nav'
import { useStore } from '@/lib/store'
import type { ParseResult, ParseStage, UploadPageState } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const STATUS_MESSAGES = [
  '▸ qwen2.5:14b · loading model...',
  '▸ qwen2.5:14b · extracting header...',
  '▸ qwen2.5:14b · parsing work experiences...',
  '▸ qwen2.5:14b · identifying skill categories...',
  '▸ qwen2.5:14b · checking education section...',
  '▸ qwen2.5:14b · finalizing output...',
]

export default function UploadPage() {
  const router = useRouter()
  const { setParseResult, clearResume } = useStore()

  const [state, setState] = useState<UploadPageState>({ phase: 'idle' })
  const [statusMessage, setStatusMessage] = useState(STATUS_MESSAGES[0])
  const statusIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Status message rotation during parsing-sections stage
  useEffect(() => {
    if (state.phase === 'parsing' && state.stage === 'parsing-sections') {
      let idx = 0
      statusIntervalRef.current = setInterval(() => {
        idx = (idx + 1) % STATUS_MESSAGES.length
        setStatusMessage(STATUS_MESSAGES[idx])
      }, 1500)
    } else {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current)
        statusIntervalRef.current = null
      }
    }
    return () => {
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current)
    }
  }, [state.phase === 'parsing' ? state.stage : null]) // eslint-disable-line react-hooks/exhaustive-deps

  function setParsingStage(file: File, stage: ParseStage) {
    const stageMessages: Record<ParseStage, string> = {
      'file-loaded': '▸ File loaded successfully',
      'extracting-text': '▸ Extracting text from document...',
      'parsing-sections': STATUS_MESSAGES[0],
      'applying-guidelines': '▸ Running guideline checks...',
    }
    setState({
      phase: 'parsing',
      file,
      stage,
      statusMessage: stageMessages[stage],
    })
    setStatusMessage(stageMessages[stage])
  }

  async function handleParse(file: File) {
    setParsingStage(file, 'file-loaded')

    // Small delay so user sees "FILE LOADED" tick
    await new Promise((r) => setTimeout(r, 400))
    setParsingStage(file, 'extracting-text')

    const formData = new FormData()
    formData.append('file', file)

    // Start fetch — stage transitions happen in parallel with server work
    const fetchPromise = fetch('/api/parse-resume', {
      method: 'POST',
      body: formData,
    })

    // Move to parsing-sections after 0.5s
    await new Promise((r) => setTimeout(r, 500))
    setParsingStage(file, 'parsing-sections')

    let response: Response
    try {
      response = await fetchPromise
    } catch {
      setState({
        phase: 'error',
        file,
        result: {
          status: 'error',
          reason: 'corrupt',
          message: 'AI provider unreachable. Check connection or switch to local mode.',
        },
      })
      return
    }

    // Move to applying-guidelines
    setParsingStage(file, 'applying-guidelines')
    await new Promise((r) => setTimeout(r, 200))

    let data: ParseResult
    try {
      data = (await response.json()) as ParseResult
    } catch {
      setState({
        phase: 'error',
        file,
        result: { status: 'error', reason: 'corrupt', message: 'Unexpected server response.' },
      })
      return
    }

    if (data.status === 'success') {
      setState({ phase: 'success', file, result: data })
    } else if (data.status === 'partial') {
      setState({
        phase: 'partial',
        file,
        result: data,
        score: data.score,
      })
    } else {
      setState({ phase: 'error', file, result: data })
    }
  }

  function handleContinue() {
    if (state.phase === 'success') {
      setParseResult(state.result.resume, state.result.score)
      router.push('/editor')
    } else if (state.phase === 'partial' && state.result.resume) {
      // partial resume — push what we have
      setParseResult(state.result.resume as Parameters<typeof setParseResult>[0], state.score)
      router.push('/editor')
    }
  }

  function handleReUpload() {
    clearResume()
    setState({ phase: 'idle' })
  }

  function handleStartBlank() {
    clearResume()
    router.push('/editor')
  }

  return (
    <>
      <Nav />
      <main
        style={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '80px 20px',
          background: '#FAFAFA',
          backgroundImage: 'radial-gradient(circle, #0D0D0D 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 880,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
          }}
        >
          {state.phase === 'idle' && (
            <DropZone onFileSelect={(file) => setState({ phase: 'selected', file })} />
          )}

          {state.phase === 'drag-over' && (
            <DropZone onFileSelect={(file) => setState({ phase: 'selected', file })} />
          )}

          {state.phase === 'selected' && (
            <FileCard
              file={state.file}
              onClear={handleReUpload}
              onParse={() => handleParse(state.file)}
            />
          )}

          {state.phase === 'parsing' && (
            <ParseProgress
              file={state.file}
              stage={state.stage}
              statusMessage={statusMessage}
            />
          )}

          {state.phase === 'success' && (
            <ParseSuccess
              file={state.file}
              result={state.result}
              onReUpload={handleReUpload}
              onContinue={handleContinue}
            />
          )}

          {state.phase === 'partial' && (
            <ParseError
              file={state.file}
              result={state.result}
              onRetry={handleReUpload}
              onStartBlank={handleStartBlank}
              onContinue={handleContinue}
            />
          )}

          {state.phase === 'error' && (
            <ParseError
              file={state.file}
              result={state.result}
              onRetry={handleReUpload}
              onStartBlank={handleStartBlank}
            />
          )}
        </div>
      </main>
    </>
  )
}
