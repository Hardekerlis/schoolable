import mongoose from 'mongoose';
import { UserTypes } from '@gustafdahl/schoolable-common';

import Password from '../utils/password';

interface UserAttributes {
  userId: string;
  email: string;
  password: string;
  name: {
    first: string;
    last: string;
  };
  userType: UserTypes;
  lang: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attributes: UserAttributes): UserDoc;
}

export interface UserDoc extends mongoose.Document {
  userId: string;
  email: string;
  password: string;
  name: {
    first: string;
    last: string;
  };
  userType: UserTypes;
  lang: string;
}

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, requried: true },
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
    lang: {
      type: String,
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

userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }

  done();
});

userSchema.statics.build = (attributes: UserAttributes) => {
  return new User(attributes);
};

const User = mongoose.model<UserDoc, UserModel>('users', userSchema);

export default User;
