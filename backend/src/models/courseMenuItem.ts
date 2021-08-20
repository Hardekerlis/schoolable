/** @format */

import mongoose from 'mongoose';

import { Action } from '../library';

interface CourseMenuItemAttributes extends mongoose.Model<CourseMenuItemDoc> {
  build(attributes: CourseMenuItemAttributes): CourseMenuItemDoc;
}

export interface CourseMenuItemDoc extends mongoose.Document {
  icon: string; // Url to image
  access: string[]; // What user(s) can see this MenuItem
  actions: Action[]; // What actions are possible for this MenuItem
  dropdown: CourseMenuItemAttributes[];
}

const courseMenuItemSchema = new mongoose.Schema(
  {
    icon: {
      type: String,
      required: true,
    },
    access: [{ type: String, default: [] }],
    actions: [
      {
        type: Object as unknown as Action,
        required: true,
      },
    ],
    dropdown: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courseMenuItems',
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

courseMenuItemSchema.statics.build = (attributes: CourseMenuItemAttributes) => {
  return new CourseMenuItem(attributes);
};

const CourseMenuItem = mongoose.model<
  CourseMenuItemDoc,
  CourseMenuItemAttributes
>('courseMenuItems', courseMenuItemSchema);

export default CourseMenuItem;
