'use client';

import { useState, useEffect } from 'react';
import ImageDisplay from '@/components/ImageDisplay';
import MapView from '@/components/MapView';
import StyleSelector from '@/components/StyleSelector';
import PopulationSelector from '@/components/PopulationSelector';
import TimePeriodSelector from '@/components/TimePeriodSelector';
import LocationButtons from '@/components/LocationButtons';
import SetupScreen from '@/components/SetupScreen';

const GOOGLE_MOUNTAIN_VIEW = { lat: 37.4220656, lng: -122.0840897 };

export default function Home() {
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [mapsApiKey, setMapsApiKey] = useState<string>('');
  const [keysReady, setKeysReady] = useState<boolean>(false);

  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(GOOGLE_MOUNTAIN_VIEW);
  const [selectedStyle, setSelectedStyle] = useState<string>('Realistic');
  const [selectedPopulation, setSelectedPopulation] = useState<string>('Real persons');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('Present Day');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<{error?: string, message?: string, details?: unknown} | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const storedGeminiKey = localStorage.getItem('geminiApiKey');
    const storedMapsKey = localStorage.getItem('mapsApiKey');
    if (storedGeminiKey && storedMapsKey) {
      setGeminiApiKey(storedGeminiKey);
      setMapsApiKey(storedMapsKey);
      setKeysReady(true);
    }

  }, []);


  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setMarkerPosition(location);
  };

  const handleKeysSet = (gKey: string, mKey: string) => {
    localStorage.setItem('geminiApiKey', gKey);
    localStorage.setItem('mapsApiKey', mKey);
    setGeminiApiKey(gKey);
    setMapsApiKey(mKey);
    setKeysReady(true);
  };

  const handleGenerate = async () => {
    if (!markerPosition) {
      setError('Please select a location on the map.');
      return;
    }
    if (!geminiApiKey) {
        setError('API keys are not set. Please refresh and set them.');
        return;
    }

    setIsLoading(true);
    setError('');
    setErrorDetails(null);
    setMessage('');
    setGeneratedImage('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: markerPosition.lat,
          longitude: markerPosition.lng,
          style: selectedStyle,
          population: selectedPopulation,
          timePeriod: selectedTimePeriod,
          apiKey: geminiApiKey,
          mapsApiKey: mapsApiKey,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to generate image.');
        setErrorDetails(data);
        return;
      }

      setGeneratedImage(data.imageData);
      if(data.message) {
        setMessage(data.message);
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!keysReady) {
    return <SetupScreen onKeysSet={handleKeysSet} />;
  }

  return (
    <main className="flex min-h-screen bg-white dark:bg-gray-900">
      {/* Left Panel */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-800">Terraformer</h1>
              <a
                href="https://github.com/ericrisco/nanobanana-hackaton"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                title="View on GitHub"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                View on GitHub
              </a>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('geminiApiKey');
                localStorage.removeItem('mapsApiKey');
                setKeysReady(false);
                setGeminiApiKey('');
                setMapsApiKey('');
              }}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              title="Reset API Keys"
            >
              Reset Keys
            </button>
        </div>
        <div className="flex flex-col h-full">
          <LocationButtons onLocationSelect={handleLocationSelect} />
          <div className="flex-1 min-h-0">
            <MapView setMarkerPosition={setMarkerPosition} initialPosition={markerPosition} mapsApiKey={mapsApiKey} />
          </div>
        </div>
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-4">
          <StyleSelector selectedStyle={selectedStyle} setSelectedStyle={setSelectedStyle} />
          <PopulationSelector selectedPopulation={selectedPopulation} setSelectedPopulation={setSelectedPopulation} />
          <TimePeriodSelector selectedTimePeriod={selectedTimePeriod} setSelectedTimePeriod={setSelectedTimePeriod} />
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !markerPosition}
            className="w-full px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating...' : 'GENERATE'}
          </button>
        </div>
        {message && <div className="p-4 text-blue-500 dark:text-blue-400 text-sm">Info: {message}</div>}
      </div>

      {/* Right Panel */}
      <div className="w-2/3">
        <ImageDisplay generatedImage={generatedImage} isLoading={isLoading} />
      </div>

      {/* Error Modal */}
      {error && errorDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-red-600">API Error Details</h2>
                <button
                  onClick={() => {
                    setError('');
                    setErrorDetails(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Error Message:</h3>
                  <p className="text-red-600 bg-red-50 p-3 rounded border">{error}</p>
                </div>
                
                {errorDetails.message && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Additional Info:</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded border">{errorDetails.message}</p>
                  </div>
                )}
                
                {(errorDetails.details !== null && errorDetails.details !== undefined) && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Technical Details:</h3>
                    <pre className="text-sm text-gray-600 bg-gray-50 p-3 rounded border overflow-x-auto whitespace-pre-wrap">
                      {typeof errorDetails.details === 'string' 
                        ? errorDetails.details 
                        : JSON.stringify(errorDetails.details, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Full Response:</h3>
                  <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded border overflow-x-auto whitespace-pre-wrap max-h-40">
                    {JSON.stringify(errorDetails, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setError('');
                  setErrorDetails(null);
                }}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}