import { ChevronIcon, DownloadIcon } from "./icons";
import "./ResultsView.css";

export interface AnalysisResult {
  document: {
    fileName: string;
    pages: number;
    language: string;
    type: string;
    title: string;
    date: string;
  };
  summary: string;
  keyPoints: string[];
  entities: {
    organizations: string[];
    people: string[];
  };
  amounts: { value: number; currency: string; context: string }[];
  dates: { date: string; context: string }[];
  keywords: string[];
}

interface ResultsViewProps {
  result: AnalysisResult;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^\p{Lu}/u.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

export function ResultsView({ result }: ResultsViewProps) {
  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.document.fileName.replace(/\.pdf$/i, "")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const { document: doc, entities } = result;

  return (
    <div className="results-view">
      <div className="results-header">
        <h2>Wyniki Analizy</h2>
        <button
          type="button"
          className="btn btn--lime download-btn"
          onClick={handleDownload}
        >
          <DownloadIcon size={18} strokeWidth={2} />
          <span className="download-btn__label">Pobierz JSON</span>
        </button>
      </div>

      <div className="results-grid">
        <section className="section span-8">
          <h3 className="section-title">Informacje o Dokumencie</h3>
          <div className="info-item">
            <span className="label">Tytuł</span>
            <p className="doc-title">{doc.title}</p>
          </div>
          <dl className="info-grid">
            <div className="info-item">
              <dt className="label">Nazwa</dt>
              <dd className="value value--mono">{doc.fileName}</dd>
            </div>
            <div className="info-item">
              <dt className="label">Data</dt>
              <dd className="value value--mono">{doc.date}</dd>
            </div>
          </dl>
        </section>

        <section className="section section--stat span-4">
          <h3 className="section-title">Strony</h3>
          <p className="stat-number">
            {doc.pages}
            <span className="stat-unit"> str.</span>
          </p>
          <dl className="stat-meta">
            <div>
              <dt className="visually-hidden">Typ</dt>
              <dd>
                <span>{doc.type}</span>
              </dd>
            </div>
            <div>
              <dt className="visually-hidden">Język</dt>
              <dd>
                <span>{doc.language}</span>
              </dd>
            </div>
          </dl>
        </section>

        <section className="section section--feature span-full">
          <h3 className="section-title">Podsumowanie</h3>
          <p className="summary-text">{result.summary}</p>
        </section>

        <section className="section span-7">
          <h3 className="section-title">
            Kluczowe Punkty
            <span className="count">{result.keyPoints.length}</span>
          </h3>
          <ol className="key-points-list">
            {result.keyPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ol>
        </section>

        <section className="section span-5">
          <h3 className="section-title">Podmioty</h3>
          {entities.organizations.length > 0 && (
            <div className="entities-group">
              <h4>
                Organizacje
                <span className="count">{entities.organizations.length}</span>
              </h4>
              <ul className="entities-list entities-list--orgs">
                {entities.organizations.map((org, i) => (
                  <li key={i}>
                    <span className="avatar" aria-hidden="true">
                      {initials(org)}
                    </span>
                    {org}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {entities.people.length > 0 && (
            <div className="entities-group">
              <h4>
                Osoby
                <span className="count">{entities.people.length}</span>
              </h4>
              <ul className="entities-list">
                {entities.people.map((person, i) => (
                  <li key={i}>
                    <span className="avatar" aria-hidden="true">
                      {initials(person)}
                    </span>
                    {person}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {result.amounts.length > 0 && (
          <section className="section span-7">
            <h3 className="section-title">
              Kwoty
              <span className="count">{result.amounts.length}</span>
            </h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="num">Wartość</th>
                    <th>Waluta</th>
                    <th>Kontekst</th>
                  </tr>
                </thead>
                <tbody>
                  {result.amounts.map((amount, i) => (
                    <tr key={i}>
                      <td className="cell-value">
                        {amount.value.toLocaleString("pl-PL")}
                      </td>
                      <td>
                        <span className="currency">{amount.currency}</span>
                      </td>
                      <td className="cell-context">{amount.context}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {result.dates.length > 0 && (
          <section className="section span-5">
            <h3 className="section-title">
              Daty
              <span className="count">{result.dates.length}</span>
            </h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Kontekst</th>
                  </tr>
                </thead>
                <tbody>
                  {result.dates.map((d, i) => (
                    <tr key={i}>
                      <td className="cell-date">{d.date}</td>
                      <td className="cell-context">{d.context}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="section span-full">
          <h3 className="section-title">Słowa Kluczowe</h3>
          <div className="keywords-container">
            {result.keywords.map((kw, i) => (
              <span key={i} className="keyword-tag">
                {kw}
              </span>
            ))}
          </div>
        </section>
      </div>

        <section className="section section--code span-full">
          <details className="json-details">
            <summary>
              <h3 className="section-title">Podgląd JSON</h3>
              <ChevronIcon className="chevron" />
            </summary>
            <pre className="json-preview">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </section>
    </div>
  );
}

export default ResultsView;
