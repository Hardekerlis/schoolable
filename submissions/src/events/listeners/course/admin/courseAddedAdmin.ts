import {
  Listener,
  Subjects,
  CourseAddedAdminEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from '../../queueGroupName';
import Course from '../../../../models/course';
import logger from '../../../../utils/logger';

export class CourseAddedAdminListener extends Listener<CourseAddedAdminEvent> {
  subject: Subjects.CourseAddedAdmin = Subjects.CourseAddedAdmin;
  queueGroupName = queueGroupName;

  async onMessage(data: CourseAddedAdminEvent['data'], msg: Message) {
    const { adminId, courseId } = data;

    logger.info(
      `Adding user with id ${adminId} to admins in course with id ${courseId}`,
    );

    logger.debug('Looking up course');
    const course = await Course.findById(courseId)!;

    if (!course) {
      logger.error('No course found');
      return msg.ack();
    }
    logger.debug('Found course');

    logger.debug('Pushing admin to admins array');
    course.admins?.push(adminId);

    logger.debug('Saving course');
    await course.save();

    msg.ack();
  }
}
