export type LogLevel = "info" | "warn" | "error";

export type LogEvent = {
  timestamp: string;
  level: LogLevel;
  component: string;
  event: string;
  outcome?: string;
  duration_ms?: number;
  error_type?: string;
  correlation_id?: string;
};

export function childNameMeta(name: string): { present: boolean; length: number } {
  return { present: name.length > 0, length: name.length };
}

export function log(
  event: Omit<LogEvent, "timestamp"> & {
    timestamp?: string;
    child_name?: never;
    pin?: never;
  } & Record<string, unknown>,
): void {
  const { pin: _pin, child_name: _child, ...rest } = event as LogEvent & {
    pin?: unknown;
    child_name?: unknown;
  };
  void _pin;
  void _child;
  const row: LogEvent = {
    timestamp: event.timestamp ?? new Date().toISOString(),
    level: rest.level,
    component: rest.component,
    event: rest.event,
    outcome: rest.outcome,
    duration_ms: rest.duration_ms,
    error_type: rest.error_type,
    correlation_id: rest.correlation_id,
  };
  const extra = { ...rest } as Record<string, unknown>;
  delete extra.timestamp;
  delete extra.level;
  delete extra.component;
  delete extra.event;
  delete extra.outcome;
  delete extra.duration_ms;
  delete extra.error_type;
  delete extra.correlation_id;
  console.log(JSON.stringify({ ...row, ...extra }));
}
