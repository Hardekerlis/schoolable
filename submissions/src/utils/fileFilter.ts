import { Request } from 'express';
import { FileFilterCallback } from 'multer';
import { CONFIG, LANG, BadMimeTypeError } from '@gustafdahl/schoolable-common';

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

  if (file.originalname.includes(' ')) {
    file.originalname = file.originalname.replace(' ', '_');
  }

  if (isAllowed) {
    return cb(null, isAllowed);
  }

  cb(
    new BadMimeTypeError(
      LANG[`${req.lang}`].notSupportedFileType,
      CONFIG.allowedFileTypes,
    ),
  );
};

export default fileFilter;
