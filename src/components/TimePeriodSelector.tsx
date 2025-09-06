'use client';

import React from 'react';

interface TimePeriodSelectorProps {
  selectedTimePeriod: string;
  setSelectedTimePeriod: (timePeriod: string) => void;
}

const timePeriods = ["Present Day", "Ancient Rome", "Medieval Times", "1920s Art Deco", "1980s Cyberpunk", "Distant Future", "Prehistoric"];

const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({ selectedTimePeriod, setSelectedTimePeriod }) => {
  return (
    <div>
      <h3 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Time Period</h3>
      <div className="flex flex-wrap gap-2">
        {timePeriods.map((period) => (
          <button
            key={period}
            onClick={() => setSelectedTimePeriod(period)}
            className={`px-3 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
              selectedTimePeriod === period
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white border-gray-300 hover:bg-gray-100'
            }`}
          >
            {period}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimePeriodSelector;