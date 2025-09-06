'use client';

import React from 'react';

interface StyleSelectorProps {
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
}

const styles = ["Comic", "Realistic", "Futuristic", "Destroyed", "On Fire", "Flooded"];

const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, setSelectedStyle }) => {
  return (
    <div>
      <h3 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Style</h3>
      <div className="flex flex-wrap gap-2">
        {styles.map((style) => (
          <button
            key={style}
            onClick={() => setSelectedStyle(style)}
            className={`px-3 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
              selectedStyle === style
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white border-gray-300 hover:bg-gray-100'
            }`}
          >
            {style}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StyleSelector;