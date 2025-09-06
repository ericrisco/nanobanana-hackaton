'use client';

import React from 'react';
import Image from 'next/image';

interface ImageDisplayProps {
  generatedImage: string;
  isLoading: boolean;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ generatedImage, isLoading }) => {
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
          <a 
            href={generatedImage} 
            download="terraformer-art.png"
            className="absolute bottom-4 right-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Download
          </a>
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
    </div>
  );
};

export default ImageDisplay;