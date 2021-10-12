import { Request, Response } from 'express';
import { NotAuthorizedError } from '@gustafdahl/schoolable-errors';

import User from '../models/user';
import Course from '../models/course';
import { UserTypes } from '@gustafdahl/schoolable-enums';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';

// TODO: Add logger and comments
const fetchMany = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const _lang = req.lang;
  const lang = LANG[_lang];

  // REVIEW: Might need to set limit to fetch courses.
  if (!currentUser) throw new NotAuthorizedError();

  const user = await User.findOne({ userId: currentUser.id });

  if (!user) throw new NotAuthorizedError();

  let query;
  if (currentUser.userType !== UserTypes.Admin) {
    query = {
      $or: [{ owner: user.id }, { students: user.id }, { admins: user.id }],
    };
  } else if (currentUser.userType === UserTypes.Admin) {
    query = {};
  } else {
    throw new NotAuthorizedError();
  }

  const courses = await Course.find(query).populate('owner');

  if (courses.length === 0) {
    return res.status(404).json({
      errors: false,
      message: lang.noCourses,
      courses: [],
    });
  }

  res.status(200).json({
    errors: false,
    message: lang.foundCourses,
    courses: courses,
  });
};

// TODO: Add logger and comments
const fetchOne = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const { courseId } = req.params;

  const _lang = req.lang;
  const lang = LANG[_lang];

  if (!currentUser) throw new NotAuthorizedError();

  const user = await User.findOne({ userId: currentUser.id });

  if (!user) throw new NotAuthorizedError();

  let query = {};
  if (currentUser.userType !== UserTypes.Admin) {
    query = {
      $and: [
        { id: courseId },
        {
          $or: [{ owner: user.id }, { students: user.id }, { admins: user.id }],
        },
      ],
    };
  } else if (currentUser.userType === UserTypes.Admin) {
    query = courseId;
  } else {
    throw new NotAuthorizedError();
  }

  const course = await Course.findOne(query)
    .populate('coursePage')
    .populate('owner');

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
