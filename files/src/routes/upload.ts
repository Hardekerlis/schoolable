import { Request, Response, Express } from 'express';
import { BadRequestError, LANG } from '@gustafdahl/schoolable-common';

import logger from '../utils/logger';

import File, { AccessTypes } from '../models/file';
import Course from '../models/course';

const upload = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const lang = LANG[`${req.lang}`];
  const data = req.body;
  let { accessIds } = data;
  const { accessType } = data;

  try {
    accessIds = JSON.parse(accessIds);
  } catch (err) {
    throw new BadRequestError(lang.invalidJson);
  }

  // @ts-ignore
  if (!(req.file as Express.Multer.File)) {
    logger.debug('No files found in request');
    throw new BadRequestError(lang.noAcceptedFile);
  }

  if (accessType === AccessTypes.Course) {
    const course = await Course.findById(accessIds[0]);

    if (!course) {
      return res.status(404).json({
        errors: false,
        message: lang.noCourseFound,
      });
    }
  }

  res.status(405).send();
};

export default upload;
