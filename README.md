# PDF Insight - Frontend

Aplikacja webowa do analizy PDF przy użyciu AI. Wczytaj PDF, otrzymaj podsumowanie i dane strukturalne w formacie JSON.

## Demo

🔗 **Live Demo**: https://damian-jaron.github.io/pdf-insight/

## Architektura

Szczegółowy plan implementacji: [ARCHITECTURE.md](./ARCHITECTURE.md)

### Stack

- **React 18** + TypeScript (strict mode)
- **Vite** - build tool
- **pdf.js** - ekstrakcja tekstu z PDF
- **Zod** - walidacja schematu JSON
- **Axios** - komunikacja z backend API
- **Tailwind CSS** - styling (planowane)

### Przepływ

```
1. Użytkownik wgrywa PDF (drag & drop)
   ↓
2. Frontend ekstrakcji tekst z pdf.js
   ↓
3. POST do backend API
   ↓
4. Backend wysyła do AI (Claude API)
   ↓
5. AI zwraca podsumowanie + dane JSON
   ↓
6. Frontend wyświetla wynik
   ↓
7. Użytkownik pobiera JSON
```

## Uruchomienie Lokalne

### Wymagania
- Node.js 18+
- npm lub yarn

### Setup

```bash
# Instalacja zależności
npm install

# Development server (http://localhost:5173)
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Linting
npm run lint

# Type checking
npm run type-check

# Testy
npm run test
```

### Zmienne Środowiskowe

Skopiuj `.env.example` do `.env.local`:

```bash
cp .env.example .env.local
```

Edytuj `.env.local`:
```env
VITE_API_URL=https://your-api.workers.dev/analyze
```

## Zmienne Środowiskowe

```env
# .env.example
VITE_API_URL=https://your-api.workers.dev/analyze
```

## Struktura Projektu

```
src/
├── components/      # React komponenty
│   ├── PDFUploader.tsx
│   ├── ResultsView.tsx
│   └── JsonPreview.tsx
├── lib/             # Utility functions
│   ├── schema.ts    # Zod validation
│   ├── pdfExtractor.ts
│   └── schema.test.ts
├── api/             # API komunikacja
│   └── client.ts
├── App.tsx
└── main.tsx
```

## Kryteria Zaliczenia (MUST)

- [x] Wgranie PDF (drag & drop, max 10 MB)
- [ ] Ekstrakcja tekstu z pdf.js
- [ ] Podsumowanie (3-5 zdań)
- [ ] Dane strukturalne (JSON schema)
- [ ] Widok i eksport JSON
- [ ] Stany interfejsu (ładowanie, błąd, pusty)
- [x] Publiczne demo na GitHub Pages

## Znane Ograniczenia

- ❌ Brak OCR (tylko PDF z warstwą tekstową)
- ❌ Brak historii analiz (v2)
- ❌ Brak obsługi skanów

## Deploy na GitHub Pages

GitHub Actions automatycznie deployuje na push do `main`:

```bash
git push origin main
```

Demo będzie dostępne pod: `https://<username>.github.io/pdf-insight/`

## Testy

```bash
# Uruchom testy
npm run test

# Watch mode
npm run test -- --watch
```

## Bezpieczeństwo

- ✅ Klucz API przechowywany tylko w backend
- ✅ CORS ograniczony do domeny demo
- ✅ Treść PDF jako dane, nie instrukcje (brak prompt injection)
- ✅ .env NIGDY w repozytorium

## Process z AI

Pełna dokumentacja: [AI_LOG.md](./AI_LOG.md)

Narzędzia AI:
- Claude Code - scaffolding i refactoring
- Claude API - design i architektura

## Contributing

W razie pytań - zobacz [ARCHITECTURE.md](./ARCHITECTURE.md).
