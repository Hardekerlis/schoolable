/** @format */

import mongoose from 'mongoose';
import { Password } from '../utils/password';
import { UserTypes } from '@gustafdahl/schoolable-enums';

import { UserSettingsDoc } from './userSettings';

interface UserAttributes {
  email: string;
  password: string;
  name: {
    first: string;
    last: string;
  };
  userType: UserTypes;
  settings: UserSettingsDoc;
  passwordChoosen?: boolean;
  setupComplete?: boolean;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attributes: UserAttributes): UserDoc;
}

export interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  name: {
    first: string;
    last: string;
  };
  userType: UserTypes;
  settings: UserSettingsDoc;
  passwordChoosen?: boolean;
  setupComplete?: boolean;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    passwordChoosen: {
      type: Boolean,
      default: false,
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
    userType: {
      type: String,
      enum: Object.values(UserTypes),
      required: true,
    },
    setupComplete: {
      type: Boolean,
      default: false,
    },
    settings: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'userSettings',
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

userSchema.pre('save', async function(done) {
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