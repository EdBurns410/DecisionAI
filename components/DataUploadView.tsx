import React, { useState, useCallback } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import { UploadCloud } from 'lucide-react';

interface DataUploadViewProps {
  onUpload: (data: string, fileName: string) => void;
  isLoading: boolean;
  error: string | null;
}

const DataUploadView: React.FC<DataUploadViewProps> = ({ onUpload, isLoading, error }) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onUpload(text, file.name);
      };
      reader.readAsText(file);
    }
  };
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Spinner size="lg" />
        <h2 className="text-2xl font-semibold mt-4 text-white">AI is inspecting your data...</h2>
        <p className="text-gray-400 mt-2">This may take a moment. The AI is preparing a data cleaning and analysis plan for your review.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Card className="max-w-2xl w-full">
        <div className="p-8 text-center" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
          <h2 className="text-2xl font-bold text-white mb-2">Upload Your Data</h2>
          <p className="text-gray-400 mb-6">Supports CSV, Excel, and Google Sheets exports. Please upload a CSV file.</p>
          
          <label
            htmlFor="dropzone-file"
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragActive ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-700/50'}`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className={`w-10 h-10 mb-3 ${dragActive ? 'text-brand-primary' : 'text-gray-400'}`} />
              {file ? (
                <>
                  <p className="font-semibold text-white">{file.name}</p>
                  <p className="text-xs text-gray-400">{Math.round(file.size / 1024)} KB</p>
                </>
              ) : (
                <>
                  <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-brand-secondary">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">CSV files only</p>
                </>
              )}
            </div>
            <input id="dropzone-file" type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
          </label>

          {error && <p className="text-red-400 mt-4">{error}</p>}

          <div className="mt-6">
            <Button onClick={handleUpload} disabled={!file} className="w-full">
              Inspect Data
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DataUploadView;