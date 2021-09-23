/** @format */

import { MongoMemoryServer } from 'mongodb-memory-server';

import { CONFIG } from '@gustafdahl/schoolable-utils';

/** @format */

// declare global {
//   namespace NodeJS {
//     interface Global {
//       _MONGOINSTANCE: MongoMemoryServer;
//     }
//   }
// }

export = async function globalTeardown() {
  if (CONFIG.database.useMemoryLocal) {
    // Config to decided if an mongodb-memory-server instance should be used
    const instance: MongoMemoryServer = global._MONGOINSTANCE;
    await instance.stop();
  }
};
