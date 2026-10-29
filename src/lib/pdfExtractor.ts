import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export interface ExtractedPDFData {
  text: string
  pages: number
  fileName: string
}

function cleanupText(text: string): string {
  // Znormalizuj Unicode do NFC (precomposed form)
  let normalized = text.normalize('NFC')

  // Usuń spacje tylko gdy są polskie znaki specjalne
  // "wy ł" → "wył", "ł ą" → "ła"
  normalized = normalized.replace(/([ąćęłńóśźż]) ([a-ząćęłńóśźż])/g, '$1$2')
  normalized = normalized.replace(/([a-z]) ([ąćęłńóśźż])/gi, '$1$2')

  // Podziel tekst na słowa (rozdzielone spacjami/nowymi liniami)
  const words = normalized.split(/\s+/)

  // Dla każdego słowa: usuń pozostałe spacje
  const cleanWords = words.map((word) => word.replace(/\s/g, ''))

  // Połącz słowa z pojedynczymi spacjami
  let cleaned = cleanWords.join(' ')

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
