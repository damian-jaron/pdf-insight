# PDF Insight - Plan Wdrażania MVP

## 1. Przegląd Projektu

**Cel**: Aplikacja webowa umożliwiająca wczytanie PDF, wygenerowanie podsumowania (3-5 zdań) i konwersję treści na strukturalne dane JSON.

**Termin**: 24 godziny od startu
**Definition of Done**: Użytkownik bez instrukcji wgraje PDF → w <30 sekund widzi wynik → pobiera JSON

---

## 2. Architektura

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend (React SPA) - GitHub Pages                         │
│ - Wgranie PDF (drag & drop)                                 │
│ - Ekstrakcja tekstu (pdf.js worker)                          │
│ - Widok wyników                                             │
│ - Export JSON                                               │
└────────────┬────────────────────────────────────────────────┘
             │ FETCH /analyze
             │ (POST: {text, fileName, pages})
             ↓
┌─────────────────────────────────────────────────────────────┐
│ Backend API Proxy (Node.js)                                 │
│ - Przychowuje klucz API AI                                  │
│ - Walidacja żądania (rozmiar, format)                       │
│ - Limit żądań (rate limit)                                  │
│ - Logika retry'u                                            │
└────────────┬────────────────────────────────────────────────┘
             │ Klucz API
             ↓
┌─────────────────────────────────────────────────────────────┐
│ LLM API (Claude / OpenAI / inna)                            │
│ - Generacja podsumowania                                    │
│ - Ekstrakcja danych strukturalnych JSON                     │
└─────────────────────────────────────────────────────────────┘
```

### Warianty backendowe (MVE - Minimal Viable Execution)
- **Cloudflare Workers** ⭐ (rekomendowane) - bezdarmo, szybko, prosty deploy
- **Supabase Edge Functions** - alternatywa
- **Vercel Functions** - jeśli już tam host
- **Node.js (Express) na własnym serwerze** - fallback

---

## 3. Stack Techniczny

### Frontend
```
- React 18+ + Vite
- TypeScript (strict mode)
- pdf.js (PDF text extraction)
- Zod (schematicvalidation)
- Zustand lub useContext (state management - minimal)
- Tailwind CSS (styling)
- ESLint + Prettier
```

### Backend
```
- Node.js (TypeScript)
- Express lub Hono (lightweight)
- Axios / fetch (HTTP client do AI)
- Zod (validation)
- dotenv (.env management)
```

### CI/CD
```
- GitHub Actions (lint → build → deploy)
- Deploy frontend do GitHub Pages
- Deploy backend do wybranej platformy
```

---

## 4. Plan Wdrażania (Fazy)

### **FAZA 1: Setup i Architektura (1-2h)**

#### Frontend
```bash
cd pdf-insight-frontend
npm create vite@latest . -- --template react-ts
npm install
```

Struktura folderów:
```
pdf-insight-frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── PDFUploader.tsx    # Drag & drop
│   │   ├── ResultsView.tsx    # Podsumowanie + dane
│   │   └── JsonPreview.tsx    # Podgląd JSON
│   ├── lib/
│   │   ├── pdfExtractor.ts    # pdf.js - ekstrakcja tekstu
│   │   ├── schema.ts          # Zod schema + typy
│   │   └── api.ts             # Komunikacja z backend
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── vite.config.ts
├── tsconfig.json
└── README.md
```

**Konfiguracja Vite** (vite.config.ts):
```typescript
export default defineConfig({
  base: '/<repo-name>/',  // np. /pdf-insight/
  // ...
});
```

#### Backend
```bash
cd pdf-insight-backend
npm init -y
npm install express typescript zod axios dotenv
npm install -D @types/express ts-node
```

Struktura:
```
pdf-insight-backend/
├── src/
│   ├── routes/
│   │   └── analyze.ts      # POST /analyze
│   ├── lib/
│   │   ├── schema.ts       # Zod validation
│   │   ├── ai-client.ts    # Komunikacja z LLM
│   │   └── validators.ts   # Business logic validation
│   ├── middleware/
│   │   ├── cors.ts         # CORS setup
│   │   ├── rateLimit.ts    # Rate limiting
│   │   └── auth.ts         # Opcjonalnie
│   └── server.ts
├── .env.example
├── package.json
└── README.md
```

---

### **FAZA 2: Frontend - Core Features (3-4h)**

#### F-01 & F-06: Wgranie PDF + Stany UI
- [x] Komponenta `PDFUploader` z drag & drop
- [x] Walidacja: typ pliku (PDF), rozmiar (≤10 MB)
- [x] Stany: `idle` → `uploading` → `success` / `error`
- [x] Error handling z opcją retry

```typescript
// PDFUploader.tsx - struktura
const [state, setState] = useState<'idle' | 'uploading' | 'error' | 'success'>('idle');
const [file, setFile] = useState<File | null>(null);

