import React from 'react';
import { FileUploadProvider } from './contexts/FileUploadContext';
import { FileUploadInterface } from './components/FileUploadInterface';
import { Header } from './components/Header';
import { Results } from './components/Results';

function App() {
  return (
    <FileUploadProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <FileUploadInterface />
            <Results />
          </div>
        </main>
      </div>
    </FileUploadProvider>
  );
}

export default App;