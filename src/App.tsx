import { useState } from 'react';
import { PDFUploader } from './components/PDFUploader';
import { ResultsView } from './components/ResultsView';
import type { AnalysisResult } from './components/ResultsView';
import { FileIcon } from './components/icons';
import { extractTextFromPDF } from './lib/pdfExtractor';
import './styles/tokens.css';
import './styles/base.css';
import './App.css';

const API_BASE_URL = 'http://localhost:8787';
/*const API_BASE_URL =
  'https://pdf-insight-api-production.damian-jaron.workers.dev';*/

interface ExtractionInfo {
  fileName: string;
  pageCount: number;
  text: string;
}

function App() {
  const [extraction, setExtraction] = useState<ExtractionInfo | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDebugMode, setIsDebugMode] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);
    try {
      const data = await extractTextFromPDF(file);
      setExtraction({
        fileName: file.name,
        pageCount: data.pages,
        text: data.text,
      });

      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: data.text,
          fileName: file.name,
          pages: data.pages,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const analysis = await response.json();
      setResult(analysis);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Nie udało się odczytać pliku.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`app${isDebugMode ? ' debug-mode' : ''}`} style={isDebugMode ? {
      '--dur-slow': '0ms',
      '--dur': '0ms',
      '--dur-fast': '0ms'
    } as React.CSSProperties : undefined}>
      <div className="app-ambient" aria-hidden="true" />
      <header className="app-header">
        <button
          onClick={() => setIsDebugMode(!isDebugMode)}
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 1000,
            padding: '0.5rem 1rem',
            fontSize: '0.75rem',
            background: isDebugMode ? 'var(--lime)' : 'var(--text)',
            color: isDebugMode ? 'var(--on-lime)' : 'var(--bg)',
            border: 'none',
            borderRadius: '9999px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          {isDebugMode ? '✓ Debug ON' : 'Debug'}
        </button>
        <div className="brand-row" aria-hidden="true">
          <span className="brand-mark">
            <FileIcon size={16} strokeWidth={2.25} />
          </span>
          pdf-insight
        </div>
        <h1>
          PDF <span className="hero-accent">Insight</span>
        </h1>
        <p>Wczytaj PDF i otrzymaj podsumowanie wraz z danymi strukturalnymi</p>
      </header>

      <main className="app-main">
        <div className={`workspace${extraction ? ' has-extraction' : ''}`}>
          <PDFUploader
            onFileSelect={handleFileSelect}
            isProcessing={isProcessing}
            error={error}
          />

          {extraction && (
            <section className="extraction-info" aria-label="Wynik ekstrakcji">
              <div className="extraction-info__head">
                <span className="extraction-info__icon" aria-hidden="true">
                  <FileIcon />
                </span>
                <div>
                  <p className="extraction-info__file">{extraction.fileName}</p>
                  <p className="extraction-info__pages">
                    {extraction.pageCount} stron(y)
                  </p>
                </div>
                <p className="status-badge">Tekst odczytany pomyślnie</p>
              </div>
              <pre className="text-preview">
                {extraction.text.slice(0, 500)}
                {extraction.text.length > 500 ? '...' : ''}
              </pre>
            </section>
          )}
        </div>

        {result && <ResultsView result={result} />}
      </main>
    </div>
  );
}

export default App;
