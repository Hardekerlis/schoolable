/** @format */

import mongoose from 'mongoose';
import { Action, ActionTypes } from '../library';
import { PhaseDoc } from './phase';

export interface CourseMenuItem {
  icon?: string; // Url to image
  access: string[]; // What user(s) can see this MenuItem
  actions: Action[]; // What actions are possible for this MenuItem
  title: string;
  removeable: boolean;
}

interface CoursePageAttributes {
  phases?: PhaseDoc[];
  menu?: CourseMenuItem[];
  description?: string;
  upForDeletion?: Date;
}

interface CoursePageModel extends mongoose.Model<CoursePageDoc> {
  build(attributes: CoursePageAttributes): CoursePageDoc;
}

export interface CoursePageDoc extends mongoose.Document {
  phases?: PhaseDoc[];
  menu?: CourseMenuItem[];
  description?: string;
  upForDeletion?: Date;
}

const coursePageSchema = new mongoose.Schema(
  {
    phases: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'phases',
        default: '',
      },
    ],
    menu: [
      {
        icon: String,
        access: [String],
        title: String,
        removeable: Boolean,
        actions: {
          actionType: {
            type: String,
            enum: Object.values(ActionTypes),
          },
        },
      },
    ],
    description: {
      type: String,
      default: '',
    },
    upForDeletion: Date,
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
