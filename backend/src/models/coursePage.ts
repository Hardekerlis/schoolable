/** @format */

import mongoose from 'mongoose';
import { Action } from '@schoolable/common';
import { PhaseDoc } from './phase';

export interface CourseMenuItem {
  icon: string; // Url to image
  access: string[]; // What user(s) can see this MenuItem
  actions: Action[]; // What actions are possible for this MenuItem
  dropdown: CourseMenuItem[];
}

interface CoursePageAttributes {
  phases?: PhaseDoc[];
  menu?: CourseMenuItem[];
  description?: string;
}

interface CoursePageModel extends mongoose.Model<CoursePageDoc> {
  build(attributes: CoursePageAttributes): CoursePageDoc;
}

export interface CoursePageDoc extends mongoose.Document {
  phases?: PhaseDoc[];
  menu?: CourseMenuItem[];
  description?: string;
}

const coursePageSchema = new mongoose.Schema(
  {
    phases: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'phases',
    },
    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'courseMenuItems',
    },
    description: {
      type: String,
      default: '',
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

coursePageSchema.statics.build = (attributes: CoursePageAttributes) => {
  return new CoursePage(attributes);
};

const CoursePage = mongoose.model<CoursePageDoc, CoursePageModel>(
  'coursePages',
  coursePageSchema,
);

export default CoursePage;
