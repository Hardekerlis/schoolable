/** @format */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import { ConfigHandler } from '../lib/misc/config';
ConfigHandler.loadConfig();

import { winstonTestSetup } from '../lib/misc/winston';
winstonTestSetup();

// declare global {
//   namespace NodeJS {
//     interfac  e Global {
//       getAuthCookie(): Promise<string[]>;
//     }
//   }
// }

// The tests timesout if the default timout interval is not changed
// jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf';

  // Tells mongodb memory server what version to use
  process.env.MONGOMS_DOWNLOAD_URL =
    'https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu1804-4.2.8.tgz';
  process.env.MONGOMS_VERSION = '4.2.8';

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(
    mongoUri,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    (err) => {
      if (err) throw console.error(err);
    },
  );
});

// Removes all items from the database before each test
// mongoose.connection.db is undefined
// TODO
// Clear database collections beforeEach
beforeEach(async () => {
  // console.log(mongoose.connection.db.collections());
  //
  // const collections = await mongoose.connection.db.collections();
  //
  // for (let collection of collections) {
  //   await collection.deleteMany({});
  // }
  // await mongoose.connection.collections.deleteMany({});
});

// Stops mongo after tests
afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

// global.getAuthCookie = async () => {
//   const email = 'test@test.com';
//   const password = 'password';
//
//   const res = await request(app)
//     .post('/api/users/signup')
//     .send({ email, password })
//     .expect(201);
//
//   const cookie = res.get('Set-Cookie');
//
//   return cookie;
// };
