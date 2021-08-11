/** @format */

import mongoose from 'mongoose';
import { UserDoc } from './user';
import { CoursePageDoc } from './coursePage';

interface CourseAttributes {
  name: string; // Name of the course
  students: UserDoc[]; // user ids - subdocuments?
  owner: string; // Teacher whom owns the course
  coursePage: CoursePageDoc; // The course page. Fetched when course is entered
  locked: boolean; // Is the course locked but visible to students
  unlockOn: Date; // What date should the course be unlocked
  hidden: boolean; // Is the course visible to students
  visibleOn: Date; // What date shoukd the course be visible
  lockOn: Date; // When should the course be locked
}

interface CourseModel extends mongoose.Model<CourseDoc> {
  build(attributes: CourseAttributes): CourseDoc;
}

interface CourseDoc extends mongoose.Document {
  name: string; // Name of the course
  students: UserDoc[]; // user ids - subdocuments?
  owner: string; // Teacher whom owns the course
  coursePage: CoursePageDoc; // The course page. Fetched when course is entered
  locked: boolean; // Is the course locked but visible to students
  unlockOn: Date; // What date should the course be unlocked
  hidden: boolean; // Is the course visible to students
  visibleOn: Date; // What date shoukd the course be visible
  lockOn: Date; // When should the course be locked
}

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    coursePage: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'coursePages',
      },
    ],
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
