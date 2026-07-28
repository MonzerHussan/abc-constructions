"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { ProjectMarker } from "@/components/ProjectMap";

interface Props {
  projects: ProjectMarker[];
}

export default function ProjectMapInner({ projects }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || projects.length === 0) return;

    const init = async () => {
      const L = (await import("leaflet")).default;

      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }

      const first = projects[0];
      const map = L.map(mapRef.current!, { zoomControl: false }).setView([first.lat, first.lng], 11);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      const statusColors: Record<string, string> = {
        COMPLETED: "#22c55e",
        IN_PROGRESS: "#3b82f6",
        PLANNING: "#eab308",
        ON_HOLD: "#ef4444",
      };

      const bounds: any[] = [];

      projects.forEach((p) => {
        const color = statusColors[p.status] || "#f59e0b";
        const label = p.status === "COMPLETED" ? "مكتمل" : p.status === "IN_PROGRESS" ? "جاري" : p.status === "PLANNING" ? "تخطيط" : "متوقف";

        const markerIcon = L.divIcon({
          className: "",
          html: `<div style="width:36px;height:36px;background:${color};border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);color:white;font-weight:bold;font-size:14px;font-family:sans-serif">${p.title[0]}</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([p.lat, p.lng], { icon: markerIcon }).addTo(map);
        marker.bindPopup(
          `<div style="min-width:180px;font-family:sans-serif">
            <p style="font-weight:bold;margin:0 0 4px;font-size:14px">${p.title}</p>
            <p style="margin:0 0 2px;font-size:12px;color:#666">${p.location}</p>
            <span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;background:${color}20;color:${color};font-weight:600">${label}</span>
          </div>`
        );

        bounds.push([p.lat, p.lng]);
      });

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }

      instanceRef.current = map;
    };

    init();

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, [projects]);

  return <div ref={mapRef} className="w-full h-full" />;
}
