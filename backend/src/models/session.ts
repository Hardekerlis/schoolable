/** @format */

import mongoose from 'mongoose';

interface SessionAttributes {
  userId: string;
  lang: string;
  value: string;
  ip: string;
  headers: object | undefined;
  date: Date;
  location: {
    country: string;
    region: string;
    city: string;
    ll: number[] | string[];
    metro: number | string;
    area: number | string;
    timezone: string;
  };
}

interface SessionModel extends mongoose.Model<SessionDoc> {
  build(attributes: SessionAttributes): SessionDoc;
}

export interface SessionDoc extends mongoose.Document {
  userId: string;
  lang: string;
  value: string;
  ip: string;
  headers: object | undefined;
  date: Date;
  location: {
    country: string;
    region: string;
    city: string;
    ll: number[] | string[];
    metro: number | string;
    area: number | string;
    timezone: string;
  };
}

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    lang: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    headers: {
      type: Object,
      required: true,
    },
    date: {
      type: Date,
      default: +new Date(),
    },
    location: {
      country: {
        type: String,
        required: true,
      },
      region: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      ll: [
        {
          type: String,
          required: true,
        },
      ],
      metro: {
        type: String,
        required: true,
      },
      area: {
        type: String,
        required: true,
      },
      timezone: {
        type: String,
        required: true,
      },
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
