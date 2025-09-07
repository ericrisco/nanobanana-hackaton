'use client';

import React from 'react';
import Image from 'next/image';

interface ImageDisplayProps {
  generatedImage: string;
  isLoading: boolean;
  referenceMapUrl?: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ generatedImage, isLoading, referenceMapUrl }) => {
  const [showMapModal, setShowMapModal] = React.useState(false);
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-white"></div>
        </div>
      )}
      {generatedImage ? (
        <>
          <Image 
            src={generatedImage} 
            alt="Generated artwork" 
            width={800} 
            height={600} 
            className="max-w-full max-h-full object-contain" 
            unoptimized={true}
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            {referenceMapUrl && (
              <button
                onClick={() => setShowMapModal(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center gap-2"
                title="View reference map"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"/>
                </svg>
                Map Reference
              </button>
            )}
            <a 
              href={generatedImage} 
              download="terraformer-art.png"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Download
            </a>
          </div>
        </>
      ) : (
        !isLoading && (
          <div className="text-gray-500 text-center p-8 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">How It Works</h2>
            <ol className="text-left space-y-4">
              <li className="flex items-start">
                <span className="font-bold text-indigo-600 mr-3">1.</span>
                <span>
                  <strong className="text-gray-700">Drop a Pin:</strong> Click anywhere on the map to select a location.
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-indigo-600 mr-3">2.</span>
                <span>
                  <strong className="text-gray-700">Choose a Style:</strong> Pick a creative style for your image.
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-indigo-600 mr-3">3.</span>
                <span>
                  <strong className="text-gray-700">Generate:</strong> Hit the GENERATE button and wait for the magic.
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-indigo-600 mr-3">4.</span>
                <span>
                  <strong className="text-gray-700">View & Download:</strong> Your AI-generated image will appear here, ready to be saved.
                </span>
              </li>
            </ol>
          </div>
        )
      )}

      {/* Reference Map Modal */}
      {showMapModal && referenceMapUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Reference Map Used by AI</h2>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-4 flex justify-center">
              <img 
                src={referenceMapUrl} 
                alt="Reference map used for AI generation" 
                className="max-w-full max-h-[70vh] object-contain rounded-lg border"
              />
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
              <p>This is the Google Maps image that was sent to the AI as reference. The red marker shows the exact viewpoint location.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;