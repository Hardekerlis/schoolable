import {
  Listener,
  Subjects,
  RemoveCourseEvent,
} from '@gustafdahl/schoolable-events';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import Course from '../../models/course';
import CourseRemovedPublisher from '../publishers/courseRemoved';
import logger from '../../utils/logger';

export class RemoveCourseListener extends Listener<RemoveCourseEvent> {
  subject: Subjects.RemoveCourse = Subjects.RemoveCourse;
  queueGroupName = queueGroupName;

  async onMessage(data: RemoveCourseEvent['data'], msg: Message) {
    const { courseId } = data;
    logger.info(`Preparing to delete course with id ${courseId}`);
    logger.info('Looking up course');
    const course = await Course.findById(courseId).populate('coursePage');

    if (!course) {
      logger.info('No course found');
      return msg.ack();
    }
    logger.info('Found course');

    if (!course.upForDeletion) {
      logger.info(`Course with id ${courseId} is not up for deletion`);
      return msg.ack();
    }

    logger.info('Deleting coursePage and course');

    course.coursePage.remove();
    course.remove();

    logger.info(`Successfully deleted course with id ${courseId}`);

    logger.info('Publishing course was deleted');
    new CourseRemovedPublisher(this.client, logger).publish({
      courseId: course.id,
    });

    msg.ack();
  }
}
