import pino, { type LoggerOptions } from 'pino';

import { env } from '@/shared/config/env';

const loggerOptions: LoggerOptions = {
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',

  base: {
    service: 'miio-backend',
  },

  timestamp: pino.stdTimeFunctions.isoTime,
};

if (env.NODE_ENV === 'development') {
  loggerOptions.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  };
}

export const logger = pino(loggerOptions);
