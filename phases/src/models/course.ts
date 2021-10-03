import mongoose from 'mongoose';

interface CourseAttributes {
  courseId: string;
  name: string;
  owner: string;
  admins?: string[];
  students?: string[];
}

interface CourseModel extends mongoose.Model<CourseDoc> {
  build(attributes: CourseAttributes): CourseDoc;
}

export interface CourseDoc extends mongoose.Document {
  courseId: string;
  name: string;
  owner: string;
  admins?: string[];
  students?: string[];
}

const courseSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
    admins: [
      {
        type: String,
        default: '',
      },
    ],
    students: [{ type: String, default: '' }],
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
