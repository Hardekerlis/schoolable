/** @format */

import mongoose from 'mongoose';

export = async function globalTeardown() {
  await mongoose.disconnect();
};
