import { Request, Response } from 'express';
import {
  LANG,
  InvalidObjectIdError,
  DocumentNotFoundError,
} from '@gustafdahl/schoolable-common';
import { isValidObjectId } from 'mongoose';

import Course from '../models/course';
import Module from '../models/module';
import Phase from '../models/phase';

const create = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const lang = LANG[`${req.lang}`];
  const { parentCourseId, parentModuleId, name } = req.body;

  if (!isValidObjectId(parentCourseId)) {
    throw new InvalidObjectIdError(lang.noCourseFound);
  }

  if (!isValidObjectId(parentModuleId)) {
    throw new InvalidObjectIdError(lang.noModuleFound);
  }

  const course = await Course.findById(parentCourseId);

  if (!course) {
    throw new DocumentNotFoundError(lang.noCourseFound);
  }

  res.status(500).send();
};

export default create;
