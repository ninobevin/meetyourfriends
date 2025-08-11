'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Location {
  latitude: number;
  longitude: number;
}

interface Participant {
  id: string;
  name: string;
  location: Location;
}

interface MapComponentProps {
  participants: Participant[];
  userLocation: Location | null;
}

const MapComponent = ({ participants, userLocation }: MapComponentProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{[key: string]: L.Marker}>({});
  const firstLoadRef = useRef(true);

  // Initialize map only once
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([0, 0], 2);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = {};
      }
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up removed participant markers
    Object.keys(markersRef.current).forEach(id => {
      if (id !== 'user' && !participants.find(p => p.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Update markers for all participants
    participants.forEach(participant => {
      const { id, location, name } = participant;
      const { latitude, longitude } = location;

      if (markersRef.current[id]) {
        // Update existing marker position
        markersRef.current[id].setLatLng([latitude, longitude]);
      } else {
        // Create new marker
        markersRef.current[id] = L.marker([latitude, longitude], {
          icon: L.divIcon({
            className: 'custom-marker participant',
            iconSize: [16, 16]
          })
        })
          .bindPopup(name)
          .addTo(mapRef.current!);
      }
    });

    // Update user's location marker
    if (userLocation) {
      const { latitude, longitude } = userLocation;
      if (markersRef.current['user']) {
        markersRef.current['user'].setLatLng([latitude, longitude]);
      } else {
        markersRef.current['user'] = L.marker([latitude, longitude], {
          icon: L.divIcon({
            className: 'custom-marker user',
            iconSize: [16, 16]
          })
        })
          .bindPopup('You are here')
          .addTo(mapRef.current!);
      }

      // Only center map on first load or when user location changes significantly
      if (firstLoadRef.current) {
        mapRef.current.setView([latitude, longitude], 13);
        firstLoadRef.current = false;
      }
    }
  }, [participants, userLocation]);

  return <div id="map" className="h-[500px] w-full rounded-lg" />;
};

export default MapComponent;
