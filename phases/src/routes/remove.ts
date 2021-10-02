import { Request, Response } from 'express';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';
import {
  BadRequestError,
  NotAuthorizedError,
} from '@gustafdahl/schoolable-errors';
import { DateTime } from 'luxon';
import { CONFIG } from '@gustafdahl/schoolable-utils';

import Phase from '../models/phase';
import Course from '../models/course';

import PhaseQueueRemovePublisher from '../events/publishers/phaseQueueRemove';
import { natsWrapper } from '../utils/natsWrapper';
import logger from '../utils/logger';

const remove = async (req: Request, res: Response) => {
  const { phaseId, parentCourse } = req.body;
  const { currentUser } = req;
  const _lang = req.lang;
  const lang = LANG[_lang];
  const data = req.body;
  delete data.phaseId;
  delete data.parentCourse;

  logger.info(`Trying to queue phase with id ${phaseId} for removal`);

  const course = await Course.findOne({ courseId: parentCourse });

  if (!course) {
    logger.debug('No course found');
    throw new BadRequestError(lang.noParentCourse);
  }

  logger.debug('Checking if user is allowed to update course phase');
  if (
    // Check if user is allowed to create phases for course
    course.owner !== currentUser?.id &&
    !course.admins?.includes(currentUser?.id as string)
  ) {
    logger.debug('User is not allowed to update course phase');
    throw new NotAuthorizedError();
  }

  const phase = await Phase.findById(phaseId);

  if (!phase) {
    throw new BadRequestError(lang.noPhaseFound);
  }

  const removeAt = DateTime.now()
    .plus(CONFIG.debug ? { seconds: 5 } : { days: 30 })
    .toJSDate();

  phase.deletion = {
    isUpForDeletion: true,
    removeAt,
  };

  phase.locked = true;
  phase.hidden = true;

  await phase.save();

  if (process.env.NODE_ENV !== 'test') {
    // Publishes event to nats service
    new PhaseQueueRemovePublisher(natsWrapper.client, logger).publish({
      parentCourse: course.id as string,
      phaseId: phase.id,
      removeAt: removeAt,
    });

    logger.info('Sent Nats phase queue remove event');
  }

  res.status(200).json({
    errors: false,
    message: lang.upForDeletion.replace('%name%', phase.name),
    phase,
  });
};

export default remove;
