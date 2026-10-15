export function sanitizeHtml(str: string | number | null | undefined): string {
  if (str === null || str === undefined) return "";
  const stringValue = String(str);
  return stringValue
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\//g, "&#x2F;");
}

export interface CoordinateValidationResult {
  valid: boolean;
  inUaeBounds: boolean;
  reason?: string;
}

export const UAE_GEO_BOUNDS = {
  minLat: 21.0,
  maxLat: 27.8,
  minLng: 50.0,
  maxLng: 57.2,
};

export function validateCoordinates(
  lat: number | null | undefined,
  lng: number | null | undefined
): CoordinateValidationResult {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return { valid: false, inUaeBounds: false, reason: "Coordinates cannot be empty." };
  }

  if (typeof lat !== "number" || typeof lng !== "number" || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { valid: false, inUaeBounds: false, reason: "Coordinates must be finite numeric values." };
  }

  if (lat < -90 || lat > 90) {
    return { valid: false, inUaeBounds: false, reason: "Latitude must be between -90 and 90 degrees." };
  }

  if (lng < -180 || lng > 180) {
    return { valid: false, inUaeBounds: false, reason: "Longitude must be between -180 and 180 degrees." };
  }

  const inUaeBounds =
    lat >= UAE_GEO_BOUNDS.minLat &&
    lat <= UAE_GEO_BOUNDS.maxLat &&
    lng >= UAE_GEO_BOUNDS.minLng &&
    lng <= UAE_GEO_BOUNDS.maxLng;

  return {
    valid: true,
    inUaeBounds,
  };
}

export function reduceCoordinatePrecision(
  lat: number,
  lng: number,
  decimals: number = 3
): { lat: number; lng: number } {
  const factor = Math.pow(10, decimals);
  return {
    lat: Math.round(lat * factor) / factor,
    lng: Math.round(lng * factor) / factor,
  };
}

export function sanitizeInputText(
  input: string | null | undefined,
  maxLength: number = 255
): string {
  if (!input) return "";
  const cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
  return cleaned.slice(0, maxLength);
}

export function sanitizeErrorMessage(error: unknown, fallbackMessage: string = "An unexpected error occurred. Please try again."): string {
  if (!error) return fallbackMessage;

  let rawMessage = "";
  if (typeof error === "string") {
    rawMessage = error;
  } else if (error instanceof Error) {
    rawMessage = error.message;
  } else if (typeof error === "object" && error !== null && "message" in error) {
    rawMessage = String((error as { message: unknown }).message);
  }

  if (!rawMessage) return fallbackMessage;

  const sensitivePatterns = [
    /at\s+[\w$./\\-]+\s+\(/i,
    /(?:ORA-\d{5}|PG::|SQLSTATE|syntax error at|SELECT .* FROM|INSERT INTO|UPDATE .* SET)/i,
    /[A-Za-z]:\\[\w.-]+\\/i,
    /\/(?:usr|var|etc|home|root|node_modules)\//i,
    /(?:GeoServer|ArcGIS|PostgreSQL|Express|Next\.js|Tomcat)\/\d+/i,
  ];

  for (const pattern of sensitivePatterns) {
    if (pattern.test(rawMessage)) {
      return fallbackMessage;
    }
  }

  return sanitizeHtml(rawMessage.trim().slice(0, 300));
}
