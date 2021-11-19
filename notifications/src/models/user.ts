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
  {},
  {
    toObject: {
      transform: (doc, ret) => {
        ret.id = ret._id;

        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;

        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  },
);

userSchema.statics.build = (attributes: UserAttributes) => {
  return new User(attributes);
};

const User = mongoose.model<UserDoc, UserModel>('users', userSchema);

export default User;
