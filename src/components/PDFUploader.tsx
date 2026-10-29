import { useState } from 'react'
import '../styles/PDFUploader.css'

interface PDFUploaderProps {
  onFileSelected: (file: File) => void
  isLoading?: boolean
}

type UploadState = 'idle' | 'dragging' | 'error'

export function PDFUploader({ onFileSelected, isLoading }: PDFUploaderProps) {
  const [state, setState] = useState<UploadState>('idle')
  const [error, setError] = useState<string | null>(null)

  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return 'Tylko pliki PDF są obsługiwane'
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Plik jest zbyt duży. Maksymalny rozmiar to ${MAX_FILE_SIZE / 1024 / 1024}MB`
    }
    return null
  }

  const handleFile = (file: File) => {
    setError(null)
    const validationError = validateFile(file)

    if (validationError) {
      setError(validationError)
      setState('error')
      return
    }

    setState('idle')
    onFileSelected(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    setState('idle')

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setState('dragging')
  }

  const handleDragLeave = () => {
    setState('idle')
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleRetry = () => {
    setError(null)
    setState('idle')
  }

  return (
    <div className="pdf-uploader">
      {state === 'error' && error ? (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p className="error-message">{error}</p>
          <button onClick={handleRetry} className="retry-button">
            Spróbuj ponownie
          </button>
        </div>
      ) : (
        <div
          className={`drop-zone ${state === 'dragging' ? 'dragging' : ''} ${
            isLoading ? 'loading' : ''
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              document.getElementById('pdf-file-input')?.click()
            }
          }}
        >
          {isLoading ? (
            <>
              <div className="spinner"></div>
              <p className="drop-text">Przetwarzanie pliku...</p>
            </>
          ) : (
            <>
              <div className="upload-icon">📄</div>
              <p className="drop-text">Upuść PDF tutaj</p>
              <p className="drop-subtext">lub</p>
              <button className="select-button">Wybierz plik</button>
              <p className="file-info">Max 10 MB</p>
            </>
          )}
          <input
            id="pdf-file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            style={{ display: 'none' }}
            disabled={isLoading}
            aria-label="Wgranie pliku PDF"
          />
        </div>
      )}
    </div>
  )
}
