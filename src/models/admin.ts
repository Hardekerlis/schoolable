/** @format */

import mongoose from 'mongoose';

/*
  What does an admin need:
  permissions to everything - create middleware for this. Very secure login
  Name should be Administrater<Number>
*/

interface AdminAttrs {
  email: string;
  publicRsaKey: string;
  name: string;
}

interface AdminDoc extends mongoose.Model<AdminDoc> {
  email: string;
  publicRsaKey: string;
  name: string;
}

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    publicRsaKey: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;

        delete ret._id;
        delete ret.publicRsaKey;
        delete ret._v;
      },
    },
  },
);

adminSchema.statics.build = (attributes: AdminAttributes) => {
  return new Admin(attributes);
};

const Admin = mongoose.model<AdminDoc, AdminModel>('admins', adminSchema);

export { Admin };
