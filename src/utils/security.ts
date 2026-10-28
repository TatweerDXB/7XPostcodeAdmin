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

/**
 * Decodes HTML entities (e.g. &quot;, &amp;, &#x2F;, &#39;, &lt;, &gt;)
 * to their plain text representation. Handles multiple levels of encoding (e.g. &amp;quot; -> &quot; -> ").
 */
export function decodeHtmlEntities(str: string): string {
  if (!str || typeof str !== "string") return "";
  let current = str;
  for (let i = 0; i < 3; i++) {
    const next = current
      .replace(/&amp;/gi, "&")
      .replace(/(?:^|[^\w&])amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/(?:^|[^\w&])quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&apos;/gi, "'")
      .replace(/&#x2F;/gi, "/")
      .replace(/&#47;/gi, "/")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">");
    if (next === current) break;
    current = next;
  }
  return current;
}

export function sanitizeErrorMessage(
  error: unknown,
  fallbackMessage: string = "An unexpected error occurred. Please try again."
): string {
  if (!error) return fallbackMessage;

  let rawMessage = "";
  let statusCode: number | undefined;

  if (typeof error === "string") {
    rawMessage = error;
  } else if (error instanceof Error) {
    rawMessage = error.message;
    if ("status" in error && typeof (error as { status: unknown }).status === "number") {
      statusCode = (error as { status: number }).status;
    }
  } else if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, unknown>;
    if (typeof errObj.status === "number") {
      statusCode = errObj.status;
    }
    if (typeof errObj.detail === "string") {
      rawMessage = errObj.detail;
    } else if (typeof errObj.message === "string") {
      rawMessage = errObj.message;
    } else if (typeof errObj.errorMessage === "string") {
      rawMessage = errObj.errorMessage;
    } else if (typeof errObj.title === "string") {
      rawMessage = errObj.title;
    } else if (typeof errObj.error === "string") {
      rawMessage = errObj.error;
    } else {
      try {
        rawMessage = JSON.stringify(error);
      } catch {
        rawMessage = String(error);
      }
    }
  }

  if (!rawMessage || typeof rawMessage !== "string") return fallbackMessage;

  // 1. Unescape any previously HTML-encoded entities
  let cleaned = decodeHtmlEntities(rawMessage.trim());

  // 2. Strip prefix "Error: " if present
  if (/^Error:\s*/i.test(cleaned)) {
    cleaned = cleaned.replace(/^Error:\s*/i, "").trim();
  }

  // 3. Detect and parse stringified JSON (RFC 9110 / RFC 7807 ProblemDetails or custom API error)
  if ((cleaned.startsWith("{") && cleaned.endsWith("}")) || (cleaned.startsWith("[") && cleaned.endsWith("]"))) {
    try {
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed === "object") {
        if (typeof parsed.status === "number") {
          statusCode = parsed.status;
        }

        if (parsed.detail && typeof parsed.detail === "string" && !parsed.detail.includes("http")) {
          cleaned = parsed.detail;
        } else if (parsed.message && typeof parsed.message === "string" && !parsed.message.includes("http")) {
          cleaned = parsed.message;
        } else if (parsed.errorMessage && typeof parsed.errorMessage === "string") {
          cleaned = parsed.errorMessage;
        } else if (parsed.errors && typeof parsed.errors === "object") {
          const vals = Object.values(parsed.errors as Record<string, unknown>).flat();
          if (vals.length > 0 && typeof vals[0] === "string") {
            cleaned = vals[0];
          } else {
            cleaned = parsed.title || fallbackMessage;
          }
        } else if (parsed.title && typeof parsed.title === "string" && !parsed.title.includes("http")) {
          cleaned = parsed.title;
        } else {
          cleaned = fallbackMessage;
        }
      }
    } catch {
      // not valid JSON, proceed with cleaned
    }
  }

  // 4. Handle 401 Unauthorized / RFC 9110 Section 15.5.2 cleanly
  const lowerCleaned = cleaned.toLowerCase();
  if (
    statusCode === 401 ||
    lowerCleaned.includes("unauthorized") ||
    lowerCleaned.includes("rfc9110#section-15.5.2") ||
    lowerCleaned.includes("rfc7807") ||
    lowerCleaned.includes('"status":401') ||
    lowerCleaned.includes('"status": 401')
  ) {
    return "Invalid credentials or your session has expired. Please log in again.";
  }

  // 5. Redact sensitive patterns (stack traces, SQL errors, local paths)
  const sensitivePatterns = [
    /at\s+[\w$./\\-]+\s+\(/i,
    /(?:ORA-\d{5}|PG::|SQLSTATE|syntax error at|SELECT .* FROM|INSERT INTO|UPDATE .* SET)/i,
    /[A-Za-z]:\\[\w.-]+\\/i,
    /\/(?:usr|var|etc|home|root|node_modules)\//i,
    /(?:GeoServer|ArcGIS|PostgreSQL|Express|Next\.js|Tomcat)\/\d+/i,
  ];

  for (const pattern of sensitivePatterns) {
    if (pattern.test(cleaned)) {
      return fallbackMessage;
    }
  }

  // 6. Strip HTML tags (e.g. <script>, <div>) without converting to HTML entities
  cleaned = cleaned.replace(/<[^>]*>/g, "").trim();

  // 7. If the string is still empty or looks like raw code/json, return fallback
  if (!cleaned || cleaned.startsWith("{") || cleaned.startsWith("[")) {
    return fallbackMessage;
  }

  return cleaned.slice(0, 300);
}
