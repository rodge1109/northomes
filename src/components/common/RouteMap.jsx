import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';

// Fix leaflet default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle routing
function RoutingMachine({ start, end }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !start || !end) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1])
      ],
      lineOptions: {
        styles: [{ color: '#00754A', weight: 6, opacity: 0.8 }] // Custom Green line
      },
      routeWhileDragging: false,
      addWaypoints: false,
      show: false, // Don't show the text instructions panel
      createMarker: function() { return null; } // Optional: Hide markers if we just want the line, or keep default
    }).addTo(map);

    return () => {
      if (routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [map, start, end]);

  return null;
}

export default function RouteMap({ userLocation }) {
  // Approximate Bogo City Coordinates for Northomes Pensione
  const hotelLocation = [11.055, 124.004];

  if (!userLocation) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-2xl border border-black/10">
        <p className="text-black/50 font-medium">Please allow location access to view the route.</p>
      </div>
    );
  }

  // Calculate center between user and hotel
  const centerLat = (userLocation[0] + hotelLocation[0]) / 2;
  const centerLng = (userLocation[1] + hotelLocation[1]) / 2;

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-black/10 shadow-sm relative z-0">
      <MapContainer 
        center={[centerLat, centerLng]} 
        zoom={10} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RoutingMachine start={userLocation} end={hotelLocation} />
      </MapContainer>
    </div>
  );
}
