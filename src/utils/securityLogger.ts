export type SecurityAction =
  | "AUTH_LOGIN_SUCCESS"
  | "AUTH_LOGIN_FAILURE"
  | "AUTH_LOGOUT"
  | "AUTH_SESSION_INACTIVITY_TIMEOUT"
  | "ACCESS_CONTROL_FAILURE"
  | "FEATURE_CREATE"
  | "FEATURE_EDIT"
  | "FEATURE_DELETE"
  | "DATA_EXPORT"
  | "INPUT_VALIDATION_FAILURE"
  | "CONFIGURATION_CHANGE";

export type SecurityResult = "SUCCESS" | "FAILURE" | "DENIED";

export interface SecurityEventData {
  action: SecurityAction;
  result: SecurityResult;
  userId?: string | null;
  object?: string;
  details?: Record<string, unknown>;
}

export interface StructuredSecurityLog {
  timestamp: string;
  action: SecurityAction;
  result: SecurityResult;
  userId: string;
  object: string;
  details?: Record<string, unknown>;
}

function sanitizeLogDetails(details?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!details) return undefined;
  const sanitized: Record<string, unknown> = {};

  const sensitiveKeys = [
    "password",
    "token",
    "jwttoken",
    "accesstoken",
    "refreshtoken",
    "authorization",
    "secret",
    "apikey",
    "key",
  ];

  for (const [k, v] of Object.entries(details)) {
    const lowerKey = k.toLowerCase();
    if (sensitiveKeys.some((s) => lowerKey.includes(s))) {
      sanitized[k] = "[REDACTED]";
    } else if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      sanitized[k] = sanitizeLogDetails(v as Record<string, unknown>);
    } else {
      sanitized[k] = v;
    }
  }

  return sanitized;
}

export function logSecurityEvent(event: SecurityEventData): StructuredSecurityLog {
  const logEntry: StructuredSecurityLog = {
    timestamp: new Date().toISOString(),
    action: event.action,
    result: event.result,
    userId: event.userId || "anonymous",
    object: event.object || "N/A",
    details: sanitizeLogDetails(event.details),
  };

  if (process.env.NODE_ENV !== "test") {
    const jsonString = JSON.stringify(logEntry);
    if (event.result === "FAILURE" || event.result === "DENIED") {
      console.warn(`[AUDIT] ${jsonString}`);
    } else {
      console.info(`[AUDIT] ${jsonString}`);
    }
  }

  return logEntry;
}
