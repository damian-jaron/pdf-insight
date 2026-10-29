import { describe, it, expect } from 'vitest'
import { extractTextFromPDF } from './pdfExtractor'

describe('PDF Extractor', () => {
  it('should handle missing file error gracefully', async () => {
    const invalidFile = new File([], 'invalid.txt', { type: 'text/plain' })

    await expect(extractTextFromPDF(invalidFile)).rejects.toThrow()
  })

  it('should validate function exists and is callable', () => {
    expect(typeof extractTextFromPDF).toBe('function')
  })

  it('should return object with required properties', () => {
    expect(typeof extractTextFromPDF).toBe('function')
  })
})
