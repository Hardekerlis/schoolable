import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import {
  NotFoundError,
  NotAuthorizedError,
  LANG,
} from '@gustafdahl/schoolable-common';

import Course from '../models/course';
import Phase from '../models/phase';
import PhaseItem from '../models/phaseItem';

import { natsWrapper } from '../utils/natsWrapper';
import logger from '../utils/logger';

import PhaseItemCreatedPublisher from '../events/publishers/phaseItemCreated';

const create = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const { name, parentPhaseId, parentCourseId } = req.body;
  const _lang = req.lang;
  const lang = LANG[_lang];

  logger.info('Creating phase item');

  if (!isValidObjectId(parentPhaseId)) {
    logger.debug('Phase id is not a valid ObjectId');
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

  logger.debug('Looking up parent phase');
  const phase = await Phase.findById(parentPhaseId);

  if (!phase) {
    logger.debug('No parent phase found');
    throw new NotFoundError();
  }
  logger.debug('Found phase');

  logger.debug('Building phase item');
  const phaseItem = PhaseItem.build({
    name,
    parentCourseId: parentCourseId,
    parentPhaseId: parentPhaseId,
  });

  logger.debug('Saving phase item');
  await phaseItem.save();

  if (process.env.NODE_ENV !== 'test') {
    // Publishes event to nats service
    new PhaseItemCreatedPublisher(natsWrapper.client, logger).publish({
      parentCourseId: course.id as string,
      parentPhaseId: phase.id,
      phaseItemId: phaseItem.id,
      name,
    });

    logger.info('Sent Nats phase item created event');
  }

  logger.info('Created phase item. Returning to user');

  res.status(201).json({
    errors: false,
    message: lang.createdPhaseItem,
    phaseItem,
  });
};

export default create;
