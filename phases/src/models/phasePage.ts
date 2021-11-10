import mongoose from 'mongoose';
import { ParagraphTypes, HandInTypes } from '@gustafdahl/schoolable-common';

enum DisplayType {
  Inline = 'inline',
  Block = 'block',
  InlineBlock = 'inlineBlock',
}

interface Paragraph {
  text?: string;
  type: ParagraphTypes;
  url?: string;
  height: string;
  width: string;
  display: DisplayType;
}

interface Extension {
  userId: string;
  due: Date;
  note: string;
}

interface PhasePageAttributes {
  paragraphs?: Paragraph[];
  handInTypes?: HandInTypes[];
  due?: Date;
  extentions?: Extension[];
  openedBy?: string[];
  finsihedBy?: string[];
}

interface PhasePageModel extends mongoose.Model<PhasePageDoc> {
  build(attributes: PhasePageAttributes): PhasePageDoc;
}

export interface PhasePageDoc extends mongoose.Document {
  paragraphs?: Paragraph[];
  handInTypes?: HandInTypes[];
  due?: Date;
  extentions?: Extension[];
  openedBy?: string[];
  finsihedBy?: string[];
}

const phasePageSchema = new mongoose.Schema(
  {
    paragraps: [
      {
        text: {
          type: String,
          default: '',
        },
        type: {
          type: String,
          enum: Object.values(ParagraphTypes),
          default: ParagraphTypes.Text,
        },
        url: {
          type: String,
          default: '',
        },
        height: {
          // This is in pixels
          type: String,
          default: '200',
        },
        width: {
          // This is in pixels
          type: String,
          default: '200',
        },
        display: {
          type: String,
          enum: Object.values(DisplayType),
          default: DisplayType.Block,
        },
      },
    ],
    handInTypes: [
      {
        type: String,
        enum: Object.values(HandInTypes),
      },
    ],
    due: Date,
    extentions: [
      {
        userId: String,
        due: Date,
        note: String,
      },
    ],
    openedBy: [
      {
        type: String,
        default: '',
      },
    ],
    finishedBy: [
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

phasePageSchema.statics.build = (attributes: PhasePageAttributes) => {
  return new PhasePage(attributes);
};

const PhasePage = mongoose.model<PhasePageDoc, PhasePageModel>(
  'phasePages',
  phasePageSchema,
);

export default PhasePage;
