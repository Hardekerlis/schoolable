import {
  Listener,
  Subjects,
  CourseAddedStudentEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import Course from '../../models/course';
import logger from '../../utils/logger';

export class CourseAddedStudentListener extends Listener<CourseAddedStudentEvent> {
  subject: Subjects.CourseAddedStudent = Subjects.CourseAddedStudent;
  queueGroupName = queueGroupName;

  async onMessage(data: CourseAddedStudentEvent['data'], msg: Message) {
    const { studentId, courseId } = data;

    logger.info(
      `Adding user with id ${studentId} to students in course with id ${courseId}`,
    );

    logger.debug('Looking up course');
    const course = await Course.findById(courseId)!;

    if (!course) {
      logger.error('No course found');
      return msg.ack();
    }
    logger.debug('Found course');

    logger.debug('Pushing student to students array');
    course.students?.push(studentId);

    logger.debug('Saving course');
    await course.save();

    logger.info('Successfully added student to course');

    msg.ack();
  }
}
