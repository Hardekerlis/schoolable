import mongoose from 'mongoose';

interface ModuleAttributes {
  id: string;
  parentCourseId: string;
  name: string;
}

interface ModuleModel extends mongoose.Model<ModuleDoc> {
  build(attributes: ModuleAttributes): ModuleDoc;
}

export interface ModuleDoc extends mongoose.Document {
  id: string;
  parentCourseId: string;
  name: string;
}

const moduleSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    parentCourseId: {
      type: String,
      required: true,
    },
    name: {
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

moduleSchema.statics.build = (attributes: ModuleAttributes) => {
  // @ts-ignore
  attributes._id = attributes.id;
  // @ts-ignore
  delete attributes.id;

  return new Module(attributes);
};

const Module = mongoose.model<ModuleDoc, ModuleModel>('modules', moduleSchema);

export default Module;
