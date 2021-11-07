import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import {
  NotFoundError,
  NotAuthorizedError,
  LANG,
} from '@gustafdahl/schoolable-common';

import Course from '../models/course';
import Module from '../models/module';
import Phase from '../models/phase';

import { natsWrapper } from '../utils/natsWrapper';
import logger from '../utils/logger';

import PhaseCreatedPublisher from '../events/publishers/phaseCreated';

const create = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const { name, parentModuleId, parentCourseId } = req.body;
  const _lang = req.lang;
  const lang = LANG[_lang];

  logger.info('Creating phase');

  if (!isValidObjectId(parentModuleId)) {
    logger.debug('Module id is not a valid ObjectId');
    return res.status(404).json({
      errors: false,
      message: lang.noPhase,
    });
  }

  if (!isValidObjectId(parentCourseId)) {
    logger.debug('Parent course id is not a valid ObjectId');
    return res.status(404).json({
      errors: false,
      message: lang.noParentCourse,
    });
  }

  logger.debug('Looking up parent course');
  const course = await Course.findById(parentCourseId);

  if (!course) {
    logger.debug('No course found');
    throw new NotFoundError();
  }

  logger.debug('Found course');

  logger.debug('Checking if current user is course owner or course admin');
  if (
    course.owner !== currentUser?.id &&
    !course.admins?.includes(currentUser?.id as string)
  ) {
    logger.debug('User is not allowed to create resources for this course');
    throw new NotAuthorizedError();
  }
  logger.debug('User is allowed to create resources for this course');

  logger.debug('Looking up parent module');
  const module = await Module.findById(parentModuleId);

  if (!module) {
    logger.debug('No parent module found');
    throw new NotFoundError();
  }
  logger.debug('Found parent module');

  logger.debug('Building phase');
  const phase = Phase.build({
    name,
    parentCourseId: parentCourseId,
    parentModuleId: parentModuleId,
  });

  logger.debug('Saving phase');
  await phase.save();

  // Publishes event to nats service
  new PhaseCreatedPublisher(natsWrapper.client, logger).publish({
    parentCourseId: course.id as string,
    parentModuleId: phase.id,
    phaseId: phase.id,
    name,
  });

  logger.verbose('Sent Nats phase created event');

  logger.info('Created phase. Returning to user');

  res.status(201).json({
    errors: false,
    message: lang.createdPhase,
    phase,
  });
};

export default create;
