export interface FileUploadItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'uploaded' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  summary?: string;
}

export interface FileUploadState {
  files: FileUploadItem[];
  error: string | null;
}

export type FileUploadAction =
  | { type: 'ADD_FILE'; payload: { id: string; file: File } }
  | { type: 'REMOVE_FILE'; payload: string }
  | { type: 'UPDATE_FILE_STATUS'; payload: { id: string; status: FileUploadItem['status']; error?: string } }
  | { type: 'UPDATE_FILE_PROGRESS'; payload: { id: string; progress: number } }
  | { type: 'SET_FILE_SUMMARY'; payload: { id: string; summary: string } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

export interface SummaryResponse {
  text: string;
}