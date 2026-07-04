import React, { useState } from 'react';
import RouteMap from './RouteMap';

export default function LocationRoutingBox() {
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePinLocation = () => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setError("Unable to retrieve your location. Please allow location access.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="mt-8 flex flex-col gap-6">
      <button 
        onClick={handlePinLocation}
        disabled={loading}
        className="w-full py-4 bg-[#005530] text-white hover:bg-[#004420] rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        {loading ? 'Locating...' : 'Pin your location'}
      </button>

      {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

      {userLocation && (
        <div className="w-full">
          <h4 className="text-[13px] font-black text-black/80 mb-3 tracking-tight">Route to Northomes Pensione</h4>
          <RouteMap userLocation={userLocation} />
        </div>
      )}
    </div>
  );
}
