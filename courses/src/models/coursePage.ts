import mongoose from 'mongoose';

import { CourseMenuItem } from '@gustafdahl/schoolable-interfaces';
import { ActionTypes } from '@gustafdahl/schoolable-enums';

interface CoursePageAttributes {
  menu?: CourseMenuItem[];
  description?: string;
  upForDeletion?: boolean;
}

interface CoursePageModel extends mongoose.Model<CoursePageDoc> {
  build(attributes: CoursePageAttributes): CoursePageDoc;
}

export interface CoursePageDoc extends mongoose.Document {
  menu?: CourseMenuItem[];
  description?: string;
  upForDeletion?: boolean;
}

const coursePageSchema = new mongoose.Schema(
  {
    menu: [
      {
        icon: String,
        access: [String],
        title: String,
        value: String,
        removeable: Boolean,
        actions: [
          {
            actionType: {
              type: String,
              enum: Object.values(ActionTypes),
            },
            download: String,
            goTo: String,
            openMenu: String,
          },
        ],
      },
    ],
    description: {
      type: String,
      default: '',
    },
    upForDeletion: {
      type: Boolean,
      default: false,
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
