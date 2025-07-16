import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { FileUploadItem, FileUploadState, FileUploadAction } from '../types/FileUpload';
import { uploadFile } from '../services/uploadService';

const initialState: FileUploadState = {
  files: [],
  error: null,
};

const FileUploadContext = createContext<{
  state: FileUploadState;
  addFile: (file: File) => void;
  removeFile: (id: string) => void;
  retryUpload: (id: string) => void;
  uploadAllFiles: () => void;
  clearError: () => void;
} | null>(null);

function fileUploadReducer(state: FileUploadState, action: FileUploadAction): FileUploadState {
  switch (action.type) {
    case 'ADD_FILE':
      return {
        ...state,
        files: [
          ...state.files,
          {
            id: action.payload.id,
            file: action.payload.file,
            status: 'pending',
            progress: 0,
          },
        ],
      };
    case 'REMOVE_FILE':
      return {
        ...state,
        files: state.files.filter(file => file.id !== action.payload),
      };
    case 'UPDATE_FILE_STATUS':
      return {
        ...state,
        files: state.files.map(file =>
          file.id === action.payload.id
            ? { ...file, status: action.payload.status, error: action.payload.error }
            : file
        ),
      };
    case 'UPDATE_FILE_PROGRESS':
      return {
        ...state,
        files: state.files.map(file =>
          file.id === action.payload.id
            ? { ...file, progress: action.payload.progress }
            : file
        ),
      };
    case 'SET_FILE_SUMMARY':
      return {
        ...state,
        files: state.files.map(file =>
          file.id === action.payload.id
            ? { ...file, summary: action.payload.summary, status: 'completed' }
            : file
        ),
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

export const FileUploadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(fileUploadReducer, initialState);

  const addFile = useCallback((file: File) => {
    if (state.files.length >= 3) {
      dispatch({ type: 'SET_ERROR', payload: 'Maximum 3 files allowed' });
      return;
    }

    if (!file.type.includes('pdf') && !file.type.includes('text')) {
      dispatch({ type: 'SET_ERROR', payload: 'Only PDF and TXT files are allowed' });
      return;
    }

    // Check if file already exists
    const fileExists = state.files.some(existingFile => 
      existingFile.file.name === file.name && 
      existingFile.file.size === file.size
    );

    if (fileExists) {
      dispatch({ type: 'SET_ERROR', payload: 'This file has already been added' });
      return;
    }

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    dispatch({ type: 'ADD_FILE', payload: { id, file } });
  }, [state.files]);

  const removeFile = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_FILE', payload: id });
  }, []);

  const uploadAllFiles = useCallback(() => {
    const pendingFiles = state.files.filter(file => file.status === 'pending');
    
    if (pendingFiles.length === 0) {
      dispatch({ type: 'SET_ERROR', payload: 'No files to upload' });
      return;
    }

    // Start uploading all pending files
    pendingFiles.forEach(file => {
      uploadFile(file.file, file.id, dispatch);
    });
  }, [state.files]);

  const retryUpload = useCallback((id: string) => {
    const file = state.files.find(f => f.id === id);
    if (file) {
      dispatch({ type: 'UPDATE_FILE_STATUS', payload: { id, status: 'pending' } });
      uploadFile(file.file, id, dispatch);
    }
  }, [state.files]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return (
    <FileUploadContext.Provider value={{
      state,
      addFile,
      removeFile,
      retryUpload,
      uploadAllFiles,
      clearError,
    }}>
      {children}
    </FileUploadContext.Provider>
  );
};

export const useFileUpload = () => {
  const context = useContext(FileUploadContext);
  if (!context) {
    throw new Error('useFileUpload must be used within a FileUploadProvider');
  }
  return {
    files: context.state.files,
    error: context.state.error,
    addFile: context.addFile,
    removeFile: context.removeFile,
    retryUpload: context.retryUpload,
    uploadAllFiles: context.uploadAllFiles,
    clearError: context.clearError,
  };
};