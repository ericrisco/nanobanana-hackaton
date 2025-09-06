'use client';

import { useState, useEffect } from 'react';
import ImageDisplay from '@/components/ImageDisplay';
import MapView from '@/components/MapView';
import StyleSelector from '@/components/StyleSelector';
import PopulationSelector from '@/components/PopulationSelector';
import TimePeriodSelector from '@/components/TimePeriodSelector';
import LocationButtons from '@/components/LocationButtons';
import SetupScreen from '@/components/SetupScreen';

const ANDORRA_LA_VELLA = { lat: 42.5063, lng: 1.5218 };

export default function Home() {
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [mapsApiKey, setMapsApiKey] = useState<string>('');
  const [keysReady, setKeysReady] = useState<boolean>(false);

  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(ANDORRA_LA_VELLA);
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
            <h1 className="text-xl font-bold text-gray-800">Terraformer</h1>
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