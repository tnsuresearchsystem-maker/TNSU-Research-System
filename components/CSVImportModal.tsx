import React, { useState } from 'react';
import { CSVType, generateTemplate, parseCSV, downloadCSV } from '../services/csvService';

interface CSVImportModalProps {
  type: CSVType;
  onImport: (data: any[]) => Promise<void>;
  onClose: () => void;
}

const CSVImportModal: React.FC<CSVImportModalProps> = ({ type, onImport, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadTemplate = () => {
    const csvContent = generateTemplate(type);
    downloadCSV(csvContent, `${type}_template.csv`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await parseCSV(file);
      if (data.length === 0) {
        setError("The file appears to be empty.");
        return;
      }
      await onImport(data);
      onClose();
    } catch (err) {
      console.error("Import error:", err);
      setError("Failed to parse or import CSV. Please check the file format.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Import {type.toUpperCase()} Data</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-800 mb-2 font-medium">Step 1: Download Template</p>
            <p className="text-xs text-blue-600 mb-3">Use our template to ensure your data is formatted correctly.</p>
            <button 
              onClick={handleDownloadTemplate}
              className="flex items-center text-sm text-blue-700 hover:text-blue-900 font-medium"
            >
              <span className="material-icons text-sm mr-1">download</span>
              Download CSV Template
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-800 mb-2 font-medium">Step 2: Upload CSV</p>
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-tnsu-green-50 file:text-tnsu-green-700
                hover:file:bg-tnsu-green-100
              "
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-100">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              onClick={handleImport}
              disabled={!file || isLoading}
              className={`px-4 py-2 bg-tnsu-green-600 text-white rounded-lg text-sm font-medium shadow-sm flex items-center
                ${(!file || isLoading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-tnsu-green-700'}
              `}
            >
              {isLoading && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>}
              Import Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal;
