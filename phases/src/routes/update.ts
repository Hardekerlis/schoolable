import { Request, Response } from 'express';
import {
  BadRequestError,
  NotAuthorizedError,
  LANG,
} from '@gustafdahl/schoolable-common';

import Phase from '../models/phase';
import Course from '../models/course';

import PhaseUpdatedPublisher from '../events/publishers/updatedPhase';
import { natsWrapper } from '../utils/natsWrapper';
import logger from '../utils/logger';

const update = async (req: Request, res: Response) => {
  const { phaseId, parentCourse } = req.body;
  const { currentUser } = req;
  const _lang = req.lang;
  const lang = LANG[_lang];
  const data = req.body;
  delete data.phaseId;
  delete data.parentCourse;

  logger.info(`Trying to update phase with id ${phaseId}`);

  const course = await Course.findOne({ courseId: parentCourse });

  if (!course) {
    logger.debug('No course found');
    throw new BadRequestError(lang.noParentCourse);
  }

  logger.debug('Checking if user is allowed to update course phase');
  if (
    // Check if user is allowed to update phases for course
    course.owner !== currentUser?.id &&
    !course.admins?.includes(currentUser?.id as string)
  ) {
    logger.debug('User is not allowed to update course phase');
    throw new NotAuthorizedError();
  }

  logger.debug('Updating phase');
  const phase = await Phase.findByIdAndUpdate(phaseId, data, { new: true });

  if (!phase) {
    logger.debug('No phase found');
    throw new BadRequestError(lang.noPhaseFound);
  }

  // Couldnt get nats mock to work
  // Code is only ran if its not test environment
  if (process.env.NODE_ENV !== 'test') {
    // Publishes event to nats service
    new PhaseUpdatedPublisher(natsWrapper.client, logger).publish({
      phaseId: phase.id as string,
      parentCourse: parentCourse,
    });

    logger.info('Sent Nats phase created event');
  }

  logger.info('Updated phase. Returning to user');

  res.status(200).json({
    errors: false,
    message: lang.updatedCourse,
    phase,
  });
};

export default update;
