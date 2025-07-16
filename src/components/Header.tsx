import React from 'react';
import { Brain, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="relative">
            <Brain className="w-8 h-8 text-indigo-600" />
            <Sparkles className="w-4 h-4 text-purple-500 absolute -top-1 -right-1" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">AI Summarizer</h1>
            <p className="text-gray-600 mt-1">Upload your documents and get intelligent summaries</p>
          </div>
        </div>
      </div>
    </header>
  );
};