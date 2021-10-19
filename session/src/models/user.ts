import mongoose from 'mongoose';
import { UserTypes } from '@gustafdahl/schoolable-enums';

interface UserAttributes {
  userId: string;
  name: {
    first: string;
    last: string;
  };
  userType: UserTypes;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attributes: UserAttributes): UserDoc;
}

export interface UserDoc extends mongoose.Document {
  userId: string;
  name: {
    first: string;
    last: string;
  };
  userType: UserTypes;
}

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
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
    userType: {
      type: String,
      enum: Object.values(UserTypes),
      required: true,
    },
  },
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
