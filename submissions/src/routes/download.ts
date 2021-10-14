import { Request, Response } from 'express';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';

import File from '../models/file';

import b2 from '../utils/b2';
import logger from '../utils/logger';

const download = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const _lang = req.lang;
  const lang = LANG[_lang];
  const { fileId } = req.params;

  const fileRef = await File.findById(fileId);

  if (!fileRef) {
    return res.status(404).json({
      errors: false,
      message: lang.noFileFound,
    });
  }

  // IDEA: Add onDownloadProgress so user can see progress. Would need socket for this though
  await b2.authorize();
  const file = await b2.downloadFileById({
    fileId: fileRef.b2FileId,
    responseType: 'stream',
    onDownloadProgress: (event) => {
      console.log(event, 30);
    },
  });

  file.data.pipe(res);
};

export default download;
