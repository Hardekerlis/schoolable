/** @format */

import mongoose from 'mongoose';
import { CONFIG } from '@schoolable/common';

export async function connect() {
  await mongoose.connect(
    `mongodb://${CONFIG.database.url}:${CONFIG.database.port}/${CONFIG.database.name}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    },
  );
}
