import { Request, Response } from 'express';
import {
  BadRequestError,
  NotAuthorizedError,
} from '@gustafdahl/schoolable-errors';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';
import { CONFIG } from '@gustafdahl/schoolable-utils';
import { DateTime } from 'luxon';

import Course from '../models/course';

import CourseQueueRemovePublisher from '../events/publishers/courseQueueRemove';
import { natsWrapper } from '../utils/natsWrapper';
import logger from '../utils/logger';

// TODO: Add logger
// TODO: Comment
const remove = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const { courseId } = req.body;
  const _lang = req.lang;
  const lang = LANG[_lang];

  const course = await Course.findById(courseId);

  if (!course) {
    throw new BadRequestError(lang.noCourse);
  }

  if (course.upForDeletion) {
    throw new BadRequestError(lang.alreadyUpForDeletion);
  }

  if (course.owner.toString() !== currentUser?.id) {
    throw new NotAuthorizedError();
  }

  course.upForDeletion = true;

  await course.save();

  if (process.env.NODE_ENV !== 'test') {
    // Publishes event to nats service
    new CourseQueueRemovePublisher(natsWrapper.client, logger).publish({
      courseId: course.id as string,
      removeAt: DateTime.now()
        .plus(CONFIG.debug ? { seconds: 5 } : { days: 30 })
        .toJSDate(),
    });

    logger.info('Sent Nats user registered event');
  }

  res.status(200).json({
    errors: false,
    message: lang.upForDeletion.replace('%name%', course.name),
    course,
  });
};

export default remove;
