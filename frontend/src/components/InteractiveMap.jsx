import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export const InteractiveMap = ({ items = [], height = '400px' }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Initialize Leaflet map instance if not already exists
    if (!mapInstanceRef.current && mapContainerRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([16.0, 108.0], 5);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear any previous active markers
    markersRef.current.forEach(marker => {
      if (map) map.removeLayer(marker);
    });
    markersRef.current = [];

    // Custom Marker Icon to bypass Vite path loading resolution issue
    const customIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    if (items.length > 0 && map) {
      const validItems = items.filter(item => item.lat && item.lng);

      if (validItems.length > 0) {
        // Adjust map center focus to first coordinate
        const first = validItems[0];
        map.setView([parseFloat(first.lat), parseFloat(first.lng)], 12);

        // Add markers
        validItems.forEach(item => {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lng);
          
          const popupContent = `
            <div style="width: 180px; font-family: sans-serif;">
              <img src="${item.image_url}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />
              <h4 style="margin: 0 0 4px 0; font-size: 0.95rem; color: #1A365D;">${item.name}</h4>
              <p style="margin: 0 0 6px 0; font-size: 0.8rem; color: #718096;">${item.location}</p>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold; color: #319795; font-size: 0.9rem;">${parseInt(item.price_per_night).toLocaleString()}đ</span>
                <span style="background: #FEFCBF; color: #B7791F; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; font-weight: bold;">⭐ ${item.star_rating}</span>
              </div>
            </div>
          `;

          const marker = L.marker([lat, lng], { icon: customIcon })
            .bindPopup(popupContent)
            .addTo(map);
          
          markersRef.current.push(marker);
        });
      }
    }
  }, [items]);

  useEffect(() => {
    // Cleanup map instance strictly on component unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', height, width: '100%', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
export default InteractiveMap;
