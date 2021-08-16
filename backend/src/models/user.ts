/** @format */

import mongoose from 'mongoose';
import { Password, UserTypes } from '@schoolable/common';

import { UserSettingsDoc } from './userSettings';

// Put into library
// interface Course {
//   name: string; // Name of the course
//   students: [string]; // user ids
//   phases: [string]; // phase ids
//   menuItems: [MenuItem];
// }
//
// // secnond highest in the hierarchy
// interface Phase {
//   name: string; // Name of the course phase. Tex chapter 1-3 or chapter 4-6
//   phaseItem: [PhaseItem]; // What information or homework should be in the phase
//   locked: boolean; // Is it locked for students and legal guardians?
//   visible: boolean; // Is it visible for students and legal guardians?
//   unlockOn: Date; // The date and time the phase will unlock
// }
//
// interface PhaseItem {
//   leftClick: Action; // What happens when someone leftClicks the item
//   rightClick: Action; // What happens when someone rightClicks the item
//   name: string; // Name of the information or homework. Could be a link tex
//   locked: boolean; // Is it locked for students and legal guardians?
//   visible: boolean; // Is it visible for students and legal guardians?
//   subcategory: string; // Name of subcategory. Will sort after this
//   unlockOn: Date; // The date and time the phase item will unlock
// }
//
// // What to put into menu for course - ex: homework, schedule etc
// // This is going to be supplied by us
// interface MenuItem {
//   leftClick: Action; // Choose between different actions that happens when you leftClick
//   rightClick: Action; // Choose between different actions that happens when you leftClick
//   hover: string; // Text to display when user is hovering item
//   title: string; // What the button in the navigation should say
//   icon: string; // What icon, if any, should be displayed
//   unlockOn: Date; // The date and time the menu  item will unlock
// }
//
// // What happens when a user interacts with MenuItems
// // Needs to be developed more. Should be able to basically anything
// interface Action {
//   navigateTo: CoursePage | string;
// }
//
// // Needs to be developed more. Should be like an entire html page
// interface CoursePage {
//   header: string;
// }

interface UserAttributes {
  email: string;
  password: string;
  passwordChoosen?: boolean;
  setupComplete?: boolean;
  name: string;
  userType: UserTypes;
  courses: string[]; // course ids
  settings: UserSettingsDoc;
  classes: string[];
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attributes: UserAttributes): UserDoc;
}

export interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  passwordChoosen?: boolean;
  setupComplete?: boolean;
  name: string;
  userType: UserTypes;
  courses: string[]; // course ids
  settings: UserSettingsDoc;
  classes: string[];
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    passwordChoosen: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: Object.values(UserTypes),
      required: true,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courses',
        default: [],
      },
    ],
    setupComplete: {
      type: Boolean,
      default: false,
    },
    classes: [
      {
        type: String,
        default: [],
      },
    ],
    settings: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'userSettings',
    },
  },
  {
    toObject: {
      transform: (doc, ret) => {
        ret.id = ret._id; //.toString();

        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id; //.toString();

        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  },
);

userSchema.index({
  email: 'text',
  name: 'text',
  userType: 'text',
  setupComplete: 'text',
  passwordChoosen: 'text',
  classes: 'text',
});

userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }

  done();
});

userSchema.statics.build = (attributes: UserAttributes) => {
  return new User(attributes);
};

const User = mongoose.model<UserDoc, UserModel>('users', userSchema);

export default User;
