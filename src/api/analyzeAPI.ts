const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8787';

interface AnalyzeRequest {
  text: string;
  fileName: string;
  pages: number;
}

export async function analyzeDocument(request: AnalyzeRequest) {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}
