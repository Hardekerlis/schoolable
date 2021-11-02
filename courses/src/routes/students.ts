import { Request, Response } from 'express';
import {
  LANG,
  NotAuthorizedError,
  BadRequestError,
  UnexpectedError,
  UserTypes,
} from '@gustafdahl/schoolable-common';
import { ObjectId } from 'mongoose';

import Course from '../models/course';
import User, { UserDoc } from '../models/user';

import logger from '../utils/logger';
import { natsWrapper } from '../utils/natsWrapper';

import CourseAddedStudentPublisher from '../events/publishers/courseAddedStudent';
import CourseRemovedStudentPublisher from '../events/publishers/courseRemovedStudent';

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

    if (process.env.NODE_ENV !== 'test') {
      // Publishes event to nats service
      new CourseAddedStudentPublisher(natsWrapper.client, logger).publish({
        studentId: student.id,
        courseId: course.id,
      });

      logger.verbose('Sent Nats course added admin event');
    }

    logger.info('Successfully added student to course');
    res.status(200).json({
      errors: false,
      message: lang.addedStudent,
    });
  },
  remove: async (req: Request, res: Response) => {
    const { currentUser } = req;
    const lang = LANG[`${req.lang}`];
    const { courseId, studentId } = req.body;

    logger.info('Attempting to remove student from students in course');

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
      logger.debug('Current user is not application admin');
      logger.debug(
        'Checking if current user is authorized to make changes to resource',
      );
      if (
        course.owner.toString() !== currentUser?.id &&
        // @ts-ignore
        !course.admins?.includes(currentUser?.id)
      ) {
        logger.debug(
          'Current user is not authorized to make changes to resource',
        );
        throw new NotAuthorizedError();
      }

      logger.debug('Current user is authorized to make changes to resource');
    } else logger.debug('User is application admin');

    logger.debug('Looking up student');
    const student = await User.findById(studentId);

    if (!student) {
      logger.debug('No student found');
      return res.status(404).json({
        errors: false,
        message: lang.noUserFound,
      });
    }
    logger.debug('Found student');

    logger.debug('Getting student index in students array');
    const studentIndex = course.students?.indexOf(student.id)!;
    logger.debug('Removing student from students array');
    course.students?.splice(studentIndex, 1);
    logger.debug('Saving course');
    await course.save();

    if (process.env.NODE_ENV !== 'test') {
      // Publishes event to nats service
      new CourseRemovedStudentPublisher(natsWrapper.client, logger).publish({
        studentId: student.id,
        courseId: course.id,
      });

      logger.verbose('Sent Nats course added admin event');
    }

    logger.info('Successfully removed student from course');
    res.status(200).json({
      errors: false,
      message: lang.removedStudent,
    });
  },
};

export default students;
