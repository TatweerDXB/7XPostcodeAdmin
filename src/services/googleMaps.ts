/**
 * Google Maps JavaScript SDK, Places Autocomplete, and Geocoding Service
 * Uses NEXT_PUBLIC_GOOGLE_MAPS_API_KEY from environment variables.
 */

export interface TierBounds {
  north: number;
  south: number;
  west: number;
  east: number;
}

export const TIER1_DEFAULT_BOUNDS: TierBounds = {
  north: 27.789,
  south: 21.989,
  west: 50.363,
  east: 56.863,
};

export function getSubCellBounds(parent: TierBounds, cellId: string): TierBounds {
  const r = parseInt(cellId[0], 10) || 0;
  const c = parseInt(cellId[1], 10) || 0;
  const latStep = (parent.north - parent.south) / 10;
  const lngStep = (parent.east - parent.west) / 10;
  return {
    north: parent.north - r * latStep,
    south: parent.north - (r + 1) * latStep,
    west: parent.west + c * lngStep,
    east: parent.west + (c + 1) * lngStep,
  };
}

export function getCellFromCoords(bounds: TierBounds, lat: number, lng: number): string {
  const latStep = (bounds.north - bounds.south) / 10;
  const lngStep = (bounds.east - bounds.west) / 10;
  const r = Math.max(0, Math.min(9, Math.floor((bounds.north - lat) / latStep)));
  const c = Math.max(0, Math.min(9, Math.floor((lng - bounds.west) / lngStep)));
  return `${r}${c}`;
}

export function calculateTiersFromCoords(lat: number, lng: number) {
  const t1Bounds = TIER1_DEFAULT_BOUNDS;
  const t1 = getCellFromCoords(t1Bounds, lat, lng);

  const t2Bounds = getSubCellBounds(t1Bounds, t1);
  const t2 = getCellFromCoords(t2Bounds, lat, lng);

  const t3Bounds = getSubCellBounds(t2Bounds, t2);
  const t3 = getCellFromCoords(t3Bounds, lat, lng);

  const t4Bounds = getSubCellBounds(t3Bounds, t3);
  const t4 = getCellFromCoords(t4Bounds, lat, lng);

  return {
    tier1: t1,
    tier2: t2,
    tier3: t3,
    tier4: t4,
    postcode: `${t1}${t2}-${t3}${t4}`,
    bounds: {
      tier1: t1Bounds,
      tier2: t2Bounds,
      tier3: t3Bounds,
      tier4: t4Bounds,
    },
  };
}

export interface GeocodeResultDetails {
  lat: number;
  lng: number;
  formattedAddress: string;
  placeName?: string;
  street?: string;
  areaLocality?: string;
  emirate?: string;
  country?: string;
  postalCode?: string;
}

let googleMapsLoadPromise: Promise<typeof google> | null = null;

