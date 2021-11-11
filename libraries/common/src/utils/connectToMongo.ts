import mongoose from 'mongoose';

export async function connectToMongo(url: string) {
  await mongoose.connect(url);
}
