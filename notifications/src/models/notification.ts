import mongoose from 'mongoose';

interface NotificationAttributes {
  index: number;
  muteable: boolean;
  category: {
    main: string;
    secondary: string;
    sub: string;
  };
  title: object;
  body: object;
}

interface NotificationModel extends mongoose.Model<NotificationDoc> {
  build(attributes: NotificationAttributes): NotificationDoc;
}

export interface NotificationDoc extends mongoose.Document {
  index: number;
  muteable: boolean;
  category: {
    main: string;
    secondary: string;
    sub: string;
  };
  title: object;
  body: object;
}

const notificationSchema = new mongoose.Schema(
  {
    index: {
      type: Number,
      required: true,
    },
    muteable: {
      type: Boolean,
      required: true,
    },
    category: {
      main: {
        type: String,
        required: true,
      },
      secondary: {
        type: String,
        required: true,
      },
      sub: {
        type: String,
        required: true,
      },
    },
    title: {
      type: Object,
      required: true,
    },
    body: {
      type: Object,
      required: true,
    },
  },
  {
    toObject: {
      transform: (doc, ret) => {
        delete ret.__v;
      },
    },
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
      },
    },
  },
);

notificationSchema.statics.build = (attributes: NotificationAttributes) => {
  // @ts-ignore
  attributes._id = attributes.id;
  // @ts-ignore
  delete attributes.id;

  return new Notification(attributes);
};

const Notification = mongoose.model<NotificationDoc, NotificationModel>(
  'notifications',
  notificationSchema,
);

export default Notification;
