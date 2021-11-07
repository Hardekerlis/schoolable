import mongoose from 'mongoose';

enum ParagrapTypes {
  Text = 'text',
  YoutubeVideo = 'youtubeVideo',
  Image = 'image',
  Pdf = 'pdf',
}

enum DisplayType {
  Inline = 'inline',
  Block = 'block',
  InlineBlock = 'inlineBlock',
}

interface Paragraph {
  text?: string;
  type: ParagrapTypes;
  url?: string;
  height: string;
  width: string;
  display: DisplayType;
}

enum HandInTypes {
  File = 'file',
  Text = 'text',
  GoogleDrive = 'googleDrive',
}

interface PhasePageAttributes {
  paragraphs: Paragraph[];
  handInButton?: HandInTypes[];
  openedBy: string[];
  finsihedBy: string[];
}

interface PhasePageModel extends mongoose.Model<PhasePageDoc> {
  build(attributes: PhasePageAttributes): PhasePageDoc;
}

export interface PhasePageDoc extends mongoose.Document {
  paragraphs: Paragraph[];
  handInButton?: HandInTypes[];
  openedBy: string[];
  finsihedBy: string[];
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
          enum: Object.values(ParagrapTypes),
          default: ParagrapTypes.Text,
        },
      },
    ],
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
