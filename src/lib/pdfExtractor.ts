import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export interface ExtractedPDFData {
  text: string
  pages: number
  fileName: string
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
      text: fullText.trim(),
      pages: pageCount,
      fileName: file.name,
    }
  } catch (error) {
    throw new Error(
      `Nie udało się odczytać PDF: ${error instanceof Error ? error.message : 'Nieznany błąd'}`,
    )
  }
}
