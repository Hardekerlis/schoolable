import mongoose from 'mongoose';
import { CoursePageDoc } from './coursePage';

interface CourseAttributes {
  name: string; // Name of the course
  owner: string; // Teacher whom owns the course
  coursePage: CoursePageDoc; // The course page. Fetched when course is entered
  students?: string[]; // user ids - subdocuments?
  locked?: boolean; // Is the course locked but visible to students
  unlockOn?: Date; // What date should the course be unlocked
  hidden?: boolean; // Is the course visible to students
  visibleOn?: Date; // What date shoukd the course be visible
  lockOn?: Date; // When should the course be locked
  upForDeletion?: Date; // Date to remove course
}

interface CourseModel extends mongoose.Model<CourseDoc> {
  build(attributes: CourseAttributes): CourseDoc;
}

export interface CourseDoc extends mongoose.Document {
  name: string; // Name of the course
  owner: string; // Teacher whom owns the course
  coursePage: CoursePageDoc; // The course page. Fetched when course is entered
  students?: string[]; // user ids - subdocuments?
  locked?: boolean; // Is the course locked but visible to students
  unlockOn?: Date; // What date should the course be unlocked
  hidden?: boolean; // Is the course visible to students
  visibleOn?: Date; // What date shoukd the course be visible
  lockOn?: Date; // When should the course be locked
  upForDeletion?: Date; // Date to remove course
}

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    students: [
      {
        type: String,
        default: '',
      },
    ],
    owner: {
      type: String,
      required: true,
    },
    coursePage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'coursePages',
    },
    locked: {
      type: Boolean,
      default: true,
    },
    unlockedOn: {
      type: Date,
      default: +new Date(),
    },
    hidden: {
      type: Boolean,
      default: true,
    },
    visibleOn: {
      type: Date,
      default: +new Date(),
    },
    lockOn: Date,
    upForDeletion: { type: Boolean, default: false },
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

courseSchema.statics.build = (attributes: CourseAttributes) => {
  return new Course(attributes);
};

const Course = mongoose.model<CourseDoc, CourseModel>('courses', courseSchema);

export default Course;
