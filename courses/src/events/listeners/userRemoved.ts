import {
  Listener,
  Subjects,
  UserRemovedEvent,
  UserTypes,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import User from '../../models/user';
import Course from '../../models/course';

import logger from '../../utils/logger';

const randomNum = (endIndex: number): number => {
  return Math.floor(Math.random() * endIndex);
};

export class UserRemovedListener extends Listener<UserRemovedEvent> {
  subject: Subjects.UserRemoved = Subjects.UserRemoved;
  queueGroupName = queueGroupName;

  async onMessage(data: UserRemovedEvent['data'], msg: Message) {
    const { userId, removingAdmin } = data;

    logger.info(`Removing user with id ${userId}`);

    logger.debug('Looking up user to remove');
    const userToRemove = await User.findById(userId);

    if (!userToRemove) {
      logger.error('No user to remove found. This should never happen');
      return msg.ack();
    }
    logger.debug('Found user');

    logger.debug('Looking up courses associated with user');
    const courses = await Course.find({
      $or: [
        { students: userToRemove.id },
        { admins: userToRemove.id },
        { owner: userToRemove.id },
      ],
    });

    if (!courses[0]) {
      logger.debug('No courses found');
      return msg.ack();
    }
    logger.debug('Found courses');

    logger.debug('Looking up admin');
    // The new course owner inhereits all courses the user whom is being removed owns
    const newCourseOwner = await User.findById(removingAdmin);

    if (!newCourseOwner) {
      logger.debug('No admins found');
      return msg.ack();
    }

    logger.debug('Looping through courses');
    for (const course of courses) {
      logger.debug('Checking if user is owner, student or admin of course');
      if (course.owner.toString() === userToRemove.id.toString()) {
        logger.debug('User is owner of course');
        logger.debug(`Assigning course to admin with id ${newCourseOwner.id}`);
        course.owner = newCourseOwner;
      } else if (course.students?.includes(userToRemove.id)) {
        logger.debug('User is student of course');
        // Index of the user we are removing
        logger.debug('Getting index of user in student array');
        const studentIndex = course.students?.indexOf(userToRemove.id);
        // Remove user from students array
        logger.debug('Removing user from students array');
        course.students?.splice(studentIndex, studentIndex - 1);
      } else if (course.admins?.includes(userToRemove.id)) {
        logger.debug('User is admin of course');
        // Index of the user we are removing
        logger.debug('Getting index of user in admin array');
        const adminIndex = course.admins?.indexOf(userToRemove.id);
        // Remove user from admins array
        logger.debug('Removing user from admins array');
        course.admins?.splice(adminIndex, adminIndex - 1);
      }
      logger.debug('Saving course');
      await course.save();
    }

    msg.ack();
  }
}
