import {
  Listener,
  Subjects,
  CourseRemovedAdminEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from '../queueGroupName';
import logger from '../../../utils/logger';

import Course from '../../../models/course';
import File from '../../../models/file';

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

    logger.debug('Looking up files');
    // @ts-ignore
    const files = await File.find({ access: { users: adminId } });

    logger.debug('Checking if any files are are associated with user');
    if (files[0]) {
      logger.debug(`${files.length} files are associated with user`);
      logger.debug('Looping through them');
      for (const file of files) {
        // @ts-ignore
        const index = file.access?.users.indexOf(adminId);

        logger.debug('Removing user from file');
        file.access?.users.splice(index, 1);

        logger.debug('Saving file');
        await file.save();
      }
    } else logger.debug('No files are associated with user');

    logger.info('Successfully removed user from course');

    msg.ack();
  }
}
