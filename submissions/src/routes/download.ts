import { Request, Response } from 'express';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';
import { NotAuthorizedError } from '@gustafdahl/schoolable-errors';

import File from '../models/file';

import b2 from '../utils/b2';
import logger from '../utils/logger';

const download = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const _lang = req.lang;
  const lang = LANG[_lang];
  const { fileId } = req.params;

  logger.info('Starting file download');

  logger.debug('Looking up file reference');
  const fileRef = await File.findById(fileId);

  if (!fileRef) {
    logger.debug('No file reference found');
    return res.status(404).json({
      errors: false,
      message: lang.noFileFound,
    });
  }

  if (
    fileRef.uploader !== currentUser?.id ||
    fileRef.grader !== currentUser?.id
  )
    throw new NotAuthorizedError();

  logger.debug('Found file reference');

  // IDEA: Add onDownloadProgress so user can see progress. Would need socket for this though
  logger.debug('Authorizing for backblaze b2');
  await b2.authorize();
  logger.debug('Authorized!');

  logger.debug('Starting download');
  const uploadStartTs = +new Date();
  const file = await b2.downloadFileById({
    fileId: fileRef.b2FileId,
    responseType: 'stream',
  });

  logger.info(`Download finished. It took ${+new Date() - uploadStartTs} ms`);

  file.data.pipe(res);
};

export default download;
