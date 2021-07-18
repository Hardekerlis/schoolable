/** @format */

import mongoose from 'mongoose';
import { Password } from '@schoolable/common';

interface AdminAttributes {
  email: string;
  name: string;
  password: string;
  verified: boolean;
}

interface AdminModel extends mongoose.Model<AdminDoc> {
  build(attributes: AdminAttributes): AdminDoc;
}

interface AdminDoc extends mongoose.Document {
  email: string;
  name: string;
  password: string;
  verified: boolean;
}

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      required: true,
    },
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;

        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

adminSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }

  done();
});

adminSchema.statics.build = (attributes: AdminAttributes) => {
  return new Admin(attributes);
};

const Admin = mongoose.model<AdminDoc, AdminModel>('admins', adminSchema);

export default Admin;
