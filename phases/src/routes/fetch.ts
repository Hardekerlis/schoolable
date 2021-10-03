import { Request, Response } from 'express';
import {
  BadRequestError,
  NotAuthorizedError,
} from '@gustafdahl/schoolable-errors';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';
import { UserTypes } from '@gustafdahl/schoolable-enums';
import mongoose from 'mongoose';

import Phase from '../models/phase';
import Course from '../models/course';

import logger from '../utils/logger';

export const fetchMany = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const { parentCourse } = req.body;
  const _lang = req.lang;
  const lang = LANG[_lang];

  // TODO: Might need to set limit to fetch phases.
  if (!currentUser) throw new NotAuthorizedError();

  if (!mongoose.isValidObjectId(parentCourse)) {
    throw new BadRequestError(lang.badIds);
  }

  let query: object;
  if (currentUser.userType !== UserTypes.Admin) {
    query = {
      $and: [
        { courseId: parentCourse },
        {
          $or: [
            { owner: currentUser.id },
            { students: currentUser.id },
            { admins: currentUser.id },
          ],
        },
      ],
    };
  } else if (currentUser.userType === UserTypes.Admin) {
    query = { courseId: parentCourse };
  } else {
    throw new NotAuthorizedError();
  }

  const course = await Course.findOne(query);

  if (!course) {
    throw new NotAuthorizedError();
  }

  const phases = await Phase.find({
    parentCourse: course.courseId,
  });

  // console.log(phases[0]);

  if (!phases[0]) {
    return res.status(404).json({
      errors: false,
      message: lang.noPhasesFound,
      phases: [],
    });
  }

  res.status(200).json({
    errors: false,
    message: lang.foundPhases,
    phases,
  });

  res.status(500).send();
};

export const fetchOne = async (req: Request, res: Response) => {
  const { phaseId } = req.params;
  const { currentUser } = req;
  const { parentCourse } = req.body;
  const _lang = req.lang;
  const lang = LANG[_lang];

  if (!currentUser) throw new NotAuthorizedError();

  if (
    !mongoose.isValidObjectId(phaseId) ||
    !mongoose.isValidObjectId(parentCourse)
  ) {
    throw new BadRequestError(lang.badIds);
  }

  let query: object;
  if (currentUser.userType !== UserTypes.Admin) {
    query = {
      $and: [
        { courseId: parentCourse },
        {
          $or: [
            { owner: currentUser.id },
            { students: currentUser.id },
            { admins: currentUser.id },
          ],
        },
      ],
    };
  } else if (currentUser.userType === UserTypes.Admin) {
    query = { courseId: parentCourse };
  } else {
    throw new NotAuthorizedError();
  }

  const course = await Course.findOne(query);

  if (!course) {
    throw new NotAuthorizedError();
  }

  const phase = await Phase.findById(phaseId);

  if (!phase) {
    return res.status(404).json({
      errors: false,
      message: lang.noPhaseFound,
      phase: undefined,
    });
  }

  res.status(200).json({
    errors: false,
    message: lang.foundPhase,
    phase,
  });
};
