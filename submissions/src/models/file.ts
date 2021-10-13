import mongoose from 'mongoose';
import { Grades } from '@gustafdahl/schoolable-enums';

import { PhaseItemDoc } from './phaseItem';

interface FileAttributes {
  fileName: string;
  b2FileId: string; // The file id in storage bucket in backblaze
  b2BucketId: string; // The id of the bucket file is stored in
  contentType: string;
  uploadTimestamp: string;
  phaseItem: PhaseItemDoc;
  grader: string; // Grader will be the course owner
  uploader: string;
  grade?: Grades;
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
  phaseItem: PhaseItemDoc;
  grader: string; // Grader will be the course owner
  uploader: string;
  grade?: Grades;
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
    contentType: { type: String, required: true },
    uploadTimestamp: {
      type: String,
      required: true,
    },
    phaseItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'phaseItems',
      required: true,
    },
    grader: {
      type: String,
      required: true,
    },
    uploader: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      enum: Object.values(Grades),
    },
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
