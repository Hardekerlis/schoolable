import mongoose from 'mongoose';

interface PhaseAttributes {
  phaseId: string;
  parentCourse: string;
}

interface PhaseModel extends mongoose.Model<PhaseDoc> {
  build(attributes: PhaseAttributes): PhaseDoc;
}

export interface PhaseDoc extends mongoose.Document {
  phaseId: string;
  parentCourse: string;
}

const phaseSchema = new mongoose.Schema(
  {
    phaseId: {
      type: String,
      required: true,
    },
    parentCourse: {
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

phaseSchema.statics.build = (attributes: PhaseAttributes) => {
  return new Phase(attributes);
};

const Phase = mongoose.model<PhaseDoc, PhaseModel>('phases', phaseSchema);

export default Phase;
