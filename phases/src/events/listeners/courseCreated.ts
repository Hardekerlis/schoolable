import {
  Listener,
  Subjects,
  CourseCreatedEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';

import { queueGroupName } from './queueGroupName';
import Course from '../../models/course';
import logger from '../../utils/logger';

export class CoruseCreatedListener extends Listener<CourseCreatedEvent> {
  subject: Subjects.CourseCreated = Subjects.CourseCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: CourseCreatedEvent['data'], msg: Message) {
    const { courseId, name, owner } = data;

    logger.info('Creating course references');

    const course = Course.build({
      id: courseId,
      name,
      owner,
    });

    await course.save();

    msg.ack();
  }
}
