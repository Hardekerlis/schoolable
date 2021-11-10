import mongoose from 'mongoose';

import { PhasePageDoc } from './phasePage';
import { CourseDoc } from './course';
import { ModuleDoc } from './module';

interface PhaseAttributes {
  name: string;
  description?: string;

  page: PhasePageDoc;

  locked?: boolean; // Is the phase locked but visible to students
  unlockOn?: Date; // What date should the phase be unlocked
  lockOn?: Date; // When should the phase be locked

  hidden?: boolean; // Is the phase visible to students
  visibleOn?: Date; // What date shoukd the phase be visible
  parentModule: ModuleDoc;

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
  description?: string;

  page: PhasePageDoc;

  locked?: boolean; // Is the phase locked but visible to students
  unlockOn?: Date; // What date should the phase be unlocked
  lockOn?: Date; // When should the phase be locked

  hidden?: boolean; // Is the phase visible to students
  visibleOn?: Date; // What date shoukd the phase be visible
  parentModule: ModuleDoc;

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
    description: {
      type: String,
      default: '',
    },
    page: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'phasePages',
      required: true,
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
    parentModule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'modules',
      required: true,
    },
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

phaseSchema.statics.build = (attributes: PhaseAttributes) => {
  return new Phase(attributes);
};

const Phase = mongoose.model<PhaseDoc, PhaseModel>('phases', phaseSchema);

export default Phase;
