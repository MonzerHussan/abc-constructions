"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface LeafletMapProps {
  lat?: number;
  lng?: number;
  zoom?: number;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

const RIYADH = { lat: 24.7136, lng: 46.6753 };

export default function LeafletMap({ lat, lng, zoom, onLocationSelect }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);
  const cbRef = useRef(onLocationSelect);
  cbRef.current = onLocationSelect;

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }

      const startLat = lat ?? RIYADH.lat;
      const startLng = lng ?? RIYADH.lng;
      const startZoom = zoom ?? 14;

      const map = L.map(mapRef.current!, { zoomControl: false }).setView([startLat, startLng], startZoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      const markerIcon = L.divIcon({
        className: "",
        html: `<div style="width:32px;height:32px;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([startLat, startLng], { icon: markerIcon, draggable: true }).addTo(map);

      const updateLocation = async (pos: { lat: number; lng: number }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.lat}&lon=${pos.lng}&format=json`
          );
          const data = await res.json();
          cbRef.current(pos.lat, pos.lng, data.display_name || `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`);
        } catch {
          cbRef.current(pos.lat, pos.lng, `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`);
        }
      };

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        updateLocation(pos);
      });

      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        updateLocation(e.latlng);
      });

      instanceRef.current = map;
    };

    initMap();

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, [lat, lng, zoom]);

  return <div ref={mapRef} className="h-64 w-full" />;
}
