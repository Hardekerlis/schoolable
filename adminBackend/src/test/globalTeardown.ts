/** @format */

import mongoose from 'mongoose';

export = async function globalTeardown() {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
};
