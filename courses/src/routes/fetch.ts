import { Request, Response } from 'express';
import { NotAuthorizedError } from '@gustafdahl/schoolable-errors';

import Course from '../models/course';
import { UserTypes } from '@gustafdahl/schoolable-enums';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';

const fetchMany = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const _lang = req.lang;
  const lang = LANG[_lang];

  // TODO: Might need to set limit to fetch courses.
  if (!currentUser) throw new NotAuthorizedError();

  let courses;
  if (currentUser.userType !== UserTypes.Admin) {
    courses = await Course.find({
      $or: [
        { owner: currentUser.id },
        { students: currentUser.id },
        { admins: currentUser.id },
      ],
    });
  } else if (currentUser.userType === UserTypes.Admin) {
    courses = await Course.find({});
  } else {
    throw new NotAuthorizedError();
  }

  if (courses.length === 0) {
    return res.status(404).json({
      errors: false,
      message: lang.noCourses,
      courses: [],
    });
  }

  res.status(200).send({
    errors: false,
    message: lang.foundCourses,
    courses: courses,
  });
};

const fetchOne = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const { courseId } = req.params;

  const _lang = req.lang;
  const lang = LANG[_lang];

  if (!currentUser) throw new NotAuthorizedError();

  let course;
  if (currentUser.userType !== UserTypes.Admin) {
    course = await Course.findOne({
      $and: [
        { id: courseId },
        {
          $or: [
            { owner: currentUser.id },
            { students: currentUser.id },
            { admins: currentUser.id },
          ],
        },
      ],
    }).populate('coursePage');
  } else if (currentUser.userType === UserTypes.Admin) {
    course = await Course.findById(courseId).populate('coursePage');
  } else {
    throw new NotAuthorizedError();
  }

  if (!course) {
    return res.status(404).json({
      errors: false,
      message: lang.noCourse,
    });
  }

  if (course.coursePage.menu) {
    return res.status(200).json({
      errors: false,
      message: lang.foundCourse,
      course,
    });
  }

  res.status(500).send();
};

export { fetchMany, fetchOne };
