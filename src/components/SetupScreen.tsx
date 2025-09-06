'use client';

import React, { useState } from 'react';

interface SetupScreenProps {
  onKeysSet: (geminiKey: string, mapsKey: string) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onKeysSet }) => {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [mapsApiKey, setMapsApiKey] = useState('');

  const handleSave = () => {
    if (!geminiApiKey || !mapsApiKey) {
      alert('Please enter both API keys.');
      return;
    }
    onKeysSet(geminiApiKey, mapsApiKey);
  };

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 m-4 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Welcome to Terraformer</h1>
        <p className="mb-6 text-gray-600">Please enter your API keys to begin. These will be stored locally in your browser.</p>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="geminiApiKey" className="block text-sm font-medium text-gray-700">
              Google AI Studio API Key
            </label>
            <a
              href="https://www.youtube.com/watch?v=3A2TQ8YOw9k"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:text-indigo-800 underline"
            >
              Tutorial to get API key
            </a>
          </div>
          <input
            type="password"
            id="geminiApiKey"
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            className="w-full p-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your Google AI key"
          />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="mapsApiKey" className="block text-sm font-medium text-gray-700">
              Google Maps API Key
            </label>
            <a
              href="https://www.youtube.com/watch?v=c9BDfSbAd6I&t=2s"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:text-indigo-800 underline"
            >
              Tutorial to get API key
            </a>
          </div>
          <input
            type="password"
            id="mapsApiKey"
            value={mapsApiKey}
            onChange={(e) => setMapsApiKey(e.target.value)}
            className="w-full p-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your Google Maps key"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save and Continue
        </button>
      </div>
    </div>
  );
};

export default SetupScreen;