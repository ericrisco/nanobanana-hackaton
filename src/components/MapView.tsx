'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, StreetViewPanorama } from '@react-google-maps/api';
import { mapStyleLight } from './mapStyles';

const libraries: ("places")[] = ['places'];

interface MapViewProps {
  setMarkerPosition: (position: { lat: number; lng: number }) => void;
  initialPosition: { lat: number; lng: number } | null;
  mapsApiKey: string;
  setStreetViewPov?: (pov: {heading: number, pitch: number} | null) => void;
}

const GOOGLE_MOUNTAIN_VIEW = { lat: 37.4220656, lng: -122.0840897 };

const MapView: React.FC<MapViewProps> = ({ setMarkerPosition, initialPosition, mapsApiKey, setStreetViewPov }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: mapsApiKey,
    libraries,
  });

  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(initialPosition);
  const [center, setCenter] = useState<{ lat: number; lng: number }>(initialPosition || GOOGLE_MOUNTAIN_VIEW);
  const [viewMode, setViewMode] = useState<'map' | 'streetview'>('map');
  const [streetViewAvailable, setStreetViewAvailable] = useState<boolean | null>(null);
  const [checkingStreetView, setCheckingStreetView] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [streetViewReady, setStreetViewReady] = useState<boolean>(false);
  const [currentStreetViewPov, setCurrentStreetViewPov] = useState<{heading: number, pitch: number} | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const streetViewRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const checkStreetViewAvailability = useCallback((position: { lat: number; lng: number }) => {
    if (!isLoaded) return;
    
    setCheckingStreetView(true);
    setStreetViewReady(false);
    
    setTimeout(() => {
      const streetViewService = new google.maps.StreetViewService();
      
      streetViewService.getPanorama(
        {
          location: position,
          radius: 100,
          source: google.maps.StreetViewSource.OUTDOOR,
        },
        (data, status) => {
          const available = status === google.maps.StreetViewStatus.OK;
          setStreetViewAvailable(available);
          setStreetViewReady(available && isLoaded);
          setCheckingStreetView(false);
          
          if (status !== google.maps.StreetViewStatus.OK) {
            console.warn('Street View status:', status);
          }
        }
      );
    }, 500);
  }, [isLoaded]);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (isLoaded && searchInputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new google.maps.places.Autocomplete(searchInputRef.current, {
        types: ['establishment', 'geocode'],
        fields: ['place_id', 'geometry', 'name', 'formatted_address']
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place && place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const position = { lat, lng };
          
          setMarker(position);
          setCenter(position);
          setMarkerPosition(position);
          setCurrentStreetViewPov(null);
          setStreetViewPov?.(null);
          
          if (mapRef.current) {
            mapRef.current.panTo(position);
            mapRef.current.setZoom(15);
          }
          
          checkStreetViewAvailability(position);
          setSearchValue(place.name || place.formatted_address || '');
        }
      });
    }
  }, [isLoaded, setMarkerPosition, checkStreetViewAvailability]);

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
      checkStreetViewAvailability(initialPosition);
    }
  }, [initialPosition, isLoaded, checkStreetViewAvailability]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
      if (streetViewRef.current) {
        streetViewRef.current = null;
      }
    };
  }, []);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    const lat = event.latLng!.lat();
    const lng = event.latLng!.lng();
    const position = { lat, lng };
    setMarker(position);
    setMarkerPosition(position);
    setCurrentStreetViewPov(null);
    setStreetViewPov?.(null);
    checkStreetViewAvailability(position);
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
    <div className="h-full w-full relative">
      {/* Search input */}
      <div className="absolute top-2 right-2 z-10">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for a place..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Toggle buttons */}
      <div className="absolute top-2 left-2 z-10 flex gap-1">
        <button
          onClick={() => setViewMode('map')}
          className={`px-2 py-1 text-xs rounded ${
            viewMode === 'map' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Map
        </button>
        <button
          onClick={() => {
            if (streetViewAvailable && streetViewReady) {
              setViewMode('streetview');
            }
          }}
          disabled={!streetViewAvailable || checkingStreetView || !streetViewReady}
          className={`px-2 py-1 text-xs rounded ${
            viewMode === 'streetview' 
              ? 'bg-blue-600 text-white' 
              : streetViewAvailable && streetViewReady
                ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
          }`}
        >
          {checkingStreetView ? 'Checking...' : 'Street View'}
        </button>
      </div>

      {viewMode === 'map' ? (
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
      ) : streetViewAvailable === true && marker && isLoaded && streetViewReady ? (
        <GoogleMap
          key={`streetview-map-${marker.lat}-${marker.lng}`}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={marker}
          zoom={15}
          options={{
            ...mapOptions,
            streetViewControl: false,
            mapTypeControl: false,
          }}
        >
          <StreetViewPanorama
            onLoad={(streetView) => {
              if (streetView) {
                streetViewRef.current = streetView;
                try {
                  streetView.setPosition(marker);
                  streetView.setVisible(true);
                  
                  const initialPov = streetView.getPov();
                  const povData = {
                    heading: initialPov.heading || 0,
                    pitch: initialPov.pitch || 0
                  };
                  setCurrentStreetViewPov(povData);
                  setStreetViewPov?.(povData);
                  streetView.addListener('pov_changed', () => {
                    const pov = streetView.getPov();
                    const povData = {
                      heading: pov.heading || 0,
                      pitch: pov.pitch || 0
                    };
                    setCurrentStreetViewPov(povData);
                    setStreetViewPov?.(povData);
                  });
                  
                } catch (error) {
                  console.error('Error loading Street View:', error);
                  setStreetViewAvailable(false);
                  setViewMode('map');
                }
              }
            }}
            onUnmount={() => {
              streetViewRef.current = null;
            }}
            options={{
              addressControl: false,
              showRoadLabels: false,
              panControl: true,
              zoomControl: true,
            }}
          />
        </GoogleMap>
      ) : streetViewAvailable === false ? (
        <div className="h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center p-4 max-w-md mx-auto">
            <p className="text-gray-600 mb-2">Street View not available</p>
            <p className="text-sm text-gray-500 mb-4">
              This could be due to location limitations or API quota limits. 
              The Street View feature has usage limits that may be reached during high traffic.
            </p>
            <button
              onClick={() => setViewMode('map')}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Map
            </button>
          </div>
        </div>
      ) : checkingStreetView ? (
        <div className="h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Checking Street View availability...</p>
          </div>
        </div>
      ) : (
        <div className="h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-gray-600">Select a location to view Street View</p>
            <button
              onClick={() => setViewMode('map')}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 mt-2"
            >
              Back to Map
            </button>
          </div>
        </div>
      )
      }
    </div>
  ) : (
    <div className="h-full bg-gray-300 flex items-center justify-center">
      <p className="text-gray-500">Loading Map...</p>
    </div>
  );
};

export default MapView;