"use client";

import { useCallback, useEffect, useState } from "react";
import type { PortalHomeResult } from "@/modules/portal/types/portal-home.types";

interface UsePortalHomeResult {
  data: PortalHomeResult | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function usePortalHome(persona = "CONTRACTOR"): UsePortalHomeResult {
  const [data, setData] = useState<PortalHomeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/v1/portal/home?persona=${encodeURIComponent(persona)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        const d = res?.data as PortalHomeResult | null;
        if (d) setData(d);
        setError(d ? null : "load_failed");
      })
      .catch(() => setError("load_failed"))
      .finally(() => setLoading(false));
  }, [persona]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}