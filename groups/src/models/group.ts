import mongoose, { ObjectId } from 'mongoose';

interface GroupAttributes {
  name: string;
  users?: string[];
}

interface GroupModel extends mongoose.Model<GroupDoc> {
  build(attributes: GroupAttributes): GroupDoc;
}

export interface GroupDoc extends mongoose.Document {
  name: string;
  users?: string[];
}

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    users: [
      {
        type: String,
        default: '',
      },
    ],
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

groupSchema.statics.build = (attributes: GroupAttributes) => {
  return new Group(attributes);
};

const Group = mongoose.model<GroupDoc, GroupModel>('groups', groupSchema);

export default Group;
