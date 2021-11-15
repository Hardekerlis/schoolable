import mongoose from 'mongoose';

import { PhaseDoc } from './phase';

export interface Comment {
  text: string;
  indexes: {
    start: string;
    end: string;
  };
}

interface FileAttributes {
  fileName: string;
  b2FileId: string; // The file id in storage bucket in backblaze
  b2BucketId: string; // The id of the bucket file is stored in
  contentType: string;
  uploadTimestamp: string;
  phase: PhaseDoc;
  uploader: string;
  comments?: Comment[];
}

interface FileModel extends mongoose.Model<FileDoc> {
  build(attributes: FileAttributes): FileDoc;
}

export interface FileDoc extends mongoose.Document {
  fileName: string;
  b2FileId: string; // The file id in storage bucket in backblaze
  b2BucketId: string; // The id of the bucket file is stored in
  contentType: string;
  uploadTimestamp: string;
  phase: PhaseDoc;
  uploader: string;
  comments?: Comment[];
}

const fileSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    b2FileId: {
      type: String,
      required: true,
    },
    b2BucketId: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    uploadTimestamp: {
      type: String,
      required: true,
    },
    phase: {
      type: mongoose.Types.ObjectId,
      ref: 'phases',
      required: true,
    },
    uploader: {
      type: String,
      required: true,
    },
    comments: [
      {
        text: String,
        indexes: {
          start: String,
          end: String,
        },
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
  // @ts-ignore
  attributes._id = attributes.id;
  // @ts-ignore
  delete attributes.id;

  return new File(attributes);
};

const File = mongoose.model<FileDoc, FileModel>('files', fileSchema);

export default File;
