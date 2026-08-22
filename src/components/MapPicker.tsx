"use client";

import dynamic from "next/dynamic";
import { useLanguage } from "@/lib/LanguageContext";
import { getCountryByCode } from "@/lib/data/countries";
import { MapPin } from "lucide-react";
import { useState, useCallback, useEffect } from "react";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), { ssr: false });

interface LocationResult {
  lat: number;
  lng: number;
  address: string;
}

interface MapPickerProps {
  value: string;
  onChange: (value: string, lat?: number, lng?: number) => void;
  placeholder: string;
  icon?: React.ReactNode;
  countryCode?: string;
  defaultLat?: number;
  defaultLng?: number;
  defaultZoom?: number;
}

export default function MapPicker({
  value,
  onChange,
  placeholder,
  icon,
  countryCode,
  defaultLat,
  defaultLng,
  defaultZoom,
}: MapPickerProps) {
  const { language } = useLanguage();
  const [searchInput, setSearchInput] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    defaultLat != null && defaultLng != null ? { lat: defaultLat, lng: defaultLng } : null,
  );

  useEffect(() => {
    if (defaultLat != null && defaultLng != null) {
      setCoords({ lat: defaultLat, lng: defaultLng });
    }
  }, [defaultLat, defaultLng, countryCode]);

  const searchLocation = useCallback(async (q: string) => {
    if (q.length < 3) { setSuggestions([]); return; }
    try {
      const cc = countryCode ? `&countrycodes=${countryCode.toLowerCase()}` : "";
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&accept-language=${language}${cc}`
      );
      const data = await res.json();
      setSuggestions(
        data.map((item: { lat: string; lon: string; display_name: string }) => ({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          address: item.display_name,
        }))
      );
    } catch {
      setSuggestions([]);
    }
  }, [language, countryCode]);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=${language}`
      );
      const data = await res.json();
      const addr = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      onChange(addr, lat, lng);
      setSearchInput(addr);
      setCoords({ lat, lng });
    } catch {
      onChange(`${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng);
      setSearchInput(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      setCoords({ lat, lng });
    }
  }, [language, onChange]);

  const selectSuggestion = (loc: LocationResult) => {
    setSearchInput(loc.address);
    onChange(loc.address, loc.lat, loc.lng);
    setCoords({ lat: loc.lat, lng: loc.lng });
    setSuggestions([]);
    setShowMap(true);
  };

  const confirmLocation = (lat: number, lng: number, address: string) => {
    onChange(address, lat, lng);
    setSearchInput(address);
    setCoords({ lat, lng });
    setShowMap(false);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
          {icon || <MapPin className="w-4 h-4" />}
        </div>
        <input
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            searchLocation(e.target.value);
            onChange(e.target.value);
          }}
          onFocus={() => searchInput.length >= 3 && searchLocation(searchInput)}
          placeholder={placeholder}
          className="w-full pr-10 pl-24 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
        />
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-emerald-600 hover:text-emerald-700 font-medium bg-emerald-50 px-2 py-1.5 rounded-lg"
        >
          {language === "ar" ? "خريطة" : language === "en" ? "Map" : "نقشہ"}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="border border-surface-200 rounded-xl bg-white shadow-lg max-h-48 overflow-y-auto z-20 relative">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => selectSuggestion(s)}
              className="w-full text-right px-4 py-2.5 text-sm text-surface-700 hover:bg-amber-50 border-b border-surface-100 last:border-0 transition-colors"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{s.address}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {showMap && (
        <div className="rounded-xl overflow-hidden border border-surface-200 relative">
          <LeafletMap
            lat={coords?.lat ?? defaultLat}
            lng={coords?.lng ?? defaultLng}
            zoom={defaultZoom ?? getCountryByCode(countryCode)?.zoom}
            countryCode={countryCode}
            onLocationSelect={confirmLocation}
          />
        </div>
      )}
    </div>
  );
}
