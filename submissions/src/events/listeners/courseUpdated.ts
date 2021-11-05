import {
  Listener,
  Subjects,
  CourseUpdatedEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import Course from '../../models/course';
import logger from '../../utils/logger';

export class CourseUpdatedListener extends Listener<CourseUpdatedEvent> {
  subject: Subjects.CourseUpdated = Subjects.CourseUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: CourseUpdatedEvent['data'], msg: Message) {
    const { courseId, name } = data;

    logger.info(`Updating course with id ${courseId}`);

    await Course.findOneAndUpdate({ courseId }, { name });

    logger.info('Updated course');

    msg.ack();
  }
}
