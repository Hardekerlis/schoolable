import {
  Listener,
  Subjects,
  CourseRemovedEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from '../queueGroupName';
import Course from '../../../models/course';
import logger from '../../../utils/logger';

import File from '../../../models/file';

export class CourseRemovedListener extends Listener<CourseRemovedEvent> {
  subject: Subjects.CourseRemoved = Subjects.CourseRemoved;
  queueGroupName = queueGroupName;

  async onMessage(data: CourseRemovedEvent['data'], msg: Message) {
    const { courseId } = data;
    logger.info(`Removing course reference with id ${courseId}`);

    logger.debug('Looking up course and removing it');
    const course = await Course.findOneAndRemove({ courseId });

    if (!course) {
      logger.error(`Couldn't find a course with id ${courseId} to remove`);
      return msg.ack();
    }

    logger.debug('Looking up files');
    // @ts-ignore
    const files = await File.find({ access: { courses: courseId } });

    logger.debug('Checking if any files are are associated with course');
    if (files[0]) {
      logger.debug(`${files.length} files are associated with course`);
      logger.debug('Looping through them');
      for (const file of files) {
        // @ts-ignore
        const index = file.access?.courses.indexOf(courseId);

        logger.debug('Removing course from file');
        file.access?.courses.splice(index, 1);

        logger.debug('Saving file');
        await file.save();
      }
    } else logger.debug('No files are associated with course');

    logger.info('Found and removed course');

    msg.ack();
  }
}
