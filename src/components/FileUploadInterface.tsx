import React, { useRef } from 'react';
import { Upload, FileText, AlertCircle, Send } from 'lucide-react';
import { useFileUpload } from '../contexts/FileUploadContext';
import { FileUploadCard } from './FileUploadCard';

export const FileUploadInterface: React.FC = () => {
  const { files, addFile, error, clearError, uploadAllFiles } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList) => {
    clearError();
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      if (files.length >= 3) {
        break;
      }
      
      if (!file.type.includes('pdf') && !file.type.includes('text')) {
        continue;
      }
      
      addFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const canAddMoreFiles = files.length < 3;
  const hasFilesToUpload = files.length > 0 && files.every(file => file.status === 'pending');
  const isUploading = files.some(file => ['uploading', 'uploaded', 'processing'].includes(file.status));

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {canAddMoreFiles && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer bg-white"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleClick}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Drop your files here or click to browse
          </h3>
          <p className="text-gray-600 mb-4">
            Select up to 3 files (PDF or TXT) • Max {3 - files.length} more files
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>PDF</span>
            </div>
            <div className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>TXT</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* File Cards */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <FileUploadCard key={file.id} file={file} />
            ))}
          </div>

          {/* Upload All Button */}
          {hasFilesToUpload && (
            <div className="flex justify-center">
              <button
                onClick={uploadAllFiles}
                disabled={isUploading}
                className="flex items-center space-x-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                <Send className="w-5 h-5" />
                <span>Upload & Process All Files</span>
              </button>
            </div>
          )}

          {isUploading && (
            <div className="text-center">
              <p className="text-gray-600">
                Processing your files... This may take a few minutes.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt"
        className="hidden"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
      />
    </div>
  );
};