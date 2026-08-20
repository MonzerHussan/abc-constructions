"use client";

import { useEffect, useState } from "react";

/** Whether NextAuth exposes the Google provider (valid OAuth credentials on server). */
export function useGoogleAuthAvailable(): boolean {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/providers")
      .then((r) => (r.ok ? r.json() : null))
      .then((providers) => {
        if (!cancelled) setAvailable(!!providers?.google);
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return available;
}
