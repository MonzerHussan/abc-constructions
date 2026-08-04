import type { EntityRegistryMe } from "./types";

export interface MeResponse {
  success: boolean;
  data: EntityRegistryMe;
}

export async function fetchEntityRegistryMe(): Promise<EntityRegistryMe> {
  const res = await fetch("/api/v1/entity-registry/me", {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `HTTP ${res.status}`);
  }
  const json = (await res.json()) as MeResponse;
  return json.data;
}
