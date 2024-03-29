import mongoose from 'mongoose';

import { CourseDoc } from './course';
import { UserDoc } from './user';
import { GroupDoc } from './group';

interface Access {
  courses: CourseDoc[];
  users: UserDoc[];
  groups: GroupDoc[];
  public: boolean;
}

interface FileAttributes {
  owner: string; // Grader will be the course owner
  fileName: string;
  access: Access;
  b2FileId: string; // The file id in storage bucket in backblaze
  b2BucketId: string; // The id of the bucket file is stored in
  contentType: string;
  uploadTimestamp: string;
  metadata?: string[]; // Information about the file. Ex, if there is a flower in the picture a metadata tag could be "flower"
}

interface FileModel extends mongoose.Model<FileDoc> {
  build(attributes: FileAttributes): FileDoc;
}

export interface FileDoc extends mongoose.Document {
  owner: string; // Grader will be the course owner
  fileName: string;
  access: Access;
  b2FileId: string; // The file id in storage bucket in backblaze
  b2BucketId: string; // The id of the bucket file is stored in
  contentType: string;
  uploadTimestamp: string;
  metadata?: string[]; // Information about the file. Ex, if there is a flower in the picture a metadata tag could be "flower"
}

const fileSchema = new mongoose.Schema(
  {
    owner: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    access: {
      courses: [
        {
          type: mongoose.Types.ObjectId,
          ref: 'courses',
          default: '',
        },
      ],
      users: [
        {
          type: mongoose.Types.ObjectId,
          ref: 'users',
          default: '',
        },
      ],
      groups: [
        {
          type: mongoose.Types.ObjectId,
          ref: 'groups',
          default: '',
        },
      ],
      public: {
        type: Boolean,
        default: false,
      },
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
    metadata: [
      {
        type: String,
        default: '',
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
