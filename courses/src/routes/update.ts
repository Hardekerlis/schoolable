import { Request, Response } from 'express';
import { NotAuthorizedError } from '@gustafdahl/schoolable-errors';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';

import User from '../models/user';
import Course from '../models/course';
import CoursePage, { CoursePageDoc } from '../models/coursePage';
import logger from '../utils/logger';
import CourseUpdatedPublisher from '../events/publishers/courseUpdated';
import { natsWrapper } from '../utils/natsWrapper';

const update = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const { courseId } = req.body;
  const data = req.body;
  const coursePageData = data.coursePage;
  delete data.coursePage;
  delete data.courseId;

  const _lang = req.lang;
  const lang = LANG[_lang];

  logger.info(`Starting update for course with id ${courseId}`);

  // To satisfy typescript
  // Current user is always defined here
  if (!currentUser) throw new NotAuthorizedError();

  const user = await User.findOne({ userId: currentUser.id });

  if (!user) throw new NotAuthorizedError();

  logger.debug('Looking up course and trying to update it');
  const course = await Course.findOneAndUpdate(
    {
      // Need course id to be correcnt and current users id to be in owner key or in admins array
      $and: [
        { id: courseId },
        // this is supposed to be user.id and not user.userId.
        // This is because owner and admins are subdocuments of user
        { $or: [{ owner: user.id }, { admins: user.id }] },
      ],
    },
    data,
    {
      new: true,
    },
  );

  // If no course was found it was because either no course was found
  // or because user is not authorized to edit course.
  if (!course) {
    logger.debug('No course found');
    throw new NotAuthorizedError();
  }

  logger.debug('Checking if course page is to be updated');
  // Check if user is trying to updated course page
  if (coursePageData) {
    logger.debug('Found course page present in body');
    logger.debug('Updating course page');
    const coursePage = await CoursePage.findByIdAndUpdate(
      course.coursePage,
      coursePageData as CoursePageDoc,
      { new: true },
    );
    course.coursePage = coursePage as CoursePageDoc;
    logger.debug('Updated course page');
  }

  logger.debug('Course was updated');

  if (process.env.NODE_ENV !== 'test') {
    // Publishes event to nats service
    new CourseUpdatedPublisher(natsWrapper.client, logger).publish({
      courseId: course.id as string,
      name: course.name,
      admins: course.admins as unknown as string[],
      students: course.students as unknown as string[],
    });

    logger.info('Sent Nats user registered event');
  }

  res.status(200).json({
    errors: false,
    message: lang.updatedCourse,
    course,
  });
};

export default update;
