import mongoose from 'mongoose';

interface PhaseItemAttributes {
  id: string;
  name: string;
  parentCourseId: string;
  parentPhaseId: string;
}

interface PhaseItemModel extends mongoose.Model<PhaseItemDoc> {
  build(attributes: PhaseItemAttributes): PhaseItemDoc;
}

export interface PhaseItemDoc extends mongoose.Document {
  id: string;
  name: string;
  parentCourseId: string;
  parentPhaseId: string;
}

const phaseItemSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    parentCourseId: {
      type: String,
      required: true,
    },
    parentPhaseId: {
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
  // @ts-ignore
  attributes._id = attributes.id;
  // @ts-ignore
  delete attributes.id;

  return new PhaseItem(attributes);
};

const PhaseItem = mongoose.model<PhaseItemDoc, PhaseItemModel>(
  'phaseItems',
  phaseItemSchema,
);

export default PhaseItem;
