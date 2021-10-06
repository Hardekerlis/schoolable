import mongoose from 'mongoose';

interface PhaseItemAttributes {
  parentPhase: string;
  parentCourse: string;
  phaseItemId: string;
  name: string;
}

interface PhaseItemModel extends mongoose.Model<PhaseItemDoc> {
  build(attributes: PhaseItemAttributes): PhaseItemDoc;
}

export interface PhaseItemDoc extends mongoose.Document {
  parentPhase: string;
  parentCourse: string;
  phaseItemId: string;
  name: string;
}

const phaseItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phaseItemId: {
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
