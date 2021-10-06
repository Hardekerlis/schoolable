import { Request } from 'express';
import { CONFIG } from '@gustafdahl/schoolable-utils';

interface FileType {
  ext: string;
  mimeType: string;
}

interface File {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
}

// Primative file filter
// Checks if file extension and file mime type is allowed and together
const fileFilter = (req: Request, file: File, cb: Function) => {
  let isAllowed = false;

  for (const { mimeType, ext } of CONFIG.allowedFileTypes) {
    if (mimeType === file.mimetype && file.originalname.includes(ext)) {
      isAllowed = true;
      break;
    }
  }

  cb(null, isAllowed);
};

export default fileFilter;
