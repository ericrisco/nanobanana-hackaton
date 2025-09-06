'use client';

import React from 'react';

interface Location {
  name: string;
  lat: number;
  lng: number;
}

interface LocationButtonsProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
}

const locations: Location[] = [
  { name: 'Sagrada Familia', lat: 41.40257803767475, lng: 2.1732777623883983 },
  { name: 'Eiffel Tower', lat: 48.85621812639946, lng: 2.2976898891584367 },
  { name: 'Big Ben', lat: 51.50084938916221, lng: -0.12146039590768407 },
  { name: 'Times Square', lat: 40.75798429360665, lng: -73.98552951012392 },
  { name: 'Golden Gate', lat: 37.809262497364884, lng: -122.47001919306939 },
  { name: 'Giza Pyramids', lat: 29.977521522895263, lng: 31.13229822197485 }
];

const LocationButtons: React.FC<LocationButtonsProps> = ({ onLocationSelect }) => {
  return (
    <div className="p-3 border-b border-gray-200 bg-gray-50">
      <h3 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Quick Locations</h3>
      <div className="flex flex-wrap gap-2">
        {locations.map((location) => (
          <button
            key={location.name}
            onClick={() => onLocationSelect({ lat: location.lat, lng: location.lng })}
            className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            {location.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LocationButtons;