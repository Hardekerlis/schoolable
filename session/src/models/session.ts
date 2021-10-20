import mongoose from 'mongoose';
import { UserTypes } from '@gustafdahl/schoolable-enums';
import { UserDoc } from './user';

interface Location {
  range: number[];
  country: string; // 2 letter ISO-3166-1 country code
  region: string; // Up to 3 alphanumeric variable length characters as ISO 3166-2 code
  // For US states this is the 2 letter state
  // For the United Kingdom this could be ENG as a country like “England
  // FIPS 10-4 subcountry code
  eu: string; // is 0 for countries outside of EU and 1 for countries inside
  timezone: string; // Timezone from IANA Time Zone Database
  city: string; // This is the full city name
  ll: number[]; // The latitude and longitude of the city
  metro: number[]; // Metro code
  area: number[]; // The approximate accuracy radius (km), around the latitude and longitude
}

interface SessionAttributes {
  user: UserDoc;
  sessionId: string;
  location: Location;
  creationTimestamp: string;
  loginId: string;
  userAgent: string;
}

interface SessionModel extends mongoose.Model<SessionDoc> {
  build(attributes: SessionAttributes): SessionDoc;
}

export interface SessionDoc extends mongoose.Document {
  user: UserDoc;
  sessionId: string;
  location: Location;
  creationTimestamp: string;
  loginId: string;
  userAgent: string;
}

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    sessionId: {
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
      range: {
        type: Number,
        required: true,
      },
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
