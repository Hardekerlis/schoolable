import mongoose from 'mongoose';

import { UserDoc } from './user';

interface GroupAttributes {
  id: string;
  name: string;
  users: UserDoc[];
}

interface GroupModel extends mongoose.Model<GroupDoc> {
  build(attributes: GroupAttributes): GroupDoc;
}

export interface GroupDoc extends mongoose.Document {
  id: string;
  name: string;
  users: UserDoc[];
}

const groupSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    users: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'users',
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
  // @ts-ignore
  attributes._id = attributes.id;
  // @ts-ignore
  delete attributes.id;

  return new Group(attributes);
};

const Group = mongoose.model<GroupDoc, GroupModel>('groups', groupSchema);

export default Group;
