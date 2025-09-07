'use client';

import React from 'react';

interface TimePeriodSelectorProps {
  selectedTimePeriod: string;
  setSelectedTimePeriod: (timePeriod: string) => void;
}

const timePeriods = ["Present Day", "Prehistoric", "Ancient Rome", "Medieval Times", "Renaissance", "1920", "1940", "1950", "1980"];

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