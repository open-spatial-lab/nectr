import bunyan, {LogLevel} from 'bunyan';

let loggerInstance: bunyan | null = null;

interface LoggerOptions {
  level?: LogLevel;
  name?: string;
}

export default function getLogger(options?: LoggerOptions){
  if (loggerInstance === null) {
    loggerInstance = bunyan.createLogger({
      name: options?.name || 'duckdb-lambda-logger',
      level: (options?.level || process.env['LOG_LEVEL'] || 'info') as LogLevel,
    });
  }
  return loggerInstance
}