import mongoose from 'mongoose';

interface PhaseItemAttributes {
  name: string;
  parentCourse: string;
  parentPhase: string;
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

interface PhaseItemModel extends mongoose.Model<PhaseItemDoc> {
  build(attributes: PhaseItemAttributes): PhaseItemDoc;
}

export interface PhaseItemDoc extends mongoose.Document {
  name: string;
  parentCourse: string;
  parentPhase: string;
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

const phaseItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    parentCourse: {
      type: String,
      required: true,
    },
    parentPhase: {
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

phaseItemSchema.statics.build = (attributes: PhaseItemAttributes) => {
  return new PhaseItem(attributes);
};

const PhaseItem = mongoose.model<PhaseItemDoc, PhaseItemModel>(
  'phaseItems',
  phaseItemSchema,
);

export default PhaseItem;
