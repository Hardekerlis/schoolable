/** @format */

import mongoose from 'mongoose';

interface FileAttributes {
  ext: string; // File extension
  mimeType: string; // Mime type
  owner: string; // Owner of the file
  size: number; // File size
  path: string; // Path to file
  access: string[]; // Who can access this file
}

interface FileModel extends mongoose.Model<FileDoc> {
  build(attributes: FileAttributes): FileDoc;
}

export interface FileDoc extends mongoose.Document {
  ext: string; // File extension
  mimeType: string; // Mime type
  owner: string; // Owner of the file
  size: number; // File size
  path: string; // Path to file
  access: string[]; // Who can access this file
}

const fileSchema = new mongoose.Schema(
  {
    ext: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    size: {
      type: Number,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    access: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
      },
    ],
  },
  {
    toObject: {
      transform: (doc, ret) => {
        ret.id = ret._id;

        delete ret._id;
        delete ret.__v;
      },
    },
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;

        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

fileSchema.statics.build = (attributes: FileAttributes) => {
  return new File(attributes);
};

const File = mongoose.model<FileDoc, FileModel>('files', fileSchema);

export default File;
