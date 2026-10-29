# AI_LOG.md - Process Dokumentacji

## Narzędzia AI Użyte

1. **Claude Code** - scaffolding projektu, konfiguracja TypeScript, Vite
2. **Claude API (Sonnet)** - design architektury, decyzje techniczne

## Kluczowe Prompty

### 1. Planning & Architecture
```
Zaprojektuj architekturę aplikacji PDF Insight:
- Frontend: React SPA na GitHub Pages
- Backend: API proxy do AI (Cloudflare Workers)
- Stack: React 18 + TypeScript + pdf.js + Zod
- Schema JSON: document, summary, keyPoints, entities, amounts, dates, keywords

Wymagania:
- TypeScript strict mode
- Walidacja schematu Zod
- GitHub Actions CI/CD
- Bezpieczeństwo: klucz API tylko w backend
- 7 features MUST, 9-10 logicznych commitów
```

**Rezultat**: IMPLEMENTATION_PLAN.md → ARCHITECTURE.md

### 2. Project Scaffolding
```
Stwórz strukturę React + Vite projektu z:
- package.json (React 18, TypeScript, Zod, axios, pdf.js)
- tsconfig.json (strict: true)
- vite.config.ts (base: '/pdf-insight/')
- ESLint + Prettier
- Vitest dla testów
- .gitignore i .env.example

Struktura: src/{components,lib,api}
```

**Rezultat**: package.json, vite.config.ts, struktura projektu

### 3. Schema Validation
```
Stwórz Zod schema dla wyniku analizy PDF:

{
  "document": { fileName, pages, language, type, title, date },
  "summary": "3-5 zdań",
  "keyPoints": ["...", "..."],
  "entities": { organizations, people },
  "amounts": [{ value, currency, context }],
  "dates": [{ date, context }],
  "keywords": ["...", "..."]
}

Waliduj: ISO 8601 dla dat, ISO 4217 dla walut, enum dla type.
```

**Rezultat**: src/lib/schema.ts + schema.test.ts

## Gdzie AI Się Myliło

### Issue #1: Vite Create Command
- ❌ **Problem**: `npm create vite` działał interactive - nie można było zautomatyzować
- ✅ **Rozwiązanie**: Ręczne stworzenie struktury (package.json, tsconfig, vite.config)
- **Lekcja**: Czasem lepiej zrobić ręcznie niż walczyć z interactive CLI

### Issue #2: Cloudflare Workers Config
- ❌ **Problem**: Początkowa architektura miała backend w frontendzie
- ✅ **Rozwiązanie**: Oddzielenie: Frontend (GitHub Pages) → Backend (Workers) → AI API
- **Lekcja**: Klucz API MUSI być poza przeglądarką

## Decyzje Architektoniczne

### 1. GitHub Pages dla Frontend
**Dlaczego**: Static hosting, darmowy, GitHub Actions native  
**Alternatywy**: Vercel, Netlify  
**Trade-off**: Brak backend, ale API proxy rozwiązuje to

### 2. Cloudflare Workers dla Backend
**Dlaczego**: Serverless, darmowy, szybki deploy, .env secrets  
**Alternatywy**: Vercel Functions, Supabase Edge, własny serwer  
**Trade-off**: Limit czasu wykonania, ale wystarczający dla AI calls

### 3. Zod do Walidacji
**Dlaczego**: TypeScript-native, zero runtime overhead, parse() + isInstanceOf()  
**Alternatywy**: Ajv, Yup, io-ts  
**Trade-off**: Wymaga manualna escribo (vs generatora)

### 4. pdf.js do Ekstrakcji Tekstu
**Dlaczego**: Standard Mozilla, no external API calls, offline capability  
**Alternatywy**: PDFKit, iTextSharp (C#)  
**Trade-off**: Brak OCR dla skanów, ale MVP nie wymaga

### 5. 9-10 Logicznych Commitów
**Dlaczego**: Czytelna historia, łatwy review, atomowe zmiany  
**Alternatywy**: 1 mega-commit (szybko ale czytelność)  
**Trade-off**: Nieco więcej pracy, ale wartościowa dla recruiterów

## Proces Tworzenia

### Faza 1: Planning (30 min)
- Przeczytanie briefa PDF
- Stworzenie IMPLEMENTATION_PLAN.md
- Decyzje stack'u i architektury

### Faza 2: Scaffolding (45 min)
- Init git repo
- Ręczne stworzenie struktury projektu
- Konfiguracja TypeScript, Vite, ESLint, Prettier
- Stworzenie .gitignore i .env.example

### Faza 3: Schema & Tests (30 min)
- Zod schema implementation
- Unit testy walidacji
- Vitest configuration

### Faza 4: README & Docs (20 min)
- README.md - setup + architektura
- AI_LOG.md - dokumentacja procesu
- ARCHITECTURE.md (kopia IMPLEMENTATION_PLAN.md)

### Faza 5: Git Setup (15 min)
- Pierwszy commit: scaffolding + konfiguracja
- Przygotowanie do push

## To-Do (Następne Etapy)

- [ ] COMMIT #1: Scaffolding + konfiguracja
- [ ] COMMIT #2: PDF uploader component
- [ ] COMMIT #3: PDF extraction (pdf.js)
- [ ] COMMIT #4: Results display component
- [ ] COMMIT #5: API client integration
- [ ] COMMIT #6: Schema validation tests
- [ ] COMMIT #7: Styling (Tailwind - opcjonalnie)
- [ ] COMMIT #8: GitHub Actions workflow
- [ ] GitHub Pages deploy
- [ ] Backend implementation (Cloudflare Workers)
- [ ] Testing & bugfix

## Notatki

### TypeScript Strict Mode
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

### Bezpieczeństwo
- Klucz API NIGDY w .env - tylko .env.example bez wartości
- CORS ograniczony w backend do `https://damian-jaron.github.io`
- Rate limit: 5 żądań/min na IP
- Treść PDF = data, nie prompt instruction

### Deploy Checklist
- [ ] npm install
- [ ] npm run lint (zero errors)
- [ ] npm run type-check (zero errors)
- [ ] npm run build (success)
- [ ] npm run test (all pass)
- [ ] .env w .gitignore
- [ ] ARCHITECTURE.md w repo
- [ ] AI_LOG.md w repo
- [ ] git push
- [ ] GitHub Pages deployed

---

**Last Updated**: 2026-10-29  
**Status**: Phase 2 - Scaffolding Complete ✅
