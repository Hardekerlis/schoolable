import { Request, Response } from 'express';
import {
  BadRequestError,
  NotAuthorizedError,
  UserTypes,
  LANG,
} from '@gustafdahl/schoolable-common';
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

  logger.info('Fetching course phases');

  if (!mongoose.isValidObjectId(parentCourse)) {
    logger.warn('Parent course value is not a valid object id');
    throw new BadRequestError(lang.badIds);
  }

  let query: object;
  logger.debug('Determining what type of query to run');
  if (currentUser.userType !== UserTypes.Admin) {
    logger.debug('User is not an admin');
    query = {
      $and: [
        { id: parentCourse },
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
    logger.debug('User is an admin');
    query = { id: parentCourse };
  } else {
    logger.warn('Invalid user type');
    throw new NotAuthorizedError();
  }

  logger.debug('Finding parent course');
  const course = await Course.findOne(query);

  if (!course) {
    logger.info('No course found');
    throw new NotAuthorizedError();
  }

  logger.debug('Looking up phases associated with course');
  const phases = await Phase.find({
    parentCourse: course.id,
  }).select('-phaseItems -parentCourse -description');

  // TODO: Remove hidden phases if user is of type student

  if (!phases[0]) {
    logger.info('No phases found');
    return res.status(404).json({
      errors: false,
      message: lang.noPhasesFound,
      phases: [],
    });
  }

  logger.info('Found phases. Returning to user');
  res.status(200).json({
    errors: false,
    message: lang.foundPhases,
    phases,
  });
};

export const fetchOne = async (req: Request, res: Response) => {
  const { phaseId } = req.params;
  const { currentUser } = req;
  const { parentCourse } = req.body;
  const _lang = req.lang;
  const lang = LANG[_lang];

  if (!currentUser) throw new NotAuthorizedError();

  logger.info('Fetching course phase');

  if (
    !mongoose.isValidObjectId(phaseId) ||
    !mongoose.isValidObjectId(parentCourse)
  ) {
    logger.warn('Parent course or phase id value is not a valid object id');
    throw new BadRequestError(lang.badIds);
  }

  let query: object;
  logger.debug('Determining what type of query to run');
  if (currentUser.userType !== UserTypes.Admin) {
    logger.debug('User is not an admin');
    query = {
      $and: [
        { id: parentCourse },
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
    logger.debug('User is an admin');
    query = { id: parentCourse };
  } else {
    logger.warn('Invalid user type');
    throw new NotAuthorizedError();
  }

  logger.debug('Finding parent course');
  const course = await Course.findOne(query);

  if (!course) {
    logger.info('No course found');
    throw new NotAuthorizedError();
  }

  // TODO: Remove hidden phases from students

  logger.debug('Looking up phase');
  const phase = await Phase.findById(phaseId);

  if (!phase) {
    logger.info('No phase found');
    return res.status(404).json({
      errors: false,
      message: lang.noPhaseFound,
      phase: undefined,
    });
  }

  logger.info('Found phase. Returning to user');
  res.status(200).json({
    errors: false,
    message: lang.foundPhase,
    phase,
  });
};
