import { Request, Response } from 'express';
import {
  NotAuthorizedError,
  LANG,
  UserTypes,
} from '@gustafdahl/schoolable-common';
import { matchedData } from 'express-validator';

import User from '../models/user';
import Course from '../models/course';
import CoursePage, { CoursePageDoc } from '../models/coursePage';
import logger from '../utils/logger';
import CourseUpdatedPublisher from '../events/publishers/courseUpdated';
import { natsWrapper } from '../utils/natsWrapper';

const update = {
  course: async (req: Request, res: Response) => {
    const { currentUser } = req;
    const lang = LANG[`${req.lang}`];
    logger.info('Attempting to update course');

    logger.debug('Getting data');
    const data = matchedData(req, { locations: ['body'] });

    const { courseId } = data;
    delete data.courseId;

    logger.debug('Looking up course');
    const course = await Course.findById(courseId);

    if (!course) {
      logger.debug('No course found');
      return res.status(404).json({
        errors: false,
        message: lang.noCourse,
      });
    }
    logger.debug('Found course');

    logger.debug('Checking if editor is an application admin');
    if (currentUser?.userType !== UserTypes.Admin) {
      logger.debug('User is not an application admin');
      logger.debug('Checking if user is authorized to edit course');
      if (
        course.owner.toString() !== currentUser?.id &&
        //@ts-ignore
        !course.admins?.includes(currentUser?.id)
      ) {
        logger.debug('User is not authorized to edit course');
        throw new NotAuthorizedError();
      }
    } else logger.debug('Editor is an application admin');

    logger.debug('Looping through keys in data object');
    for (const key in data as any) {
      logger.debug(`Updating ${key} key in course`);
      //@ts-ignore
      course[key] = data[key];
    }

    logger.debug('Saving updated course');
    await course.save();

    if (process.env.NODE_ENV !== 'test') {
      // Publishes event to nats service
      new CourseUpdatedPublisher(natsWrapper.client, logger).publish({
        name: course.name,
        courseId: course.id,
      });

      logger.verbose('Sent Nats course added admin event');
    }

    logger.info('Successfully updated course');
    res.status(200).json({
      errors: false,
      message: lang.updatedCourse,
      course,
    });
  },
  coursePage: async (req: Request, res: Response) => {
    res.status(500).send();
  },
};

export default update;
