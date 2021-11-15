import mongoose from 'mongoose';

import { ModuleDoc } from './module';

interface PhaseAttributes {
  id: string;
  name: string;
  parentModule: ModuleDoc;
}

interface PhaseModel extends mongoose.Model<PhaseDoc> {
  build(attributes: PhaseAttributes): PhaseDoc;
}

export interface PhaseDoc extends mongoose.Document {
  id: string;
  name: string;
  parentModule: ModuleDoc;
}

const phaseSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    parentModule: {
      type: mongoose.Types.ObjectId,
      ref: 'modules',
      required: true,
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
  // @ts-ignore
  attributes._id = attributes.id;
  // @ts-ignore
  delete attributes.id;

  return new Phase(attributes);
};

const Phase = mongoose.model<PhaseDoc, PhaseModel>('phases', phaseSchema);

export default Phase;
