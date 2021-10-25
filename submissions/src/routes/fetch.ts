import { Request, Response } from 'express';
import { LANG } from '@gustafdahl/schoolable-common';

import File from '../models/file';

import logger from '../utils/logger';

const fetch = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const _lang = req.lang;
  const lang = LANG[_lang];

  const { phaseItemId } = req.body;

  logger.info(`Fetching files in phase`);

  const files = await File.find({
    $and: [
      { phaseItemId },
      { $or: [{ grader: currentUser!.id }, { uploader: currentUser!.id }] },
    ],
  }).select('-b2FileId -b2BucketId -grader -uploader');

  if (!files[0]) {
    logger.info('No files found');
    return res.status(404).json({
      errors: false,
      message: lang.noFilesFound,
      files: [],
    });
  }

  logger.info('Found files returning to user');

  res.status(200).json({
    errors: false,
    message: lang.foundFiles,
    files,
  });
};

export default fetch;
