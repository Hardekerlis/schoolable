import { Request, Response } from 'express';
import {
  BadRequestError,
  NotAuthorizedError,
  UserTypes,
  LANG,
} from '@gustafdahl/schoolable-common';
import mongoose from 'mongoose';

import Module from '../models/module';
import Course from '../models/course';

import logger from '../utils/logger';

export const fetchMany = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const { parentCourseId } = req.body;
  const _lang = req.lang;
  const lang = LANG[_lang];

  // TODO: Might need to set limit to fetch modules.
  if (!currentUser) throw new NotAuthorizedError();

  logger.info('Fetching course modules');

  if (!mongoose.isValidObjectId(parentCourseId)) {
    logger.warn('Parent course value is not a valid object id');
    throw new BadRequestError(lang.badIds);
  }

  let query: object;
  logger.debug('Determining what type of query to run');
  if (currentUser.userType !== UserTypes.Admin) {
    logger.debug('User is not an admin');
    query = {
      $and: [
        { id: parentCourseId },
        {
          $or: [
            { owner: currentUser.id },
            { students: currentUser.id },
            { admins: currentUser.id },
          ],
        },
      ],
    };
  } else if (currentUser.userType === UserTypes.Admin) {
    logger.debug('User is an admin');
    query = { id: parentCourseId };
  } else {
    logger.warn('Invalid user type');
    throw new NotAuthorizedError();
  }

  logger.debug('Finding parent course');
  const course = await Course.findOne(query);

  if (!course) {
    logger.info('No course found');
    throw new NotAuthorizedError();
  }

  logger.debug('Looking up modules associated with course');
  const modules = await Module.find({
    parentCourseId: course.id,
  }).select('-moduleItems -parentCourseId -description');

  // TODO: Remove hidden modules if user is of type student

  if (!modules[0]) {
    logger.info('No modules found');
    return res.status(404).json({
      errors: false,
      message: lang.noModulesFound,
      modules: [],
    });
  }

  logger.info('Found modules. Returning to user');
  res.status(200).json({
    errors: false,
    message: lang.foundModules,
    modules,
  });
};

export const fetchOne = async (req: Request, res: Response) => {
  const { moduleId } = req.params;
  const { currentUser } = req;
  const { parentCourseId } = req.body;
  const _lang = req.lang;
  const lang = LANG[_lang];

  if (!currentUser) throw new NotAuthorizedError();

  logger.info('Fetching course module');

  if (
    !mongoose.isValidObjectId(moduleId) ||
    !mongoose.isValidObjectId(parentCourseId)
  ) {
    logger.warn('Parent course or module id value is not a valid object id');
    throw new BadRequestError(lang.badIds);
  }

  let query: object;
  logger.debug('Determining what type of query to run');
  if (currentUser.userType !== UserTypes.Admin) {
    logger.debug('User is not an admin');
    query = {
      $and: [
        { id: parentCourseId },
        {
          $or: [
            { owner: currentUser.id },
            { students: currentUser.id },
            { admins: currentUser.id },
          ],
        },
      ],
    };
  } else if (currentUser.userType === UserTypes.Admin) {
    logger.debug('User is an admin');
    query = { id: parentCourseId };
  } else {
    logger.warn('Invalid user type');
    throw new NotAuthorizedError();
  }

  logger.debug('Finding parent course');
  const course = await Course.findOne(query);

  if (!course) {
    logger.info('No course found');
    throw new NotAuthorizedError();
  }

  // TODO: Remove hidden modules from students

  logger.debug('Looking up module');
  const module = await Module.findById(moduleId);

  if (!module) {
    logger.info('No module found');
    return res.status(404).json({
      errors: false,
      message: lang.noModuleFound,
      module: undefined,
    });
  }

  logger.info('Found module. Returning to user');
  res.status(200).json({
    errors: false,
    message: lang.foundModule,
    module,
  });
};
