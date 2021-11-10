import mongoose from 'mongoose';

interface Phase {
  name: string;
  id: string;
  hidden: boolean;
  locked: boolean;
}

interface ModuleAttributes {
  name: string;
  parentCourseId: string;
  phases?: Phase[];
  description?: string;
  locked?: boolean; // Is the module locked but visible to students
  unlockOn?: Date; // What date should the module be unlocked
  hidden?: boolean; // Is the module visible to students
  visibleOn?: Date; // What date shoukd the module be visible
  lockOn?: Date; // When should the module be locked
  deletion?: {
    isUpForDeletion: boolean;
    removeAt: Date;
  };
}

interface ModuleModel extends mongoose.Model<ModuleDoc> {
  build(attributes: ModuleAttributes): ModuleDoc;
}

export interface ModuleDoc extends mongoose.Document {
  name: string;
  parentCourseId: string;
  phases?: Phase[]; // Used to be phase item
  description?: string;
  locked?: boolean; // Is the module locked but visible to students
  unlockOn?: Date; // What date should the module be unlocked
  hidden?: boolean; // Is the module visible to students
  visibleOn?: Date; // What date shoukd the module be visible
  lockOn?: Date; // When should the module be locked
  deletion?: {
    isUpForDeletion: boolean;
    removeAt: Date;
  };
}

const moduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    parentCourseId: {
      type: String,
      required: true,
    },
    phases: [
      {
        name: String,
        _id: mongoose.Types.ObjectId,
        hidden: Boolean,
        locked: Boolean,
      },
    ],
    description: {
      type: String,
      default: '',
    },
    locked: {
      type: Boolean,
      default: true,
    },
    unlockedOn: Date,
    hidden: {
      type: Boolean,
      default: true,
    },
    visibleOn: Date,
    lockOn: Date,
    deletion: {
      isUpForDeletion: {
        type: Boolean,
        default: false,
      },
      removeAt: Date,
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

moduleSchema.statics.build = (attributes: ModuleAttributes) => {
  return new Module(attributes);
};

const Module = mongoose.model<ModuleDoc, ModuleModel>('modules', moduleSchema);

export default Module;
