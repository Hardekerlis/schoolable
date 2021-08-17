/** @format */

import mongoose from 'mongoose';

interface Paragraph {}

interface PhaseItemAttributes {
  paragraphs: string[];
  upForDeletion?: Date;
}

interface PhaseItemModel extends mongoose.Model<PhaseItemDoc> {
  build(attributes: PhaseItemAttributes): PhaseItemDoc;
}

export interface PhaseItemDoc extends mongoose.Document {
  paragraphs: string[];
  upForDeletion?: Date;
}

const phaseItemSchema = new mongoose.Schema(
  {
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

phaseItemSchema.statics.build = (attributes: PhaseItemAttributes) => {
  return new PhaseItem(attributes);
};

const PhaseItem = mongoose.model<PhaseItemDoc, PhaseItemModel>(
  'phaseItems',
  phaseItemSchema,
);

export default PhaseItem;
