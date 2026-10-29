import { useState } from 'react';
import { PDFUploader } from './components/PDFUploader';
import { ResultsView } from './components/ResultsView';
import { extractTextFromPDF } from './lib/pdfExtractor';
import { AnalysisResult } from './lib/schema';
import './App.css';

interface ExtractedData {
  text: string;
  pages: number;
  fileName: string;
}

const API_BASE_URL = 'http://localhost:8787';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null
  );
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setExtractedData(null);
    setAnalysisResult(null);

    try {
      // Step 1: Extract text from PDF
      const data = await extractTextFromPDF(file);
      setExtractedData(data);

      // Step 2: Send to backend API for analysis
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: data.text,
          fileName: data.fileName,
          pages: data.pages,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Nieznany błąd podczas przetwarzania'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>PDF Insight</h1>
        <p>Wczytaj PDF i otrzymaj podsumowanie wraz z danymi strukturalnymi</p>
      </header>
      <main>
        <PDFUploader
          onFileSelected={handleFileSelected}
          isLoading={isLoading}
        />

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
              <pre className="text-preview">
                {extractedData.text.substring(0, 500)}...
              </pre>
            </div>

            {analysisResult ? (
              <ResultsView data={analysisResult} />
            ) : (
              <div className="mock-notice">ℹ️ Oczekiwanie na analizę AI...</div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
