import { Request, Response } from 'express';
import {
  UserTypes,
  LANG,
  NotAuthorizedError,
} from '@gustafdahl/schoolable-common';
import { isValidObjectId } from 'mongoose';

import User from '../models/user';
import Course from '../models/course';

import logger from '../utils/logger';

const fetchMany = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const _lang = req.lang;
  const lang = LANG[_lang];

  // REVIEW: Might need to set limit to fetch courses.
  if (!currentUser) throw new NotAuthorizedError();

  logger.info(
    `Attempting to fetch courses for user with id: ${currentUser.id}`,
  );

  logger.debug('Looking up user');
  const user = await User.findById(currentUser.id);

  if (!user) {
    logger.info('No user found');
    throw new NotAuthorizedError();
  }

  let query;
  logger.debug('Checking user access');
  // Check to see what type of query to run
  if (currentUser.userType !== UserTypes.Admin) {
    logger.debug('User is not application admin');
    query = {
      $or: [{ owner: user.id }, { students: user.id }, { admins: user.id }],
    };
  } else if (currentUser.userType === UserTypes.Admin) {
    logger.debug('User is application admin');
    query = {};
  } else {
    logger.warn('Unexpected user type found');
    throw new NotAuthorizedError();
  }

  logger.debug('Looking up courses associated with user');
  const courses = await Course.find(query).populate('owner');

  if (courses.length === 0) {
    logger.info('No courses found');
    return res.status(404).json({
      errors: false,
      message: lang.noCourses,
      courses: [],
    });
  }

  logger.info('Found courses');
  res.status(200).json({
    errors: false,
    message: lang.foundCourses,
    courses: courses,
  });
};

const fetchOne = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const { courseId } = req.params;

  const _lang = req.lang;
  const lang = LANG[_lang];

  if (!currentUser) throw new NotAuthorizedError();

  logger.info(
    `User with id ${currentUser.id} is attempting to fetch course with id ${courseId}`,
  );

  if (!isValidObjectId(courseId)) {
    logger.debug('Course id is not an ObjectId');
    return res.status(404).json({
      errors: false,
      message: lang.noCourse,
    });
  }

  logger.debug('Looking up user');
  const user = await User.findById(currentUser.id);

  if (!user) {
    logger.info('No user found');
    throw new NotAuthorizedError();
  }

  let query = {};
  logger.debug('Checking user access');
  if (currentUser.userType !== UserTypes.Admin) {
    logger.debug('User is not application admin');
    query = {
      $and: [
        { _id: courseId },
        {
          $or: [{ owner: user.id }, { students: user.id }, { admins: user.id }],
        },
      ],
    };
  } else if (currentUser.userType === UserTypes.Admin) {
    logger.debug('User is application admin');
    query = { _id: courseId };
  } else {
    logger.warn('Unexpected user type found');
    throw new NotAuthorizedError();
  }

  logger.debug('Looking up course');
  const course = await Course.findOne(query)
    .populate('coursePage')
    .populate('owner');

  if (!course) {
    logger.info('No course found');
    return res.status(404).json({
      errors: false,
      message: lang.noCourse,
    });
  }

  logger.info('Found course');
  res.status(200).json({
    errors: false,
    message: lang.foundCourse,
    course,
  });
};

export { fetchMany, fetchOne };
