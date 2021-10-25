import {
  Listener,
  CourseQueueRemoveEvent,
  Subjects,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import logger from '../../utils/logger';

import { queueGroupName } from './queueGroupName';
import removeCourseQueue from '../../queues/removeCourseQueue';

export class CourseQueueRemoveListener extends Listener<CourseQueueRemoveEvent> {
  subject: Subjects.CourseQueueRemove = Subjects.CourseQueueRemove;
  queueGroupName = queueGroupName;

  async onMessage(data: CourseQueueRemoveEvent['data'], msg: Message) {
    const { removeAt, courseId } = data;

    const delay = new Date(removeAt).getTime() - new Date().getTime();

    logger.info(`Trying to add course with id ${courseId} to remove queue`);

    try {
      await removeCourseQueue.add(
        {
          courseId: courseId,
        },
        {
          delay: delay,
        },
      );
    } catch (err) {
      console.error(err);
    }

    logger.info(
      `Waiting ${delay} milliseconds before removing course with id ${courseId}`,
    );

    msg.ack();
  }
}
