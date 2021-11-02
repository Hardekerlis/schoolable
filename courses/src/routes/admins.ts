import { Request, Response } from 'express';
import {
  LANG,
  UnexpectedError,
  UserTypes,
  NotAuthorizedError,
  BadRequestError,
} from '@gustafdahl/schoolable-common';

import User from '../models/user';
import Course from '../models/course';

import logger from '../utils/logger';
import { natsWrapper } from '../utils/natsWrapper';

import CourseAddedAdminPublisher from '../events/publishers/courseAddedAdmin';

const admins = {
  add: async (req: Request, res: Response) => {
    const { currentUser } = req;
    const lang = LANG[`${req.lang}`];
    const { courseId, adminId } = req.body;

    logger.info('Attempting to add course admin');

    logger.debug('Looking up course owner');
    const owner = await User.findById(currentUser?.id);

    if (!owner) {
      logger.error('No owner found. Why is there no owner');
      throw new UnexpectedError();
    }
    logger.debug('Found owner');

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

    logger.debug('Checking if current user is an application admin');
    if (currentUser?.userType !== UserTypes.Admin) {
      logger.debug('Current user is not an application admin');
      if (course.owner.toString() !== owner.id.toString()) {
        logger.debug(
          'Current user is not authorized to make changes to course',
        );
        throw new NotAuthorizedError();
      }
    } else logger.debug('Current user is an application admin');

    logger.debug('Looking up user whom is going to be course admin');
    const courseAdmin = await User.findById(adminId);

    if (!courseAdmin) {
      logger.debug('No user found');
      return res.status(404).json({
        errors: false,
        message: lang.noUserFound,
      });
    }
    logger.debug('Found user');

    logger.debug('Checking if user already is a course admin');
    if (course.admins?.includes(courseAdmin.id)) {
      logger.debug('User is already a course admin');
      throw new BadRequestError(lang.alreadyAdmin);
    }
    logger.debug('User is not a course admin');

    logger.debug('Adding user to course admins');
    course.admins?.push(courseAdmin.id);

    logger.debug('Saving course');
    await course.save();

    // Couldnt get nats mock to work
    // Code is only ran if its not test environment
    if (process.env.NODE_ENV !== 'test') {
      // Publishes event to nats service
      new CourseAddedAdminPublisher(natsWrapper.client, logger).publish({
        adminId: courseAdmin.id,
        courseId: course.id,
      });

      logger.verbose('Sent Nats course added admin event');
    }

    logger.info('Successfully added course admin');
    res.status(200).json({
      errors: false,
      message: lang.addedAdmin,
    });
  },
  remove: async (req: Request, res: Response) => {
    res.status(500).send();
  },
};

export default admins;
