import mongoose from 'mongoose';
import { UserTypes } from '@gustafdahl/schoolable-common';

import { NotificationDoc } from './notification';

interface UserAttributes {
  id: string;
  sockets?: string[];
  email: string;
  lang: string;
  userType: UserTypes;
  unsubscribedFrom?: [
    {
      notification: { type: NotificationDoc; default: '' };
      types: [
        {
          type: String;
          default: '';
        },
      ];
    },
  ];
  notifications?: [
    {
      notification: {
        type: mongoose.Types.ObjectId;
        ref: 'notifications';
      };
      read: {
        type: Boolean;
        default: false;
      };
    },
  ];
  name: {
    first: string;
    last: string;
  };
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attributes: UserAttributes): UserDoc;
}

export interface UserDoc extends mongoose.Document {
  id: string;
  sockets?: string[];
  email: string;
  lang: string;
  userType: UserTypes;
  unsubscribedFrom?: [
    {
      notification: { type: NotificationDoc; default: '' };
      types: [
        {
          type: String;
          default: '';
        },
      ];
    },
  ];

  name: {
    first: string;
    last: string;
  };
}

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    sockets: [
      {
        type: String,
        default: '',
      },
    ],
    email: {
      type: String,
      required: true,
    },
    lang: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: Object.values(UserTypes),
      required: true,
    },
    /*
    unsubscribedFrom?: [
      {
        notification: { type: NotificationDoc; default: '' };
        types: [
          {
            type: String;
            default: '';
          },
        ];
      },
    ];

    */
    name: {
      first: {
        type: String,
        required: true,
      },
      last: {
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

userSchema.statics.build = (attributes: UserAttributes) => {
  // @ts-ignore
  attributes._id = attributes.id;
  // @ts-ignore
  delete attributes.id;

  return new User(attributes);
};

const User = mongoose.model<UserDoc, UserModel>('users', userSchema);

export default User;
