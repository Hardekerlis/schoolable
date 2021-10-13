import { Request, Express } from 'express';
import { FileFilterCallback } from 'multer';
import { CONFIG } from '@gustafdahl/schoolable-utils';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';
import { BadRequestError } from '@gustafdahl/schoolable-errors';

interface FileType {
  ext: string;
  mimeType: string;
}

// Primative file filter
// Checks if file extension and file mime type is allowed and together
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  let isAllowed = false;

  for (const { mimeType, ext } of CONFIG.allowedFileTypes) {
    if (
      mimeType === file.mimetype &&
      file.originalname.toLowerCase().includes(ext)
    ) {
      isAllowed = true;
      break;
    }
  }

  if (isAllowed) {
    return cb(null, isAllowed);
  }

  cb(new BadRequestError(LANG[`${req.lang}`].notSupportedFileType));
};

export default fileFilter;