const handleDrop = (e: DragEvent) => {
  const file = e.dataTransfer.files[0];
  if (file?.type !== 'application/pdf') showError('Tylko PDF');
  if (file.size > 10 * 1024 * 1024) showError('Max 10 MB');
  // ...
};
```

#### F-02: Ekstrakcja tekstu z PDF
- [x] Integracja pdf.js worker
- [x] Poza przeglądarką: tekst wysyłany do backend

```typescript
// lib/pdfExtractor.ts
import * as pdfjsLib from 'pdfjs-dist';

export async function extractTextFromPDF(file: File): Promise<{
  text: string;
  pages: number;
  language: string; // na podstawie heurystyki
}> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items
      .map(item => 'str' in item ? item.str : '')
      .join(' ');
  }
  
  return { text: fullText, pages: pdf.numPages, language: 'pl' };
}
```

#### F-05: Widok i Export
- [x] Sekcja: Summary (3-5 zdań)
- [x] Sekcja: Key Points (lista)
- [x] Sekcja: Entities (organizacje, osoby)
- [x] Sekcja: Amounts & Dates (tabela)
- [x] Podgląd JSON
- [x] Przycisk "Download JSON"

```typescript
// ResultsView.tsx
const handleDownload = (data: AnalysisResult) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], 
    { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.document.fileName}.json`;
  a.click();
};
```

---

### **FAZA 3: Backend - AI Integration (2-3h)**

#### F-03 & F-04: Analiza AI + Dane Strukturalne

**Endpoint**: `POST /analyze`

```typescript
// routes/analyze.ts
router.post('/analyze', async (req, res) => {
  const { text, fileName, pages } = req.body;
  
  // Walidacja
  if (!text || text.length > 50000) return res.status(400).json({error: 'Text too long'});
  
  try {
    const result = await analyzeWithAI(text, fileName, pages);
    
    // Walidacja response
    const validated = AnalysisSchema.parse(result);
    
    res.json(validated);
  } catch (error) {
    // Retry raz
    const retryResult = await analyzeWithAI(text, fileName, pages);
    res.json(AnalysisSchema.parse(retryResult));
  }
});
```

**Logika AI** (lib/ai-client.ts):

```typescript
export async function analyzeWithAI(
  text: string,
  fileName: string,
  pages: number
): Promise<AnalysisResult> {
  const prompt = `Analizuj dokument PDF i zwróć JSON:
{
  "document": {
    "fileName": "${fileName}",
    "pages": ${pages},
    "language": "pl",
    "type": "umowa|faktura|oferta|raport|inne",
    "title": "...",
    "date": "YYYY-MM-DD lub null"
  },
  "summary": "3-5 zdań w języku dokumentu",
  "keyPoints": ["...", "..."],
  "entities": {
    "organizations": ["..."],
    "people": ["..."]
  },
  "amounts": [
    {"value": 12500.00, "currency": "PLN", "context": "..."}
  ],
  "dates": [
    {"date": "2026-10-01", "context": "..."}
  ],
  "keywords": ["...", "..."]
}

DOKUMENT:
${text}`;

  const response = await apiClient.post('/v1/messages', {
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1000,
    messages: [
      { role: 'user', content: prompt }
    ]
  });
  
  const jsonStr = extractJSONFromResponse(response.content[0].text);
  return JSON.parse(jsonStr);
}
```

