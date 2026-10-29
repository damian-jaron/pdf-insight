import { useState } from 'react'
import { PDFUploader } from './components/PDFUploader'
import { extractTextFromPDF } from './lib/pdfExtractor'
import './App.css'

interface ExtractedData {
  text: string
  pages: number
  fileName: string
}

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelected = async (file: File) => {
    setIsLoading(true)
    setError(null)
    setExtractedData(null)

    try {
      const data = await extractTextFromPDF(file)
      setExtractedData(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Nieznany błąd podczas ekstrakcji',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      <header>
        <h1>PDF Insight</h1>
        <p>Wczytaj PDF i otrzymaj podsumowanie wraz z danymi strukturalnymi</p>
      </header>
      <main>
        <PDFUploader onFileSelected={handleFileSelected} isLoading={isLoading} />

        {error && (
          <div className="error-message">
            <p>❌ {error}</p>
          </div>
        )}

        {extractedData && (
          <div className="extraction-info">
            <p>📄 {extractedData.fileName}</p>
            <p>📊 {extractedData.pages} stron(y)</p>
            <p>✅ Tekst odczytany pomyślnie</p>
            <pre className="text-preview">{extractedData.text.substring(0, 500)}...</pre>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
