import { useState } from 'react'
import { PDFUploader } from './components/PDFUploader'
import { ResultsView } from './components/ResultsView'
import { extractTextFromPDF } from './lib/pdfExtractor'
import { AnalysisResult } from './lib/schema'
import './App.css'

interface ExtractedData {
  text: string
  pages: number
  fileName: string
}

// Mock data dla testowania UI
const MOCK_ANALYSIS_RESULT: AnalysisResult = {
  document: {
    fileName: 'Umowa_14_2026.pdf',
    pages: 12,
    language: 'pl',
    type: 'umowa',
    title: 'Umowa ramowa nr 14/2026',
    date: '2026-03-12',
  },
  summary:
    'Umowa ramowa zawarta między Nordwave Logistics sp. z o.o. a Kwadrat Software dotycząca wdrożenia i utrzymania systemu CRM. Umowa obowiązuje przez 12 miesięcy od daty podpisania. Wynagrodzenie roczne wynosi 2 500 000,00 zł.',
  keyPoints: [
    'Okres umowy: 12 miesięcy od 12.03.2026',
    'Wynagrodzenie: 2 500 000,00 zł rocznie',
    'Przedmiot: Wdrożenie i utrzymanie systemu CRM',
    'Strony: Nordwave Logistics i Kwadrat Software',
    'Umowa poufna - do użytku wyłącznie stron',
  ],
  entities: {
    organizations: ['Nordwave Logistics sp. z o.o.', 'Kwadrat Software'],
    people: ['Annę Kowalczyk — Prezes Zarządu', 'Marka Zielińskiego — Członka Zarządu'],
  },
  amounts: [
    {
      value: 2500000.0,
      currency: 'PLN',
      context: 'wynagrodzenie roczne',
    },
  ],
  dates: [
    {
      date: '2026-03-12',
      context: 'data zawarcia umowy',
    },
    {
      date: '2027-03-11',
      context: 'koniec okresu umowy',
    },
  ],
  keywords: ['umowa ramowa', 'CRM', 'wdrożenie', 'system', 'utrzymanie', 'usługi'],
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
          <>
            <div className="extraction-info">
              <p>📄 {extractedData.fileName}</p>
              <p>📊 {extractedData.pages} stron(y)</p>
              <p>✅ Tekst odczytany pomyślnie</p>
              <pre className="text-preview">{extractedData.text.substring(0, 500)}...</pre>
            </div>

            {/* Mock Results Display - remove when AI integration ready */}
            <div className="mock-notice">
              ℹ️ Poniżej mock danych - będą zastąpione rzeczywistą analizą AI
            </div>
            <ResultsView data={MOCK_ANALYSIS_RESULT} />
          </>
        )}
      </main>
    </div>
  )
}

export default App
