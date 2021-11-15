import mongoose from 'mongoose';

interface CourseAttributes {
  id: string;
  owner: string;
  admins?: string[];
  students?: string[];
}

interface CourseModel extends mongoose.Model<CourseDoc> {
  build(attributes: CourseAttributes): CourseDoc;
}

export interface CourseDoc extends mongoose.Document {
  id: string;
  owner: string;
  admins?: string[];
  students?: string[];
}

const courseSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Types.ObjectId,
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
    students: [
      {
        type: String,
        default: '',
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

courseSchema.statics.build = (attributes: CourseAttributes) => {
  // @ts-ignore
  attributes._id = attributes.id;
  // @ts-ignore
  delete attributes.id;

  return new Course(attributes);
};

const Course = mongoose.model<CourseDoc, CourseModel>('courses', courseSchema);

export default Course;
