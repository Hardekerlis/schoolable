/** @format */

import mongoose from 'mongoose';

interface SettingsAttributes {
  debug: boolean;
  version: string;
  isSetup: boolean;
  port: number;
  cookies: {
    signed: boolean;
  };
  logs: {
    newLogFileFrequency: string;
    maxFileSize: string;
  };
  accounts: {
    supportedTypes: {
      custom: boolean;
      google: boolean;
      microsoft: boolean;
    };
  };
  database: {
    url: string;
    port: number;
    name: string;
  };
  passwords: {
    length: { min: number; max: number };
  };
  language: string;
  emailService: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
  };
}

interface SettingsModel extends mongoose.Model<SettingsDoc> {
  build(attributes: SettingsAttributes): SettingsDoc;
}

interface SettingsDoc extends mongoose.Document {
  debug: boolean;
  version: string;
  isSetup: boolean;
  port: number;
  cookies: {
    signed: boolean;
  };
  logs: {
    newLogFileFrequency: string;
    maxFileSize: string;
  };
  accounts: {
    supportedTypes: {
      custom: boolean;
      google: boolean;
      microsoft: boolean;
    };
  };
  database: {
    url: string;
    port: number;
    name: string;
  };
  passwords: {
    length: { min: number; max: number };
  };
  language: string;
  emailService: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
  };
}

const settingsSchema = new mongoose.Schema({
  debug: {
    type: Boolean,
    default: false,
  },
  version: {
    type: String,
    required: true,
  },
  isSetup: {
    type: Boolean,
    default: false,
  },
  port: {
    type: Number,
    default: 3000,
  },
  cookies: {
    type: Object,
    required: true,
  },
  logs: {
    type: Object,
    required: true,
  },
  accounts: {
    type: Object,
    required: true,
  },
  database: {
    type: Object,
    required: true,
  },
  passwords: {
    type: Object,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  emailService: {
    type: Object,
    required: true,
  },
});

settingsSchema.statics.build = (attributes: SettingsAttributes) => {
  return new Settings(attributes);
};

const Settings = mongoose.model<SettingsDoc, SettingsModel>(
  'settings',
  settingsSchema,
);

export default Settings;
