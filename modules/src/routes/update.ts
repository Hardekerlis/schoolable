import { Request, Response } from 'express';
import {
  BadRequestError,
  NotAuthorizedError,
  LANG,
} from '@gustafdahl/schoolable-common';

import Module from '../models/module';
import Course from '../models/course';

import ModuleUpdatedPublisher from '../events/publishers/updatedModule';
import { natsWrapper } from '../utils/natsWrapper';
import logger from '../utils/logger';

const update = async (req: Request, res: Response) => {
  const { moduleId, parentCourseId } = req.body;
  const { currentUser } = req;
  const _lang = req.lang;
  const lang = LANG[_lang];
  const data = req.body;
  delete data.moduleId;
  delete data.parentCourseId;

  logger.info(`Trying to update module with id ${moduleId}`);

  const course = await Course.findById(parentCourseId);

  if (!course) {
    logger.debug('No course found');
    throw new BadRequestError(lang.noParentCourse);
  }

  logger.debug('Checking if user is allowed to update course module');
  if (
    // Check if user is allowed to update modules for course
    course.owner !== currentUser?.id &&
    !course.admins?.includes(currentUser?.id as string)
  ) {
    logger.debug('User is not allowed to update course module');
    throw new NotAuthorizedError();
  }

  logger.debug('Updating module');
  const module = await Module.findByIdAndUpdate(moduleId, data, { new: true });

  if (!module) {
    logger.debug('No module found');
    throw new BadRequestError(lang.noModuleFound);
  }

  // Publishes event to nats service
  new ModuleUpdatedPublisher(natsWrapper.client, logger).publish({
    moduleId: module.id as string,
    parentCourseId: parentCourseId,
  });

  logger.verbose('Sent Nats module created event');

  logger.info('Updated module. Returning to user');

  res.status(200).json({
    errors: false,
    message: lang.updatedCourse,
    module,
  });
};

export default update;
