import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export interface ExtractedPDFData {
  text: string
  pages: number
  fileName: string
}

function cleanupText(text: string): string {
  // Podziel tekst na słowa (rozdzielone spacjami/nowymi liniami)
  const words = text.split(/\s+/)

  // Dla każdego słowa: usuń spacje wewnątrz
  // "wy ł ą cznie" → "wyłącznie"
  const cleanWords = words.map((word) => word.replace(/\s/g, ''))

  // Połącz słowa z pojedynczymi spacjami
  let cleaned = cleanWords.join(' ')

  // Dodaj spacje przed wielkimi literami jeśli brakuje
  // "AnnęKowalczyk" → "Annę Kowalczyk"
  cleaned = cleaned.replace(/([a-ząćęłńóśźż])([A-ZĄĆĘŁŃÓŚŹŻ])/g, '$1 $2')

  // Dodaj spacje po znakach interpunkcyjnych jeśli brakuje
  // "złreprezentowana" → "zł reprezentowana"
  cleaned = cleaned.replace(/([,.!?;:żł])\s*([a-ząćęłńóśźż])/gi, '$1 $2')

  return cleaned.trim()
}

export async function extractTextFromPDF(
  file: File,
): Promise<ExtractedPDFData> {
  const arrayBuffer = await file.arrayBuffer()

  try {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    let fullText = ''
    const pageCount = pdf.numPages

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()

      const pageText = textContent.items
        .map((item) => {
          if ('str' in item) {
            return item.str
          }
          return ''
        })
        .join(' ')

      fullText += pageText + '\n'
    }

    return {
      text: cleanupText(fullText),
      pages: pageCount,
      fileName: file.name,
    }
  } catch (error) {
    throw new Error(
      `Nie udało się odczytać PDF: ${error instanceof Error ? error.message : 'Nieznany błąd'}`,
    )
  }
}
