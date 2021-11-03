import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import {
  NotFoundError,
  NotAuthorizedError,
  LANG,
  UserTypes,
} from '@gustafdahl/schoolable-common';

import Course from '../models/course';
import Phase from '../models/phase';
import PhaseItem from '../models/phaseItem';

import logger from '../utils/logger';

// TODO: Change phaseId to parentPhaseId
// TODO: Change parentCourse to parentCourseId

export const fetchMany = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const _lang = req.lang;
  const lang = LANG[_lang];
  const { phaseId, parentCourse } = req.body;

  logger.info('Fetching phase items');

  logger.debug('Checking if parent course is a valid ObjectId');
  if (!isValidObjectId(parentCourse)) {
    logger.debug('Parent course is not a valid ObjectId');
    return res.status(404).json({
      errors: false,
      message: lang.noParentCourse,
      phaseItems: [],
    });
  }
  logger.debug('Parent course is a valid ObjectId');

  logger.debug('Checking if phase id is a valid ObjectId');
  if (!isValidObjectId(phaseId)) {
    logger.debug('Phase id is not a valid object id');
    return res.status(404).json({
      errors: false,
      message: lang.noPhase,
      phaseItems: [],
    });
  }
  logger.debug('Phase id is a valid ObjectId');

  logger.debug('Looking up course');
  const course = await Course.findOne({ courseId: parentCourse });

  if (!course) {
    logger.debug('No course found');
    throw new NotFoundError();
  }
  logger.debug('Found course');

  logger.debug('Checking if user is application admin');
  if (currentUser?.userType !== UserTypes.Admin) {
    logger.debug('User is not application admin');

    logger.debug('Checking if user is allowed to fetch phase items from phase');
    if (
      course.owner !== currentUser?.id &&
      !course.admins?.includes(currentUser?.id as string) &&
      !course.students?.includes(currentUser?.id as string)
    ) {
      logger.debug('User is not allowed to fetch phase items from phaes');
      throw new NotAuthorizedError();
    }
  } else logger.debug('User is application admin');

  logger.debug('Looking up parent phase');
  const phase = await Phase.findOne({ phaseId });

  if (!phase) {
    logger.debug('No parent phase found');
    throw new NotFoundError();
  }

  logger.debug('Found parent phase');

  let query = {
    parentPhase: phase.id,
    parentCourse: phase.parentCourse,
  };

  logger.debug('Checking if user is a student');
  if (currentUser?.userType === UserTypes.Student) {
    logger.debug('User is a student');
    // @ts-ignore
    query.hidden = false;
    // @ts-ignore
    query.deletion.isUpForDeletion = false;
  }

  logger.debug('Fetching phase items');
  const phaseItems = await PhaseItem.find(query).select(
    '-parentCourse -parentPhase',
  );

  if (!phaseItems[0]) {
    logger.debug('No phase items found');
    return res.status(404).json({
      errors: false,
      message: lang.noPhaseItems,
      phaseItems: [],
    });
  }

  logger.info('Found phase items. Returning to user');

  res.status(200).json({
    errors: false,
    message: lang.foundPhaseItems,
    phaseItems,
  });
};

// TODO: Change phaseId to parentPhaseId
// TODO: Change parentCourse to parentCourseId

export const fetchOne = async (req: Request, res: Response) => {
  const { phaseItemId } = req.params;
  const { parentCourse, phaseId } = req.body;
  const { currentUser } = req;
  const _lang = req.lang;
  const lang = LANG[_lang];

  logger.info(`Fetching phase item with id ${phaseItemId}`);

  logger.debug('Checking if parent course is a valid ObjectId');
  if (!isValidObjectId(parentCourse)) {
    logger.debug('Parent course is not a valid ObjectId');
    return res.status(404).json({
      errors: false,
      message: lang.noParentCourse,
      phaseItems: [],
    });
  }
  logger.debug('Parent course is a valid ObjectId');

  logger.debug('Checking if phase id is a valid ObjectId');
  if (!isValidObjectId(phaseId)) {
    logger.debug('Phase id is not a valid object id');
    return res.status(404).json({
      errors: false,
      message: lang.noPhase,
      phaseItems: [],
    });
  }
  logger.debug('Phase id is a valid ObjectId');

  logger.debug('Checking if phase item id is a valid ObjectId');
  if (!isValidObjectId(phaseItemId)) {
    logger.debug('Phase item id is not a valid object id');
    return res.status(404).json({
      errors: false,
      message: lang.noPhaseItem,
      phaseItems: [],
    });
  }
  logger.debug('Phase item id is a valid ObjectId');

  logger.debug('Looking up parent course');
  const course = await Course.findOne({ courseId: parentCourse });

  if (!course) {
    logger.debug('No course found');
    throw new NotFoundError();
  }

  logger.debug('Checking if user is an application admin');
  if (currentUser?.userType !== UserTypes.Admin) {
    logger.debug('User is not an application admin');
    if (
      course.owner !== currentUser?.id &&
      !course.admins?.includes(currentUser?.id as string) &&
      !course.students?.includes(currentUser?.id as string)
    ) {
      logger.debug(
        `User is not allowed to fetch phase item with id ${phaseItemId}`,
      );
      throw new NotAuthorizedError();
    }
  } else logger.debug('User is an application admin');

  logger.debug('Looking up parent phase');
  const phase = await Phase.findOne({ phaseId });

  if (!phase) {
    logger.debug('No parent phase found');
    throw new NotFoundError();
  }
  logger.debug('Found parent phase');

  let query = {
    id: phaseItemId,
    parentPhase: phase.id,
    parentCourse: phase.parentCourse,
  };

  logger.debug('Checking if user is a student');
  if (currentUser?.userType === UserTypes.Student) {
    logger.debug('User is a student');
    // @ts-ignore
    query.hidden = false;
    // @ts-ignore
    query.deletion.isUpForDeletion = false;
  }

  logger.debug('Looking up phase item');
  const phaseItem = await PhaseItem.findOne(query).select(
    '-parentCourse -parentPhase',
  );

  if (!phaseItem) {
    logger.debug('No phase item found');
    return res.status(404).json({
      errors: false,
      message: lang.noPhaseItem,
    });
  }

  logger.info('Found phase item. Returning to user');
  res.status(200).json({
    errors: false,
    message: lang.foundPhaseItem,
    phaseItem,
  });
};
