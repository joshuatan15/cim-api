'use strict';

import * as log4js from 'log4js';
import * as uuid from 'uuid/v4';

log4js.configure({
  appenders: {
    log: {
      type: 'file',
      layout: {
        type: 'pattern',
        pattern: '%[[%d] [%p] %c%] - %X{messageId}/%X{referenceNumber}/%X{channelId} - %m'
      },
      filename: 'logs/lms-api.log',
    },
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%[[%d] [%p] %c%] - %X{messageId}/%X{referenceNumber}/%X{channelId} - %m',
      },
    },
  },
  categories: {
    default: {
      appenders: ['log', 'console'],
      level: 'info',
    },
    consoleLogger: {
      appenders: ['console'],
      level: 'info',
    },
  },
});

const log = log4js.getLogger('log');

exports.log = log;
exports.consoleLogger = log4js.getLogger('console');

exports.getLogger = (category: string, context?: any) => {
  const log = log4js.getLogger(category);

  // Unique message id per request
  const messageId = uuid().replace('-', '').substring(0, 6);
  log.addContext('messageId', messageId);

  // Add context to logger
  if (context) {
    // console.log(context);
    for (let k of Object.keys(context)) {
      log.addContext(k, context[k]);
    }
  }

  return log;
};
