import { Request, Response } from 'express';
import { NotAuthorizedError } from '@gustafdahl/schoolable-errors';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';

import Course from '../models/course';
import CoursePage from '../models/coursePage';
import logger from '../utils/logger';

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

  if (!currentUser) throw new NotAuthorizedError();

  logger.debug('Looking up course and trying to update it');
  const course = await Course.findOneAndUpdate(
    {
      $and: [
        { id: courseId },
        { $or: [{ owner: currentUser.id }, { admins: currentUser.id }] },
      ],
    },
    data,
    {
      new: true,
    },
  );

  if (!course) {
    logger.debug('No course found');
    throw new NotAuthorizedError();
  }

  logger.debug('Checking if course page is to be updated');
  if (coursePageData) {
    logger.debug('Found course page present in body');
    logger.debug('Updating course page');
    const coursePage = await CoursePage.findByIdAndUpdate(
      course.coursePage,
      coursePageData,
      { new: true },
    );
    course.coursePage = coursePage;
    logger.debug('Updated course page');
  }

  logger.debug('Course was updated');

  res.status(200).json({
    errors: false,
    message: lang.updatedCourse,
    course,
  });
};

export default update;
