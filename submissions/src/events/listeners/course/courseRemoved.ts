import {
  Listener,
  Subjects,
  CourseRemovedEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import Course from '../../../models/course';
import Phase from '../../../models/phase';
import Module from '../../../models/module';
import File, { FileDoc } from '../../../models/file';

import { queueGroupName } from '../queueGroupName';

import logger from '../../../utils/logger';

// Review: Does this actually remove children of course?
export class CourseRemovedListener extends Listener<CourseRemovedEvent> {
  subject: Subjects.CourseRemoved = Subjects.CourseRemoved;
  queueGroupName = queueGroupName;

  async onMessage(data: CourseRemovedEvent['data'], msg: Message) {
    const { courseId } = data;

    logger.info(
      `Removing course with id ${courseId} and its phases and phase items`,
    );
    const phases = await Phase.deleteMany({
      parentCourse: courseId,
    });

    logger.debug(`Removed ${phases.deletedCount} phases`);

    const _modules = await Module.deleteMany({
      parentCourse: courseId,
    });

    logger.debug('Removed ${_modules.deletedCount} modules');

    const removedCourse = await Course.findOneAndRemove({ id: courseId });

    // REVIEW: EHHH. This is super sketchy. Does this really work? : )
    logger.debug('Getting files associated with course');
    const files: FileDoc[] = removeCourse.ownerDocument();

    logger.debug('Checking if any files where found');
    if (files[0]) {
      logger.debug('Found files');

      logger.debug('Looping through files');
      for (const file of files) {
        // This is not gonna work xd
        file.phase = null;

        await file.save();
      }
    } else logger.debug('No files found');

    logger.info('Removed course and its children');

    msg.ack();
  }
}
