import { describe, it, expect } from 'vitest'
import { AnalysisSchema } from './schema'

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
      summary: 'To jest podsumowanie dokumentu które powinno mieć conajmniej 10 znaków.',
      keyPoints: ['Punkt 1', 'Punkt 2', 'Punkt 3'],
      entities: { organizations: [], people: [] },
      amounts: [],
      dates: [],
      keywords: [],
    }

    expect(() => AnalysisSchema.parse(validData)).not.toThrow()
  })

  it('should reject invalid currency', () => {
    const invalid = {
      document: {
        fileName: 'test.pdf',
        pages: 1,
        language: 'pl',
        type: 'umowa' as const,
        title: 'Test',
        date: '2026-10-29',
      },
      summary: 'To jest podsumowanie dokumentu.',
      keyPoints: ['Punkt 1', 'Punkt 2', 'Punkt 3'],
      entities: { organizations: [], people: [] },
      amounts: [{ value: 100, currency: 'INVALID', context: 'test' }],
      dates: [],
      keywords: [],
    }
    expect(() => AnalysisSchema.parse(invalid)).toThrow()
  })

  it('should reject invalid date format', () => {
    const invalid = {
      document: {
        fileName: 'test.pdf',
        pages: 1,
        language: 'pl',
        type: 'umowa' as const,
        title: 'Test',
        date: '2026-10-29',
      },
      summary: 'To jest podsumowanie dokumentu.',
      keyPoints: ['Punkt 1', 'Punkt 2', 'Punkt 3'],
      entities: { organizations: [], people: [] },
      amounts: [],
      dates: [{ date: '29-10-2026', context: 'test' }],
      keywords: [],
    }
    expect(() => AnalysisSchema.parse(invalid)).toThrow()
  })
})
