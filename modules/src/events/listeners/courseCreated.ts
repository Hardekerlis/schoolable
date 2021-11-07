import {
  Listener,
  Subjects,
  CourseCreatedEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import Course from '../../models/course';
import logger from '../../utils/logger';

export class CoruseCreatedListener extends Listener<CourseCreatedEvent> {
  subject: Subjects.CourseCreated = Subjects.CourseCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: CourseCreatedEvent['data'], msg: Message) {
    const { courseId, name, owner } = data;

    logger.info(`Creating course references for course with id ${courseId}`);

    logger.debug('Building course');
    const course = Course.build({
      id: courseId,
      name,
      owner,
    });

    logger.debug('Saving course');
    await course.save();

    logger.info('Successfully created course reference');
    msg.ack();
  }
}
