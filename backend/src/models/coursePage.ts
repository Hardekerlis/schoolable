/** @format */

import mongoose from 'mongoose';
import { PhaseDoc } from './phase';
import { CourseMenuItemDoc } from './courseMenuItem';

interface CoursePageAttributes {
  phases: PhaseDoc[];
  menu: CourseMenuItemDoc[];
  courseDescription: string;
}

interface CoursePageModel extends mongoose.Model<CoursePageDoc> {
  build(attributes: CoursePageAttributes): CoursePageDoc;
}

export interface CoursePageDoc extends mongoose.Document {
  phases: PhaseDoc[];
  menu: CourseMenuItemDoc[];
  courseDescription: string;
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
    corseDescription: {
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
