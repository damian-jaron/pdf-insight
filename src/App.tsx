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

const SAMPLE_RESULT: AnalysisResult = {
  document: {
    fileName: "sample-report-2024.pdf",
    pages: 15,
    language: "Polish",
    type: "Business Report",
    title: "Quarterly Performance Analysis Q3 2024 - Extended Financial Overview with Detailed Market Insights and Strategic Recommendations",
    date: "2024-10-29"
  },
  summary: "This comprehensive quarterly report presents an in-depth analysis of our organization's performance throughout Q3 2024, including detailed financial metrics, market position evaluation, competitive landscape assessment, and strategic recommendations for Q4 and beyond. The report encompasses revenue streams, operational efficiency improvements, market expansion initiatives, and investment opportunities identified during this period. Key findings indicate strong growth in core business segments, successful market penetration in three new regions, and achievement of 94% of projected targets despite challenging market conditions and unforeseen macroeconomic factors.",
  keyPoints: [
    "Revenue increased by 23.5% compared to Q2 2024, demonstrating strong market demand and effective sales strategy execution across all segments and distribution channels.",
    "Operating expenses were optimized through process automation and supply chain improvements, resulting in a 7.2% reduction in operational costs while maintaining service quality standards and customer satisfaction levels.",
    "Successfully launched three new product lines targeting emerging market segments, with initial adoption rates exceeding projections by 18% and creating substantial revenue opportunities for future quarters.",
    "Expanded geographical presence into Southeast Asia markets, establishing partnerships with 12 regional distributors and achieving initial sales targets within the first month of operations in these territories.",
    "Implemented advanced data analytics infrastructure enabling real-time business intelligence, predictive modeling, and enhanced decision-making capabilities across all management levels and operational departments."
  ],
  entities: {
    organizations: [
      "Microsoft Corporation",
      "Amazon Web Services",
      "Google Cloud Platform",
      "International Business Machines",
      "Acme Analytics Solutions Ltd",
      "European Union Commission"
    ],
    people: [
      "Dr. James Patterson",
      "Sarah Chen",
      "Michael O'Connor",
      "Dr. Yuki Tanaka",
      "Prof. Maria Rodriguez Garcia",
      "Alexandra Kowalski"
    ]
  },
  amounts: [
    { value: 2500000, currency: "USD", context: "Q3 2024 total revenue projection exceeded expectations significantly" },
    { value: 450000, currency: "EUR", context: "Investment approved for new Southeast Asia distribution centers and facilities" },
    { value: 12500, currency: "PLN", context: "Average cost per unit after optimization initiatives were implemented successfully" },
    { value: 7.2, currency: "%", context: "Reduction in operational expenses through automation and efficiency improvements" }
  ],
  dates: [
    { date: "2024-10-15", context: "Q3 2024 report publication and distribution to stakeholders and board members" },
    { date: "2024-11-05", context: "Scheduled presentation of findings to executive committee and investor relations team" },
    { date: "2024-12-31", context: "Deadline for implementation of strategic recommendations and Q4 planning completion" },
    { date: "2025-01-15", context: "Expected completion of market analysis for new expansion opportunities in Asia-Pacific regions" }
  ],
  keywords: [
    "Financial Performance", "Market Expansion", "Revenue Growth", "Operational Efficiency",
    "Strategic Planning", "Asia-Pacific", "Digital Transformation", "Data Analytics",
    "Product Innovation", "Supply Chain Optimization", "Regional Partnerships", "Q4 Projections",
    "Cost Management", "Market Penetration", "Competitive Analysis", "Investment Opportunities"
  ]
};

function App() {
  const [extraction, setExtraction] = useState<ExtractionInfo | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(SAMPLE_RESULT);
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
