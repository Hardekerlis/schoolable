import mongoose from 'mongoose';
import { UserTypes } from '@gustafdahl/schoolable-common';

interface UserAttributes {
  id: string;
  email: string;
  userType: UserTypes;
  name: {
    first: string;
    last: string;
  };
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attributes: UserAttributes): UserDoc;
}

export interface UserDoc extends mongoose.Document {
  id: string;
  email: string;
  userType: UserTypes;
  name: {
    first: string;
    last: string;
  };
}

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: Object.values(UserTypes),
      required: true,
    },
    name: {
      first: {
        type: String,
        required: true,
      },
      last: {
        type: String,
        required: true,
      },
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

userSchema.statics.build = (attributes: UserAttributes) => {
  // @ts-ignore
  attributes._id = attributes.id;
  // @ts-ignore
  delete attributes.id;

  return new User(attributes);
};

const User = mongoose.model<UserDoc, UserModel>('users', userSchema);

export default User;
