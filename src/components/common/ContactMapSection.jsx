import React, { useState } from 'react';

export default function ContactMapSection() {
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
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setError("Unable to retrieve your location. Please allow location access.");
        setLoading(false);
      }
    );
  };

  // Default hotel location URL
  let mapSrc = "https://maps.google.com/maps?q=Northomes%20Pensione,%20Pelaez%20St.,%20Bogo%20City,%20Cebu&t=&z=17&ie=UTF8&iwloc=&output=embed";
  
  if (userLocation) {
    // If we have user location, generate a directions URL
    mapSrc = `https://maps.google.com/maps?saddr=${userLocation.lat},${userLocation.lng}&daddr=Northomes%20Pensione,%20Pelaez%20St.,%20Bogo%20City,%20Cebu&output=embed`;
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      {/* Map */}
      <div className="bg-white rounded-3xl shadow-sm h-[600px] lg:h-[700px] overflow-hidden">
        <iframe
          src={mapSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          title="Northomes Pensionne Location"
        ></iframe>
      </div>

      {/* Button below map */}
      <div className="bg-white rounded-3xl shadow-sm border border-black/5 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#000000]/87">Get Directions</h3>
          <p className="text-black/60 text-sm">Pin your current location to see the route to Northomes Pensione.</p>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        <button 
          onClick={handlePinLocation}
          disabled={loading}
          className="px-6 py-3 bg-[#005530] text-white hover:bg-[#004420] rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md min-w-[200px]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          {loading ? 'Locating...' : 'Pin your location'}
        </button>
      </div>
    </div>
  );
}
