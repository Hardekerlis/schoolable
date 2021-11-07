import { Request, Response } from 'express';
import {
  BadRequestError,
  NotAuthorizedError,
  LANG,
} from '@gustafdahl/schoolable-common';

import Module from '../models/module';
import Course from '../models/course';

import ModuleCreatedPublisher from '../events/publishers/createdModule';
import { natsWrapper } from '../utils/natsWrapper';
import logger from '../utils/logger';

const create = async (req: Request, res: Response) => {
  const { name, parentCourseId } = req.body;
  const { currentUser } = req;
  const _lang = req.lang;
  const lang = LANG[_lang];

  logger.info('Starting creation of module');
  logger.debug('Looking up course');
  // Find course to make sure the module has a course to exist in
  const course = await Course.findById(parentCourseId);

  // Logger check if course exists
  if (!course) {
    logger.debug('No course found');
    throw new BadRequestError(lang.noParentCourse);
  }

  logger.debug('Checking if user is allowed to create course module');
  if (
    // Check if user is allowed to create modules for course
    course.owner !== currentUser?.id &&
    !course.admins?.includes(currentUser?.id as string)
  ) {
    logger.debug('User is not allowed to create course module');
    throw new NotAuthorizedError();
  }

  logger.debug('Building module');
  const module = Module.build({
    name,
    parentCourseId,
  });

  logger.debug('Trying to save module');
  await module.save();
  logger.debug('Saved module');

  // Publishes event to nats service
  new ModuleCreatedPublisher(natsWrapper.client, logger).publish({
    moduleId: module.id as string,
    parentCourseId: parentCourseId,
    name,
  });

  logger.verbose('Sent Nats module created event');

  logger.info('Created module');

  res.status(201).json({
    errors: false,
    message: lang.createdModule,
    module,
  });
};

export default create;
