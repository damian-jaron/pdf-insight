import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent, KeyboardEvent } from "react";
import { AlertIcon, UploadIcon } from "./icons";
import "./PDFUploader.css";

interface PDFUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
  error?: string | null;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function PDFUploader({
  onFileSelect,
  isProcessing = false,
  error = null,
}: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setLocalError("Wybierz plik w formacie PDF.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setLocalError("Plik jest za duży. Maksymalny rozmiar to 10 MB.");
      return;
    }
    setLocalError(null);
    onFileSelect(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isProcessing) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isProcessing) return;
    handleFile(e.dataTransfer.files[0]);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const openPicker = () => {
    if (!isProcessing) inputRef.current?.click();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  };

  const shownError = error ?? localError;
  const stateClass = isProcessing
    ? "is-processing"
    : isDragging
      ? "is-dragging"
      : shownError
        ? "is-error"
        : "";

  return (
    <div className="pdf-uploader">
      <div
        className={`drop-zone ${stateClass}`.trim()}
        role="button"
        tabIndex={0}
        aria-busy={isProcessing}
        aria-disabled={isProcessing}
        aria-describedby={shownError ? "pdf-uploader-error" : undefined}
        onClick={openPicker}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-icon">
          {isProcessing ? (
            <span className="spinner" aria-hidden="true" />
          ) : shownError ? (
            <AlertIcon size={28} />
          ) : (
            <UploadIcon size={28} strokeWidth={2} />
          )}
        </div>

        {isProcessing ? (
          <>
            <p className="drop-text" aria-live="polite">
              Przetwarzanie dokumentu…
            </p>
            <p className="drop-subtext">Odczytuję tekst i analizuję treść</p>
          </>
        ) : (
          <>
            <p className="drop-text">
              {isDragging ? "Upuść, aby wczytać" : "Upuść PDF tutaj"}
            </p>
            <p className="drop-subtext">lub</p>
            <button
              type="button"
              className="btn btn--ink select-button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                openPicker();
              }}
            >
              Wybierz plik
            </button>
            <p className="file-info">Max 10 MB</p>
          </>
        )}

        <input
          ref={inputRef}
          id="pdf-file-input"
          type="file"
          accept=".pdf"
          aria-label="Wgranie pliku PDF"
          style={{ display: "none" }}
          onChange={handleInputChange}
        />
      </div>

      {shownError && !isProcessing && (
        <p id="pdf-uploader-error" className="uploader-error" role="alert">
          <AlertIcon size={18} />
          {shownError}
        </p>
      )}
    </div>
  );
}

export default PDFUploader;