export function loadGoogleMaps(): Promise<typeof google> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only be loaded in browser environment"));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (googleMapsLoadPromise) {
    return googleMapsLoadPromise;
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  if (!apiKey) {
    return Promise.reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not defined in environment"));
  }

  googleMapsLoadPromise = new Promise((resolve, reject) => {
    // If an old failed script exists in the DOM without maps object, remove it
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      if (window.google?.maps) {
        resolve(window.google);
        return;
      }
      existingScript.remove();
    }

    const script = document.createElement("script");
    const callbackName = `__initGoogleMaps_${Date.now()}`;
    
    // Catch Google auth failure (like RefererNotAllowed) so we don't latch into broken state
    const prevAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      googleMapsLoadPromise = null;
      script.remove();
      if (prevAuthFailure) prevAuthFailure();
    };

    (window as any)[callbackName] = () => {
      delete (window as any)[callbackName];
      if (window.google?.maps) {
        resolve(window.google);
      } else {
        googleMapsLoadPromise = null;
        script.remove();
        reject(new Error("Google Maps SDK initialized without maps namespace"));
      }
    };

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geocoding&callback=${callbackName}&loading=async`;
    script.async = true;
    script.defer = true;
    script.onerror = (err) => {
      delete (window as any)[callbackName];
      googleMapsLoadPromise = null;
      script.remove();
      reject(err);
    };

    document.head.appendChild(script);
  });

  return googleMapsLoadPromise;
}

export interface PlacePrediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
  description: string;
}

let autocompleteServiceInstance: google.maps.places.AutocompleteService | null = null;
let geocoderInstance: google.maps.Geocoder | null = null;

export async function getPlacePredictions(query: string): Promise<PlacePrediction[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const google = await loadGoogleMaps();
    if (!google?.maps?.places?.AutocompleteService) {
      console.warn("Google Maps Places library is not available yet.");
      return [];
    }

    if (!autocompleteServiceInstance) {
      autocompleteServiceInstance = new google.maps.places.AutocompleteService();
    }

    return new Promise((resolve) => {
      autocompleteServiceInstance!.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: "ae" }, // Restrict search to United Arab Emirates
        },
        (predictions, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
            resolve([]);
            return;
          }

          resolve(
            predictions.map((p) => ({
              placeId: p.place_id,
              mainText: p.structured_formatting?.main_text || p.description,
              secondaryText: p.structured_formatting?.secondary_text || "",
              description: p.description,
            }))
          );
        }
      );
    });
  } catch (err) {
    console.warn("Could not retrieve Google Places predictions:", err);
    return [];
  }
}

function parseAddressComponents(results: google.maps.GeocoderResult[]): Partial<GeocodeResultDetails> {
  if (!results.length) return {};
  const first = results[0];
  const details: Partial<GeocodeResultDetails> = {
    formattedAddress: first.formatted_address,
  };

  for (const comp of first.address_components) {
    const types = comp.types;
    if (types.includes("route")) {
      details.street = comp.long_name;
    } else if (types.includes("sublocality") || types.includes("neighborhood") || types.includes("sublocality_level_1")) {
      details.areaLocality = comp.long_name;
    } else if (types.includes("locality") && !details.areaLocality) {
      details.areaLocality = comp.long_name;
    } else if (types.includes("administrative_area_level_1")) {
      details.emirate = comp.long_name;
    } else if (types.includes("country")) {
      details.country = comp.long_name;
    } else if (types.includes("postal_code")) {
      details.postalCode = comp.long_name;
    } else if (types.includes("premise") || types.includes("point_of_interest") || types.includes("establishment")) {
      details.placeName = comp.long_name;
    }
  }

  return details;
}

export async function geocodePlaceId(placeId: string): Promise<GeocodeResultDetails | null> {
  try {
    const google = await loadGoogleMaps();
    if (!geocoderInstance) {
      geocoderInstance = new google.maps.Geocoder();
    }

    return new Promise((resolve) => {
      geocoderInstance!.geocode({ placeId }, (results, status) => {
        if (status !== google.maps.GeocoderStatus.OK || !results || !results[0]) {
          resolve(null);
          return;
        }

        const res = results[0];
        const parsed = parseAddressComponents(results);
        resolve({
          lat: res.geometry.location.lat(),
          lng: res.geometry.location.lng(),
          formattedAddress: res.formatted_address,
          placeName: parsed.placeName,
          street: parsed.street,
          areaLocality: parsed.areaLocality,
          emirate: parsed.emirate,
          country: parsed.country,
          postalCode: parsed.postalCode,
        });
      });
    });
  } catch (err) {
    console.warn("Geocode PlaceId error:", err);
    return null;
  }
}

export async function geocodeAddress(address: string): Promise<GeocodeResultDetails | null> {
  try {
    const google = await loadGoogleMaps();
    if (!geocoderInstance) {
      geocoderInstance = new google.maps.Geocoder();
    }

    return new Promise((resolve) => {
      geocoderInstance!.geocode(
        {
          address,
          componentRestrictions: { country: "ae" },
        },
        (results, status) => {
          if (status !== google.maps.GeocoderStatus.OK || !results || !results[0]) {
            resolve(null);
            return;
          }

          const res = results[0];
          const parsed = parseAddressComponents(results);
          resolve({
            lat: res.geometry.location.lat(),
            lng: res.geometry.location.lng(),
            formattedAddress: res.formatted_address,
            placeName: parsed.placeName,
            street: parsed.street,
            areaLocality: parsed.areaLocality,
            emirate: parsed.emirate,
            country: parsed.country,
            postalCode: parsed.postalCode,
          });
        }
      );
    });
  } catch (err) {
    console.warn("Geocode address error:", err);
    return null;
  }
}

export async function reverseGeocodeCoords(lat: number, lng: number): Promise<GeocodeResultDetails | null> {
  try {
    const google = await loadGoogleMaps();
    if (!geocoderInstance) {
      geocoderInstance = new google.maps.Geocoder();
    }

    return new Promise((resolve) => {
      geocoderInstance!.geocode({ location: { lat, lng } }, (results, status) => {
        if (status !== google.maps.GeocoderStatus.OK || !results || !results[0]) {
          resolve(null);
          return;
        }

        const res = results[0];
        const parsed = parseAddressComponents(results);
        resolve({
          lat,
          lng,
          formattedAddress: res.formatted_address,
          placeName: parsed.placeName,
          street: parsed.street,
          areaLocality: parsed.areaLocality,
          emirate: parsed.emirate,
          country: parsed.country,
          postalCode: parsed.postalCode,
        });
      });
    });
  } catch (err) {
    console.warn("Reverse geocode error:", err);
    return null;
  }
}
