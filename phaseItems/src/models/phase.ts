import mongoose from 'mongoose';

interface PhaseAttributes {
  name: string;
  parentCourseId: string;
  parentModuleId: string;
  paragraphs?: string[];
  locked?: boolean;
  unlockOn?: Date;
  hidden?: boolean;
  visibleOn?: Date;
  lockOn?: Date; // When should the phase be locked
  deletion?: {
    isUpForDeletion: boolean;
    removeAt: Date;
  };
}

interface PhaseModel extends mongoose.Model<PhaseDoc> {
  build(attributes: PhaseAttributes): PhaseDoc;
}

export interface PhaseDoc extends mongoose.Document {
  name: string;
  parentCourseId: string;
  parentModuleId: string;
  paragraphs?: string[];
  locked?: boolean;
  unlockOn?: Date;
  hidden?: boolean;
  visibleOn?: Date;
  lockOn?: Date; // When should the phase be locked
  deletion?: {
    isUpForDeletion: boolean;
    removeAt: Date;
  };
}

const phaseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    parentCourseId: {
      type: String,
      required: true,
    },
    parentModuleId: {
      type: String,
      required: true,
    },
    paragraphs: [String],
    locked: {
      type: Boolean,
      default: true,
    },
    unlockOn: Date,
    lockOn: Date,
    hidden: {
      type: Boolean,
      default: true,
    },
    visibleOn: Date,
    deletion: {
      isUpForDeletion: Boolean,
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

phaseSchema.statics.build = (attributes: PhaseAttributes) => {
  return new Phase(attributes);
};

const Phase = mongoose.model<PhaseDoc, PhaseModel>('phases', phaseSchema);

export default Phase;
