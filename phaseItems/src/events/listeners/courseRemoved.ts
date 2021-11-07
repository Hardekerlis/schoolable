import {
  Listener,
  Subjects,
  CourseRemovedEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import Course from '../../models/course';
import Module from '../../models/module';
import Phase from '../../models/phase';
import logger from '../../utils/logger';

export class CourseRemovedListener extends Listener<CourseRemovedEvent> {
  subject: Subjects.CourseRemoved = Subjects.CourseRemoved;
  queueGroupName = queueGroupName;

  async onMessage(data: CourseRemovedEvent['data'], msg: Message) {
    const { courseId } = data;

    logger.info(
      `Removing course with id ${courseId} and its phases and phase items`,
    );
    await Phase.deleteMany({
      parentCourse: courseId,
    });

    logger.debug('Removed phase items');

    await Module.deleteMany({
      parentCourse: courseId,
    });

    logger.debug('Removed phases');

    await Course.findByIdAndRemove(courseId);

    logger.info('Removed course and its children');

    msg.ack();
  }
}
