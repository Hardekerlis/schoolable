/** @format */

import mongoose from 'mongoose';
import { CONFIG } from './config';

export async function connectToMongo() {
  await mongoose.connect(
    `mongodb://${CONFIG.database.uri}:${CONFIG.database.port}/${CONFIG.database.name}`,
  );
}
