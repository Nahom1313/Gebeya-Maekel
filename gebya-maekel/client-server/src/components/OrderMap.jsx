import { useEffect, useRef } from 'react';

const OrderMap = ({ lat, lng, address }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!lat || !lng) return;

    // Use OpenStreetMap with Leaflet
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      if (mapRef.current && !mapRef.current._leaflet_id) {
        const map = window.L.map(mapRef.current).setView([lat, lng], 15);
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        window.L.marker([lat, lng])
          .addTo(map)
          .bindPopup(`📍 ${address}`)
          .openPopup();
      }
    };
    document.head.appendChild(script);
  }, [lat, lng]);

  if (!lat || !lng) return null;

  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        📍 Delivery Location
      </p>
      <div
        ref={mapRef}
        className="w-full h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
      ></div>
    </div>
  );
};

export default OrderMap;