import { Request, Response } from 'express';
import {
  BadRequestError,
  NotAuthorizedError,
  LANG,
  CONFIG,
} from '@gustafdahl/schoolable-common';
import { DateTime } from 'luxon';

import Module from '../models/module';
import Course from '../models/course';

import ModuleQueueRemovePublisher from '../events/publishers/moduleQueueRemove';
import { natsWrapper } from '../utils/natsWrapper';
import logger from '../utils/logger';

const remove = async (req: Request, res: Response) => {
  const { moduleId, parentCourseId } = req.body;
  const { currentUser } = req;
  const _lang = req.lang;
  const lang = LANG[_lang];
  const data = req.body;
  delete data.moduleId;
  delete data.parentCourseId;

  logger.info(`Trying to queue module with id ${moduleId} for removal`);

  const course = await Course.findById(parentCourseId);

  if (!course) {
    logger.debug('No course found');
    throw new BadRequestError(lang.noParentCourse);
  }

  logger.debug('Checking if user is allowed to update course module');
  if (
    // Check if user is allowed to create modules for course
    course.owner !== currentUser?.id &&
    !course.admins?.includes(currentUser?.id as string)
  ) {
    logger.debug('User is not allowed to update course module');
    throw new NotAuthorizedError();
  }

  const module = await Module.findById(moduleId);

  if (!module) {
    throw new BadRequestError(lang.noModuleFound);
  }

  const removeAt = DateTime.now()
    .plus(CONFIG.debug ? { seconds: 5 } : { days: 30 })
    .toJSDate();

  module.deletion = {
    isUpForDeletion: true,
    removeAt,
  };

  module.locked = true;
  module.hidden = true;

  await module.save();

  // Publishes event to nats service
  new ModuleQueueRemovePublisher(natsWrapper.client, logger).publish({
    parentCourseId: course.id as string,
    moduleId: module.id,
    removeAt: removeAt,
  });

  logger.verbose('Sent Nats module queue remove event');

  res.status(200).json({
    errors: false,
    message: lang.upForDeletion.replace('%name%', module.name),
    module,
  });
};

export default remove;
