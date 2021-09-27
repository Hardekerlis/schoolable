import mongoose from 'mongoose';

import { CourseMenuItem } from '@gustafdahl/schoolable-interfaces';
import { ActionTypes } from '@gustafdahl/schoolable-enums';

interface CoursePageAttributes {
  phases?: string[]; // Ids to phases
  menu?: CourseMenuItem[];
  description?: string;
  upForDeletion?: boolean;
}

interface CoursePageModel extends mongoose.Model<CoursePageDoc> {
  build(attributes: CoursePageAttributes): CoursePageDoc;
}

export interface CoursePageDoc extends mongoose.Document {
  phases?: string[]; // Ids to phases
  menu?: CourseMenuItem[];
  description?: string;
  upForDeletion?: boolean;
}

const coursePageSchema = new mongoose.Schema({
  phases: [
    {
      type: String,
      default: '',
    },
  ],
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
});

coursePageSchema.statics.build = (attributes: CoursePageAttributes) => {
  return new CoursePage(attributes);
};

const CoursePage = mongoose.model<CoursePageDoc, CoursePageModel>(
  'coursePages',
  coursePageSchema,
);

export default CoursePage;
