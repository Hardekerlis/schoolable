import { Request, Response } from 'express';
import {
  BadRequestError,
  NotAuthorizedError,
  LANG,
  CONFIG,
} from '@gustafdahl/schoolable-common';
import { DateTime } from 'luxon';

import Course from '../models/course';
import User from '../models/user';

import CourseQueueRemovePublisher from '../events/publishers/courseQueueRemove';
import { natsWrapper } from '../utils/natsWrapper';
import logger from '../utils/logger';

/*
This function queues courses for deletion. It sends out a NATS event telling
removeQueue service to queue course for deletion
*/
const remove = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const { courseId } = req.body;
  const _lang = req.lang;
  const lang = LANG[_lang];

  logger.info(`Starting removal of course with id ${courseId}`);

  logger.debug('Looking up user');
  const user = await User.findOne({ userId: currentUser!.id });

  if (!user) {
    logger.debug('No user found');
    throw new NotAuthorizedError();
  }

  logger.debug('Looking up course');
  const course = await Course.findById(courseId);

  if (!course) {
    logger.debug('No course found');
    throw new BadRequestError(lang.noCourse);
  }

  if (course.deletion?.isUpForDeletion) {
    logger.debug('Course is already up for deletion');
    throw new BadRequestError(lang.alreadyUpForDeletion);
  }

  if (course.owner.toString() !== user?.id) {
    logger.debug("User doesn't own course and therefor can't remove it");
    throw new NotAuthorizedError();
  }

  const removeAt = DateTime.now()
    .plus(CONFIG.debug ? { seconds: 5 } : { days: 30 })
    .toJSDate();

  logger.debug('Marking course as up for deletion');
  course.deletion = {
    isUpForDeletion: true,
    removeAt,
  };

  logger.debug('Locking and hiding course');
  course.locked = true;
  course.hidden = true;

  logger.debug('Trying to save course');
  await course.save();

  if (process.env.NODE_ENV !== 'test') {
    // Publishes event to nats service
    new CourseQueueRemovePublisher(natsWrapper.client, logger).publish({
      courseId: course.id as string,
      removeAt: removeAt,
    });

    logger.info('Sent Nats course queue remove event');
  }

  logger.info('Successfully marked course for deletion');

  res.status(200).json({
    errors: false,
    message: lang.upForDeletion.replace('%name%', course.name),
    course,
  });
};

export default remove;
