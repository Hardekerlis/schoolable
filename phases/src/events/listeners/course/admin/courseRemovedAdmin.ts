import {
  Listener,
  Subjects,
  CourseRemovedAdminEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from '../../queueGroupName';
import Course from '../../../../models/course';
import logger from '../../../../utils/logger';

export class CourseRemovedAdminListener extends Listener<CourseRemovedAdminEvent> {
  subject: Subjects.CourseRemovedAdmin = Subjects.CourseRemovedAdmin;
  queueGroupName = queueGroupName;

  async onMessage(data: CourseRemovedAdminEvent['data'], msg: Message) {
    const { adminId, courseId } = data;

    logger.info(
      `Removing user with id ${adminId} from admins in course with id ${courseId}`,
    );

    logger.debug('Looking up course');
    const course = await Course.findById(courseId)!;

    if (!course) {
      logger.error('No course found');
      return msg.ack();
    }
    logger.debug('Found course');

    logger.debug('Removing admin from admins array');
    const adminIndex = course.admins?.indexOf(adminId)!;
    course.admins?.splice(adminIndex, 1);

    logger.debug('Saving course');
    await course.save();

    logger.info('Successfully removed admin from course');

    msg.ack();
  }
}
