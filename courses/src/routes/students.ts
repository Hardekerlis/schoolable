import { Request, Response } from 'express';
import {
  LANG,
  NotAuthorizedError,
  BadRequestError,
  UnexpectedError,
  UserTypes,
} from '@gustafdahl/schoolable-common';

import Course from '../models/course';
import User from '../models/user';

import logger from '../utils/logger';

// TODO: Implement support for student classses
const students = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const lang = LANG[`${req.lang}`];
  const { courseId, studentId, classId } = req.body;

  logger.info('Attempting to add student to course');

  logger.debug('Looking up user who is attempting to edit course');
  const editorUser = await User.findOne({ userId: currentUser?.id });

  if (!editorUser) {
    logger.debug('No editor user found');
    throw new UnexpectedError();
  }
  logger.debug('Found editor');

  let query = {};
  logger.debug('Checking what type of user the editor is');
  if (currentUser?.userType !== UserTypes.Admin) {
    logger.debug(`User is a ${currentUser?.userType}`);
    query = {
      $and: [
        { id: courseId },
        { $or: [{ owner: editorUser.id }, { admins: editorUser.id }] },
      ],
    };
  } else if (currentUser?.userType === UserTypes.Admin) {
    logger.debug('User is an admin');
    query = { id: courseId };
  }

  logger.debug('Looking up course');
  const course = await Course.findOne(query);

  if (!course) {
    logger.debug('No course found');
    throw new NotAuthorizedError();
  }
  logger.debug('Found course');

  logger.debug('Looking up student to be added to course');
  const student = await User.findOne({ userId: studentId });

  if (!student) {
    logger.debug('No student found');
    throw new BadRequestError(lang.noUserFound);
  }
  logger.debug('Found student');

  logger.debug('Pushing student to course');
  course.students?.push(student);

  logger.debug('Saving user');
  await course.save();

  logger.info('Successfully added student to course');
  res.status(200).json({
    errors: false,
    message: lang.addedStudent,
  });
};

export default students;
