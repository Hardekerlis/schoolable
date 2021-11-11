import {
  Listener,
  Subjects,
  CourseRemovedStudentEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from '../queueGroupName';
import Course from '../../../models/course';
import logger from '../../../utils/logger';

export class CourseRemovedStudentListener extends Listener<CourseRemovedStudentEvent> {
  subject: Subjects.CourseRemovedStudent = Subjects.CourseRemovedStudent;
  queueGroupName = queueGroupName;

  async onMessage(data: CourseRemovedStudentEvent['data'], msg: Message) {
    const { studentId, courseId } = data;

    logger.info(
      `Removing user with id ${studentId} from students in course with id ${courseId}`,
    );

    logger.debug('Looking up course');
    const course = await Course.findById(courseId)!;

    if (!course) {
      logger.error('No course found');
      return msg.ack();
    }
    logger.debug('Found course');

    logger.debug('Removing student from students array');
    const studentIndex = course.students?.indexOf(studentId)!;
    course.students?.splice(studentIndex, 1);

    logger.debug('Saving course');
    await course.save();

    logger.debug('Looking up files');
    // @ts-ignore
    const files = await File.find({ access: { users: studentId } });

    logger.debug('Checking if any files are are associated with user');
    if (files[0]) {
      logger.debug(`${files.length} files are associated with user`);
      logger.debug('Looping through them');
      for (const file of files) {
        // @ts-ignore
        const index = file.access?.users.indexOf(studentId);

        logger.debug('Removing user from file');
        file.access?.users.splice(index, 1);

        logger.debug('Saving file');
        await file.save();
      }
    } else logger.debug('No files are associated with user');

    logger.info('Successfully removed student from course');

    msg.ack();
  }
}
