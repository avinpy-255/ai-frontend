import React, { useState, ChangeEvent } from 'react';

const App: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string>(''); // Error state

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setError('Please upload a valid PDF file.');
        setPdfFile(null);
        return;
      }
      setPdfFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!pdfFile) {
      setError('Please select a PDF file to upload.');
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);

      const res = await fetch('http://localhost:8000/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.reply || 'Network response was not ok');
      }

      const data: { reply: string } = await res.json();
      setResponse(data.reply);
    } catch (error: any) {
      console.error('Error uploading PDF:', error);
      setError(error.message || 'Failed to upload and summarize the PDF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">SUMI.ai</h1>
      
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="mb-4 w-full max-w-sm text-gray-700"
      />

      <button
        onClick={handleUpload}
        className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50 w-full max-w-sm"
        disabled={loading}
      >
        {loading ? 'Summarizing...' : 'Upload & Summarize'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded w-full max-w-sm">
          {error}
        </div>
      )}

      {response && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded w-full max-w-sm">
          <h2 className="text-lg font-medium mb-2 text-gray-800">Summary:</h2>
          <p className="text-gray-700">{response}</p>
        </div>
      )}
    </div>
  );
};

export default App;