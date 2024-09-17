import React, { useState, ChangeEvent, useRef } from "react";
import { FaUpload } from "react-icons/fa";
import { AiOutlineLoading } from "react-icons/ai";
import { TbLoaderQuarter } from "react-icons/tb";
import { FiCopy } from "react-icons/fi";

const App: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false); 
  const [downloadLoading, setDownloadLoading] = useState<boolean>(false); 
  const [error, setError] = useState<string>(""); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        setError("Please upload a valid PDF file.");
        setPdfFile(null);
        return;
      }
      setPdfFile(file);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!pdfFile) {
      setError("Please select a PDF file to upload.");
      return;
    }

    setLoading(true);
    setError("");
    setResponse("");

    try {
      const formData = new FormData();
      formData.append("pdf", pdfFile);

      const res = await fetch("http://localhost:8000/upload-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.reply || "Network response was not ok");
      }

      const data: { reply: string } = await res.json();
      setResponse(data.reply);
    } catch (error: any) {
      console.error("Error uploading PDF:", error);
      setError(error.message || "Failed to upload and summarize the PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloadLoading(true);
    setTimeout(() => {
      setDownloadLoading(false);
      alert("Download complete!");
    }, 2000);
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCopy = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      alert("Summary copied to clipboard!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  bg-black p-6">
         <h1 className="text-5xl font-serif font-extrabold mb-2 text-gray-200">SUMA.ai</h1>
         <p className="text-md text-gray-400 mb-6">Upload pdf and Summarize</p>
      <div className="flex flex-row items-center justify-center border-2 border-gray-900 rounded-lg p-6 gap-4">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          style={{ display: "none" }}
          ref={fileInputRef}
        />

        <button
          onClick={triggerFileSelect}
          className="inline-flex items-center text-md font-medium bg-gradient-to-r from-indigo-900 to-indigo-600 text-white mt-3 px-6 py-3 rounded-3xl tracking-wide shadow-lg hover:bg-indigo-800 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-400 mb-4"
        >
          <FaUpload className="mr-0 " />
        </button>

        <button
          onClick={handleUpload}
          className="relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gray-900 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 group"
          disabled={loading}
        >
          <div className="absolute transition-all duration-1000 opacity-30 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-lg group-hover:opacity-70 group-hover:-inset-1 group-hover:duration-200 animate-tilt"></div>
          <span className="relative">
            {loading ? (
              <TbLoaderQuarter className="animate-spin h-5 w-5" />
            ) : (
              "Upload & Summarize"
            )}
          </span>
        </button>
    

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded w-full max-w-sm">
            {error}
          </div>
        )}
      </div>
      {response && (
        <div className="relative mt-4 p-4 bg-slate-900 border border-gray-200 w-50 px-10 py-10 rounded-lg max-h-sm overflow-y-auto">
          <h2 className="text-lg font-medium mb-2 text-gray-300">Summary:</h2>
          <p className="text-gray-200">{response}</p>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <FiCopy className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
