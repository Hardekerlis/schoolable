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

const students = {
  add: async (req: Request, res: Response) => {
    const { currentUser } = req;
    const lang = LANG[`${req.lang}`];
    const { courseId, studentId, classId } = req.body;

    logger.info('Attempting to add student to course');

    logger.debug('Looking up user who is attempting to edit course');
    const editorUser = await User.findById(currentUser?.id);

    if (!editorUser) {
      logger.debug('No editor user found');
      throw new UnexpectedError();
    }
    logger.debug('Found editor');

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
        course.owner.toString() !== editorUser.id.toString() &&
        !course.admins?.includes(editorUser.id.toString())
      ) {
        logger.debug('User is not authorized to edit course');
        throw new NotAuthorizedError();
      }
    } else logger.debug('Editor is an application admin');

    logger.debug('Looking up student to be added to course');
    const student = await User.findById(studentId);

    if (!student) {
      logger.debug('No student found');
      return res.status(404).json({
        errors: false,
        message: lang.noUserFound,
      });
    }
    logger.debug('Found student');

    logger.debug('Checking if student already is a course student');
    if (course.students?.includes(student.id)) {
      logger.debug('Student is already a course student');
      throw new BadRequestError(lang.alreadyStudent);
    }
    logger.debug('Student is not a course student');

    logger.debug('Pushing student to course');
    course.students?.push(student.id);

    logger.debug('Saving user');
    await course.save();

    logger.info('Successfully added student to course');
    res.status(200).json({
      errors: false,
      message: lang.addedStudent,
    });
  },
  remove: async (req: Request, res: Response) => {
    res.status(500).send();
  },
};

export default students;