#### Bezpieczeństwo
- [x] Klucz API w `.env` (NIGDY w frontendzie)
- [x] CORS: ograniczyć do domeny demo
- [x] Rate limit: np. 5 żądań/min na IP
- [x] Limit rozmiaru: max 50KB tekstury

```typescript
// middleware/cors.ts
app.use(cors({
  origin: 'https://<username>.github.io',
  credentials: true,
}));

// middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Za dużo żądań, spróbuj później',
});
app.use('/analyze', limiter);
```

---

### **FAZA 4: Walidacja Schematu (30m)**

**lib/schema.ts** (zarówno frontend + backend):

```typescript
import { z } from 'zod';

export const AmountSchema = z.object({
  value: z.number(),
  currency: z.string().length(3),
  context: z.string(),
});

export const DateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  context: z.string(),
});

export const DocumentSchema = z.object({
  fileName: z.string(),
  pages: z.number().int().positive(),
  language: z.string().length(2),
  type: z.enum(['umowa', 'faktura', 'oferta', 'raport', 'inne']),
  title: z.string().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
});

export const AnalysisSchema = z.object({
  document: DocumentSchema,
  summary: z.string().min(10).max(500),
  keyPoints: z.array(z.string()).min(3).max(7),
  entities: z.object({
    organizations: z.array(z.string()),
    people: z.array(z.string()),
  }),
  amounts: z.array(AmountSchema),
  dates: z.array(DateSchema),
  keywords: z.array(z.string()).min(0).max(10),
});

export type AnalysisResult = z.infer<typeof AnalysisSchema>;
```

**Testy** (vitest):

```typescript
// src/lib/schema.test.ts
import { describe, it, expect } from 'vitest';
import { AnalysisSchema } from './schema';

describe('AnalysisSchema', () => {
  it('should validate correct data', () => {
    const validData = {
      document: {
        fileName: 'test.pdf',
        pages: 1,
        language: 'pl',
        type: 'umowa',
        title: 'Test',
        date: '2026-10-29',
      },
      summary: 'To jest podsumowanie dokumentu.',
      keyPoints: ['Punkt 1', 'Punkt 2', 'Punkt 3'],
      entities: { organizations: [], people: [] },
      amounts: [],
      dates: [],
      keywords: [],
    };
    
    expect(() => AnalysisSchema.parse(validData)).not.toThrow();
  });

  it('should reject invalid currency', () => {
    const invalid = {
      // ...
      amounts: [{ value: 100, currency: 'INVALID', context: 'test' }],
    };
    expect(() => AnalysisSchema.parse(invalid)).toThrow();
  });
});
```

---

### **FAZA 5: GitHub Pages Setup (1h)**

#### Frontend Deploy

1. **package.json**:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

2. **GitHub Actions** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd pdf-insight-frontend && npm install
      
      - name: Run linter
        run: cd pdf-insight-frontend && npm run lint
      
      - name: Build
        run: cd pdf-insight-frontend && npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./pdf-insight-frontend/dist
```

3. **GitHub Settings**:
   - Repo → Settings → Pages → Source: Deploy from branch → gh-pages
   - Custom domain (opcjonalnie)

#### Backend Deploy

Wybór: **Cloudflare Workers** (rekomendacja):

```bash
cd pdf-insight-backend
npm install wrangler
npx wrangler init
```

**wrangler.toml**:
```toml
name = "pdf-insight-api"
type = "javascript"
account_id = "YOUR_ACCOUNT_ID"
workers_dev = true

[env.production]
routes = [
  { pattern = "api.pdf-insight.example.com/*", zone_id = "YOUR_ZONE_ID" }
]

