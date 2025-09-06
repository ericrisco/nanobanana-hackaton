'use client';

import React from 'react';

interface PopulationSelectorProps {
  selectedPopulation: string;
  setSelectedPopulation: (population: string) => void;
}

const populations = ["Real persons", "Bananas", "Robots", "Zoo animals", "Sea animals", "Ghosts", "Superheroes"];

const PopulationSelector: React.FC<PopulationSelectorProps> = ({ selectedPopulation, setSelectedPopulation }) => {
  return (
    <div>
      <h3 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Population</h3>
      <div className="flex flex-wrap gap-2">
        {populations.map((population) => (
          <button
            key={population}
            onClick={() => setSelectedPopulation(population)}
            className={`px-3 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
              selectedPopulation === population
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white border-gray-300 hover:bg-gray-100'
            }`}
          >
            {population}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PopulationSelector;