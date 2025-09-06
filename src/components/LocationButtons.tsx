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
  { name: 'Sagrada Familia', lat: 41.4036, lng: 2.1744 },
  { name: 'Eiffel Tower', lat: 48.8584, lng: 2.2945 },
  { name: 'Big Ben', lat: 51.4994, lng: -0.1245 },
  { name: 'Andorra', lat: 42.5085, lng: 1.5339 },
  { name: 'Times Square', lat: 40.7580, lng: -73.9855 },
  { name: 'Golden Gate', lat: 37.8080, lng: -122.4755 }
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