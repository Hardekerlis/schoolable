/** @format */

import mongoose from 'mongoose';

interface UserSettingsAttributes {
  theme: string;
  language: string;
  notifications: string[];
}

interface UserSettingsModel extends mongoose.Model<UserSettingsDoc> {
  build(attributes: UserSettingsAttributes): UserSettingsDoc;
}

export interface UserSettingsDoc extends mongoose.Document {
  theme: string;
  language: string;
  notifications: string[];
}

const userSettingsSchema = new mongoose.Schema(
  {
    theme: {
      type: String,
      default: 'dark',
    },
    language: {
      type: String,
      default: 'ENG',
    },
    notifications: [
      {
        type: String,
        // required: true,
        default: '',
      },
    ],
  },
  {
    toObject: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();

        delete ret._id;
        delete ret.__v;
      },
    },
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();

        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

userSettingsSchema.statics.build = (attributes: UserSettingsAttributes) => {
  return new UserSettings(attributes);
};

const UserSettings = mongoose.model<UserSettingsDoc, UserSettingsModel>(
  'userSettings',
  userSettingsSchema,
);

export default UserSettings;
