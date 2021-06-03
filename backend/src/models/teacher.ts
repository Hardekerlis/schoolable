/** @format */

// /** @format */
//
// import mongoose from 'mongoose';
//
// // An interface that describes the properties
// // that are required to create a new User
//
// interface UserAttrs {
//   email: string;
//   password: string;
// }
//
// enum AccountType {
//   Admin = 'admin',
//   Teacher = 'teacher',
//   Student = 'student',
//   Caretaker = 'caretaker',
// }
//
// // An interface that describes the properties
// // that a User Model has
// interface UserModel extends mongoose.Model<UserDoc> {
//   build(attrs: UserAttrs): UserDoc;
// }
//
// // An interface that describes the properties
// // that a User Document has
// interface UserDoc extends mongoose.Document {
//   email: string;
//   password: string;
// }
//
// const userSchema = new mongoose.Schema(
//   {
//     email: {
//       type: String,
//       required: true,
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//     name: {
//       first: {
//         type: String,
//         required: true,
//       },
//       last: {
//         type: String,
//         required: true,
//       },
//     },
//     permissions: {
//       type: Array,
//       required: true,
//     },
//     accountType: {
//       type: AccountType,
//       required: true,
//     },
//   },
//   {
//     toJSON: {
//       transform: (doc, ret) => {
//         ret.id = ret._id;
//
//         delete ret._id;
//         delete ret.password;
//         delete ret.__v;
//       },
//     },
//   },
// );
//
// // userSchema.pre('save', async function (done) {
// //   if (this.isModified('password')) {
// //     const hashed = await Password.toHash(this.get('password'));
// //     this.set('password', hashed);
// //   }
// //   done();
// // });
//
// userSchema.statics.build = (attrs: UserAttrs) => {
//   return new User(attrs);
// };
//
// const User = mongoose.model<UserDoc, UserModel>('users', userSchema);
//
// export { User };