[env.production.vars]
API_KEY = "your-claude-api-key"
CORS_ORIGIN = "https://<username>.github.io"
```

**src/server.ts** → **src/index.ts** (dla Cloudflare):
```typescript
export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': env.CORS_ORIGIN,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method === 'POST' && new URL(request.url).pathname === '/analyze') {
      return handleAnalyze(request);
    }

    return new Response('Not found', { status: 404 });
  },
};
```

Deploy:
```bash
npx wrangler deploy --env production
```

---

## 5. Checklist MUST Features

- [ ] **F-01**: Drag & drop PDF, walidacja typu i rozmiaru
- [ ] **F-02**: Ekstrakcja tekstu z pdf.js
- [ ] **F-03**: Podsumowanie 3-5 zdań
- [ ] **F-04**: JSON schema zgody, walidacja Zod
- [ ] **F-05**: Widok wyników, podgląd JSON, download
- [ ] **F-06**: Stany UI (ładowanie, błąd z retry, pusty)
- [ ] **F-07**: Public demo na GitHub Pages

---

## 6. Dodatkowe Wymagania (Standard)

### Kod
- [ ] TypeScript strict mode (tsconfig.json: `"strict": true`)
- [ ] ESLint + Prettier konfiguracja
- [ ] Brak `any` i `console.log` w produkcji
- [ ] Struktura: `components/` `lib/` `api/`

### Bezpieczeństwo
- [ ] Klucz API NIGDY w frontendzie
- [ ] CORS ograniczony do domeny
- [ ] Rate limit na backend
- [ ] Treść PDF = dane, nie instrukcje (brak prompt injection)
- [ ] Brak `dangerouslySetInnerHTML`

### UX
- [ ] Responsywność od 360px (mobile-first)
- [ ] Obsługa klawiatury (Tab, Enter, Escape)
- [ ] Komunikaty po polsku
- [ ] Kontrast WCAG AA

### Dokumentacja
- [ ] README.md (demo link, architektura, setup)
- [ ] .env.example (zmienne środowiskowe)
- [ ] AI_LOG.md (narzędzia AI, key prompts, błędy i poprawki)

---

## 7. Harmonogram (24h)

```
00:00 - 02:00  Setup (React, Node, struktura)      FAZA 1
02:00 - 05:00  Frontend features                    FAZA 2
05:00 - 07:00  Backend + AI integration            FAZA 3
07:00 - 07:30  Schema validation + testy           FAZA 4
07:30 - 08:30  GitHub Pages + deploy               FAZA 5
08:30 - 23:00  Testing, bugfix, dokumentacja       FINALIZACJA
23:00 - 24:00  Final review + submit               ✅
```

---

## 8. Zmienne Środowiskowe

### Backend (.env)
```env
# AI Provider
ANTHROPIC_API_KEY=sk-ant-xxx
# lub
OPENAI_API_KEY=sk-xxx

# CORS
CORS_ORIGIN=https://username.github.io

# Rate limit
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=5
```

### Frontend (.env.example)
```env
VITE_API_URL=https://api.workers.dev/analyze
# lub
VITE_API_URL=http://localhost:3001/analyze
```

---

## 9. Known Limitations (MVP)

- ❌ Brak OCR (tylko PDF z warstwą tekstową)
- ❌ Brak historii analiz (localStorage mogą dodać jeśli będzie czas)
- ❌ Brak obsługi załączników/obrazów
- ❌ Demo hostowane na GitHub Pages (~2GB/miesiąc transfer limit)

---

## 10. Finalne Kroki Przed Submit

```bash
# 1. Sprawdzenie
npm run lint
npm run build
npm run test

# 2. Git
git add .
git commit -m "feat: PDF Insight MVP implementation"
git push

# 3. Walidacja
- [ ] Demo działa: https://<username>.github.io/<repo>/
- [ ] Można wgrać PDF
- [ ] <30 sekund do wyniku
- [ ] JSON się pobiera
- [ ] README wyjaśnia setup
- [ ] AI_LOG.md dokumentuje process

# 4. Submit
- [ ] Link do repozytorium publicznego
- [ ] Link do działającego demo
- [ ] Plik AI_LOG.md w repo
```

---

## Referencje

- [pdf.js Documentation](https://mozilla.github.io/pdf.js/)
- [Zod Schema Validation](https://zod.dev/)
- [Vite Config](https://vitejs.dev/config/)
- [GitHub Pages Deployment](https://pages.github.com/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
