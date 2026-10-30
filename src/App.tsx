import { useState } from 'react';
import { PDFUploader } from './components/PDFUploader';
import { ResultsView } from './components/ResultsView';
import type { AnalysisResult } from './components/ResultsView';
import { FileIcon } from './components/icons';
import { extractTextFromPDF } from './lib/pdfExtractor';
import { analyzeDocument } from './api/analyzeAPI';
import './styles/tokens.css';
import './styles/base.css';
import './App.css';

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

      const analysis = await analyzeDocument({
        text: data.text,
        fileName: file.name,
        pages: data.pages,
      });
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
    <div className="app">
      <div className="app-ambient" aria-hidden="true" />
      <header className="app-header">
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
