import React from 'react';
import { 
  FileText, 
  X, 
  Upload, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Brain,
  Loader2
} from 'lucide-react';
import { useFileUpload } from '../contexts/FileUploadContext';
import { FileUploadItem } from '../types/FileUpload';

interface FileUploadCardProps {
  file: FileUploadItem;
}

export const FileUploadCard: React.FC<FileUploadCardProps> = ({ file }) => {
  const { removeFile, retryUpload } = useFileUpload();

  const getStatusIcon = () => {
    switch (file.status) {
      case 'pending':
        return <Upload className="w-5 h-5 text-gray-500" />;
      case 'uploading':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'uploaded':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Brain className="w-5 h-5 text-purple-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (file.status) {
      case 'pending':
        return 'Ready to upload';
      case 'uploading':
        return 'Uploading...';
      case 'uploaded':
        return 'File uploaded';
      case 'processing':
        return 'Processing with AI';
      case 'completed':
        return 'Summary ready';
      case 'error':
        return file.error || 'Upload failed';
      default:
        return 'Unknown status';
    }
  };

  const getProgressPercentage = () => {
    switch (file.status) {
      case 'pending':
        return 0;
      case 'uploading':
        return 25;
      case 'uploaded':
        return 50;
      case 'processing':
        return 75;
      case 'completed':
        return 100;
      case 'error':
        return 0;
      default:
        return 0;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <FileText className="w-8 h-8 text-indigo-600" />
          <div>
            <h4 className="font-medium text-gray-900 truncate max-w-[200px]">
              {file.file.name}
            </h4>
            <p className="text-sm text-gray-500">
              {formatFileSize(file.file.size)}
            </p>
          </div>
        </div>
        <button
          onClick={() => removeFile(file.id)}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-900">
            {getProgressPercentage()}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              file.status === 'error' 
                ? 'bg-red-500' 
                : file.status === 'completed'
                ? 'bg-green-500'
                : 'bg-indigo-500'
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm text-gray-700">{getStatusText()}</span>
        </div>
        
        {file.status === 'error' && (
          <button
            onClick={() => retryUpload(file.id)}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        )}
      </div>
    </div>
  );
};