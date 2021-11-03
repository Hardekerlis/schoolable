/** @format */

import mongoose from 'mongoose';
import { UserTypes } from '@gustafdahl/schoolable-common';

import { UserSettingsDoc } from './userSettings';

interface UserAttributes {
  email: string;
  name: {
    first: string;
    last: string;
  };
  userType: UserTypes;
  settings: UserSettingsDoc;
  passwordChoosen?: boolean;
  setupComplete?: boolean;
  groups?: string[];
  deletion?: {
    isUpForDeletion: boolean; // If the course is up for deletion
    removeAt: Date; // When it is going to be deleted
  };
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attributes: UserAttributes): UserDoc;
}

export interface UserDoc extends mongoose.Document {
  email: string;
  name: {
    first: string;
    last: string;
  };
  userType: UserTypes;
  settings: UserSettingsDoc;
  passwordChoosen?: boolean;
  setupComplete?: boolean;
  groups?: string[];
  deletion?: {
    isUpForDeletion: boolean; // If the course is up for deletion
    removeAt: Date; // When it is going to be deleted
  };
}

const userSchema = new mongoose.Schema(
  {
    email: {
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
    groups: [
      {
        type: String,
        default: '',
      },
    ],
    deletion: {
      isUpForDeletion: { type: Boolean, default: false },
      removeAt: { type: Date, default: null },
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
