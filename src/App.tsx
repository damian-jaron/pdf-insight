import { useState } from 'react'
import { PDFUploader } from './components/PDFUploader'
import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [_selectedFile, _setSelectedFile] = useState<File | null>(null)

  const handleFileSelected = (file: File) => {
    _setSelectedFile(file)
    setIsLoading(true)
    // TODO: Extract PDF text and send to backend
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <div className="app">
      <header>
        <h1>PDF Insight</h1>
        <p>Wczytaj PDF i otrzymaj podsumowanie wraz z danymi strukturalnymi</p>
      </header>
      <main>
        <PDFUploader onFileSelected={handleFileSelected} isLoading={isLoading} />
      </main>
    </div>
  )
}

export default App
