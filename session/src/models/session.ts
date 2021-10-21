import mongoose from 'mongoose';
import { UserTypes } from '@gustafdahl/schoolable-enums';
import { Location } from '@gustafdahl/schoolable-interfaces';
import { UserDoc } from './user';

interface SessionAttributes {
  user: UserDoc;
  location: Location;
  creationTimestamp: string;
  loginId: string;
  userAgent: string;
  ip: string;
}

interface SessionModel extends mongoose.Model<SessionDoc> {
  build(attributes: SessionAttributes): SessionDoc;
}

export interface SessionDoc extends mongoose.Document {
  user: UserDoc;
  location: Location;
  creationTimestamp: string;
  loginId: string;
  userAgent: string;
  ip: string;
}

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    creationTimestamp: {
      type: String,
      required: true,
    },
    loginId: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    location: {
      range: [
        {
          type: Number,
          required: true,
        },
      ],
      country: {
        type: String,
        required: true,
      },
      region: {
        type: String,
        required: true,
      },
      eu: {
        type: String,
        required: true,
      },
      timezone: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      ll: [
        {
          type: Number,
          required: true,
        },
      ],
      metro: [
        {
          type: Number,
          required: true,
        },
      ],
      area: [
        {
          type: Number,
          required: true,
        },
      ],
    },
  },
  {
    toObject: {
      transform: (doc, ret) => {
        ret.id = ret._id;

        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;

        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  },
);

sessionSchema.statics.build = (attributes: SessionAttributes) => {
  return new Session(attributes);
};

const Session = mongoose.model<SessionDoc, SessionModel>(
  'sessions',
  sessionSchema,
);

export default Session;
