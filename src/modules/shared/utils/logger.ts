const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS.indexOf(level) <= LOG_LEVELS.indexOf(currentLevel);
}

function formatLog(level: LogLevel, msg: string, context?: Record<string, unknown>) {
  const entry = {
    level,
    time: new Date().toISOString(),
    msg,
    ...(context || {}),
  };
  if (process.env.NODE_ENV === 'development') {
    const prefix = `[${level.toUpperCase()}]`;
    const suffix = context ? ` ${JSON.stringify(context)}` : '';
    console[level === 'error' || level === 'fatal' ? 'error' : level === 'warn' ? 'warn' : 'log'](`${prefix} ${msg}${suffix}`);
  } else {
    console[level === 'error' || level === 'fatal' ? 'error' : level === 'warn' ? 'warn' : 'log'](JSON.stringify(entry));
  }
}

export const logger = {
  fatal(msg: string, context?: Record<string, unknown>) {
    if (shouldLog('fatal')) formatLog('fatal', msg, context);
  },
  error(msg: string, context?: Record<string, unknown>) {
    if (shouldLog('error')) formatLog('error', msg, context);
  },
  warn(msg: string, context?: Record<string, unknown>) {
    if (shouldLog('warn')) formatLog('warn', msg, context);
  },
  info(msg: string, context?: Record<string, unknown>) {
    if (shouldLog('info')) formatLog('info', msg, context);
  },
  debug(msg: string, context?: Record<string, unknown>) {
    if (shouldLog('debug')) formatLog('debug', msg, context);
  },
  trace(msg: string, context?: Record<string, unknown>) {
    if (shouldLog('trace')) formatLog('trace', msg, context);
  },
};
