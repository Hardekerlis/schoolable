/** @format */

import mongoose from 'mongoose';

import { PhaseItemDoc } from './phaseItem';

interface PhaseAttributes {
  name: string;
  phaseItems: PhaseItemDoc[];
  description: string;
  locked: boolean; // Is the phase locked but visible to students
  unlockOn: Date; // What date should the phase be unlocked
  hidden: boolean; // Is the phase visible to students
  visibleOn: Date; // What date shoukd the phase be visible
  lockOn: Date; // When should the phase be locked
  upForDeletion?: Date;
}

interface PhaseModel extends mongoose.Model<PhaseDoc> {
  build(attributes: PhaseAttributes): PhaseDoc;
}

export interface PhaseDoc extends mongoose.Document {
  name: string;
  phaseItems: PhaseItemDoc[];
  description: string;
  locked: boolean; // Is the phase locked but visible to students
  unlockOn: Date; // What date should the phase be unlocked
  hidden: boolean; // Is the phase visible to students
  visibleOn: Date; // What date shoukd the phase be visible
  lockOn: Date; // When should the phase be locked
  upForDeletion?: Date;
}

const phaseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phaseItem: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'phaseItems',
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
    unlockedOn: {
      type: Date,
      default: +new Date(),
    },
    hidden: {
      type: Boolean,
      default: true,
    },
    visibleOn: {
      type: Date,
      default: +new Date(),
    },
    lockOn: Date,
    upForDeletion: Date,
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
