'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { mapStyleLight } from './mapStyles';

interface MapViewProps {
  setMarkerPosition: (position: { lat: number; lng: number }) => void;
  initialPosition: { lat: number; lng: number } | null;
  mapsApiKey: string;
}

const ANDORRA_LA_VELLA = { lat: 42.5063, lng: 1.5218 };

const MapView: React.FC<MapViewProps> = ({ setMarkerPosition, initialPosition, mapsApiKey }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: mapsApiKey,
  });

  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(initialPosition);
  const [center, setCenter] = useState<{ lat: number; lng: number }>(initialPosition || ANDORRA_LA_VELLA);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Update marker and center when initialPosition changes
  useEffect(() => {
    if (initialPosition) {
      setMarker(initialPosition);
      setCenter(initialPosition);
      // Pan to new location if map is loaded
      if (mapRef.current) {
        mapRef.current.panTo(initialPosition);
        mapRef.current.setZoom(15);
      }
    }
  }, [initialPosition]);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    const lat = event.latLng!.lat();
    const lng = event.latLng!.lng();
    const position = { lat, lng };
    setMarker(position);
    setMarkerPosition(position);
  };

  const mapOptions = {
    mapTypeId: 'roadmap',
    styles: mapStyleLight,
    disableDefaultUI: true,
    zoomControl: true,
  };

  if (loadError) {
    return <div className="p-4 text-red-500">Error loading maps. Please check your API key and ensure it is enabled for Maps JavaScript API.</div>;
  }

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={center}
      zoom={15}
      onClick={handleMapClick}
      options={mapOptions}
      onLoad={(map) => {
        mapRef.current = map;
      }}
    >
      {marker && <Marker position={marker} />}
    </GoogleMap>
  ) : (
    <div className="h-full bg-gray-300 flex items-center justify-center">
      <p className="text-gray-500">Loading Map...</p>
    </div>
  );
};

export default MapView;