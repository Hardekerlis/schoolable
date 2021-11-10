import {
  Listener,
  Subjects,
  UserRemovedEvent,
  UserTypes,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import Course from '../../models/course';

import logger from '../../utils/logger';

export class UserRemovedListener extends Listener<UserRemovedEvent> {
  subject: Subjects.UserRemoved = Subjects.UserRemoved;
  queueGroupName = queueGroupName;

  async onMessage(data: UserRemovedEvent['data'], msg: Message) {
    const { userId, removingAdmin } = data;

    logger.info(`Attempting to remove user with id ${userId} from courses`);

    logger.debug('Looking up courses');
    const courses = await Course.find({
      $or: [{ owner: userId }, { admins: userId }, { students: userId }],
    });

    if (!courses[0]) {
      logger.debug('No courses found');
      return msg.ack();
    }
    logger.debug('Found courses');

    logger.debug('Looping through courses');
    for (const course of courses) {
      logger.debug(
        'Checking if removed user is owner, student or admin of course',
      );
      if (course.owner === userId) {
        logger.debug(
          `User was course owner. Replacing owner with admin with id ${removingAdmin}`,
        );
        course.owner = removingAdmin;
      } else if (course.admins?.includes(userId)) {
        logger.debug('User was a course student');
        logger.debug('Getting index of removed user in student array');
        const studentIndex = course.students?.indexOf(userId)!;

        logger.debug('Removing student from students array');
        course.students?.splice(studentIndex, 1);
      } else if (course.students?.includes(userId)) {
        logger.debug('User was a course admin');
        logger.debug('Getting index of removed user in admin array');
        const adminIndex = course.admins?.indexOf(userId)!;

        logger.debug('Removing admin from students array');

        course.admins?.splice(adminIndex, 1);
      }

      await course.save();
    }

    msg.ack();
  }
}
