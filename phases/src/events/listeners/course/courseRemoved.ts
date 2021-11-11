import {
  Listener,
  Subjects,
  CourseRemovedEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from '../queueGroupName';
import Course from '../../../models/course';
import Module from '../../../models/module';
import Phase from '../../../models/phase';
import logger from '../../../utils/logger';

export class CourseRemovedListener extends Listener<CourseRemovedEvent> {
  subject: Subjects.CourseRemoved = Subjects.CourseRemoved;
  queueGroupName = queueGroupName;

  async onMessage(data: CourseRemovedEvent['data'], msg: Message) {
    const { courseId } = data;

    logger.info(
      `Deleting course reference ${courseId} and its modules and phases`,
    );

    logger.debug('Deleting modules');
    const amountOfRemovedModules = await Module.deleteMany({
      parentCourse: courseId,
    });
    logger.debug(`Removed ${amountOfRemovedModules} modules`);

    logger.debug('Deleting phases');
    const amountOfRemovedPhases = await Phase.deleteMany({
      parentCourse: courseId,
    });
    logger.debug(`Removed ${amountOfRemovedPhases} phases`);

    logger.debug('Deleting course');
    await Course.findByIdAndDelete(courseId);

    logger.info('Removed course and its children');
    msg.ack();
  }
}
