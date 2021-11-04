import { Request, Response } from 'express';
import {
  BadRequestError,
  NotAuthorizedError,
  LANG,
} from '@gustafdahl/schoolable-common';

import Phase from '../models/phase';
import Course from '../models/course';

import PhaseCreatedPublisher from '../events/publishers/createdPhase';
import { natsWrapper } from '../utils/natsWrapper';
import logger from '../utils/logger';

const create = async (req: Request, res: Response) => {
  const { name, parentCourseId } = req.body;
  const { currentUser } = req;
  const _lang = req.lang;
  const lang = LANG[_lang];

  logger.info('Starting creation of phase');
  logger.debug('Looking up course');
  // Find course to make sure the phase has a course to exist in
  const course = await Course.findById(parentCourseId);

  // Logger check if course exists
  if (!course) {
    logger.debug('No course found');
    throw new BadRequestError(lang.noParentCourse);
  }

  logger.debug('Checking if user is allowed to create course phase');
  if (
    // Check if user is allowed to create phases for course
    course.owner !== currentUser?.id &&
    !course.admins?.includes(currentUser?.id as string)
  ) {
    logger.debug('User is not allowed to create course phase');
    throw new NotAuthorizedError();
  }

  logger.debug('Building phase');
  const phase = Phase.build({
    name,
    parentCourseId,
  });

  logger.debug('Trying to save phase');
  await phase.save();
  logger.debug('Saved phase');

  // Couldnt get nats mock to work
  // Code is only ran if its not test environment
  if (process.env.NODE_ENV !== 'test') {
    // Publishes event to nats service
    new PhaseCreatedPublisher(natsWrapper.client, logger).publish({
      phaseId: phase.id as string,
      parentCourseId: parentCourseId,
      name,
    });

    logger.info('Sent Nats phase created event');
  }

  logger.info('Created phase');

  res.status(201).json({
    errors: false,
    message: lang.createdPhase,
    phase,
  });
};

export default create;
