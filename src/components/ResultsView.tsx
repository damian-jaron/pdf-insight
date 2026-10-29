import { AnalysisResult } from '../lib/schema'
import '../styles/ResultsView.css'

interface ResultsViewProps {
  data: AnalysisResult
}

export function ResultsView({ data }: ResultsViewProps) {
  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.document.fileName}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="results-view">
      <div className="results-header">
        <h2>📊 Wyniki Analizy</h2>
        <button className="download-btn" onClick={handleDownloadJSON}>
          💾 Pobierz JSON
        </button>
      </div>

      {/* Document Info */}
      <section className="section">
        <h3>📄 Informacje o Dokumencie</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Nazwa:</span>
            <span className="value">{data.document.fileName}</span>
          </div>
          <div className="info-item">
            <span className="label">Strony:</span>
            <span className="value">{data.document.pages}</span>
          </div>
          <div className="info-item">
            <span className="label">Typ:</span>
            <span className="value">{data.document.type}</span>
          </div>
          <div className="info-item">
            <span className="label">Język:</span>
            <span className="value">{data.document.language}</span>
          </div>
          {data.document.title && (
            <div className="info-item">
              <span className="label">Tytuł:</span>
              <span className="value">{data.document.title}</span>
            </div>
          )}
          {data.document.date && (
            <div className="info-item">
              <span className="label">Data:</span>
              <span className="value">{data.document.date}</span>
            </div>
          )}
        </div>
      </section>

      {/* Summary */}
      <section className="section">
        <h3>📝 Podsumowanie</h3>
        <p className="summary-text">{data.summary}</p>
      </section>

      {/* Key Points */}
      {data.keyPoints.length > 0 && (
        <section className="section">
          <h3>🔑 Kluczowe Punkty</h3>
          <ul className="key-points-list">
            {data.keyPoints.map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Entities */}
      {(data.entities.organizations.length > 0 ||
        data.entities.people.length > 0) && (
        <section className="section">
          <h3>👥 Podmioty</h3>
          {data.entities.organizations.length > 0 && (
            <div className="entities-group">
              <h4>Organizacje:</h4>
              <ul className="entities-list">
                {data.entities.organizations.map((org, idx) => (
                  <li key={idx}>{org}</li>
                ))}
              </ul>
            </div>
          )}
          {data.entities.people.length > 0 && (
            <div className="entities-group">
              <h4>Osoby:</h4>
              <ul className="entities-list">
                {data.entities.people.map((person, idx) => (
                  <li key={idx}>{person}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Amounts */}
      {data.amounts.length > 0 && (
        <section className="section">
          <h3>💰 Kwoty</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Wartość</th>
                  <th>Waluta</th>
                  <th>Kontekst</th>
                </tr>
              </thead>
              <tbody>
                {data.amounts.map((amount, idx) => (
                  <tr key={idx}>
                    <td>{amount.value.toLocaleString('pl-PL')}</td>
                    <td>{amount.currency}</td>
                    <td>{amount.context}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Dates */}
      {data.dates.length > 0 && (
        <section className="section">
          <h3>📅 Daty</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Kontekst</th>
                </tr>
              </thead>
              <tbody>
                {data.dates.map((date, idx) => (
                  <tr key={idx}>
                    <td>{date.date}</td>
                    <td>{date.context}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Keywords */}
      {data.keywords.length > 0 && (
        <section className="section">
          <h3>🏷️ Słowa Kluczowe</h3>
          <div className="keywords-container">
            {data.keywords.map((keyword, idx) => (
              <span key={idx} className="keyword-tag">
                {keyword}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* JSON Preview */}
      <section className="section">
        <h3>📋 Podgląd JSON</h3>
        <pre className="json-preview">{JSON.stringify(data, null, 2)}</pre>
      </section>
    </div>
  )
}
