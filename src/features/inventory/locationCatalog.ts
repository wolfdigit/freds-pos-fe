type LocationCatalogListener = () => void;

const listeners = new Set<LocationCatalogListener>();

/** Store binding changes share this signal so every mounted location list reloads. */
export function invalidateLocationCatalog(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeLocationCatalog(listener: LocationCatalogListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
