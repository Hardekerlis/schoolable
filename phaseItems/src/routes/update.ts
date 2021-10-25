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

const update = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const { phaseItemId, parentPhase, parentCourse } = req.body;
  const data = req.body;
  delete data.phaseItemId;
  delete data.parentPhase;
  delete data.parentCourse;
  const _lang = req.lang;
  const lang = LANG[_lang];

  logger.info(`Trying to update phase item with id ${phaseItemId}`);

  if (!isValidObjectId(parentPhase)) {
    logger.debug('Parent phase id is not a valid ObjectId');
    return res.status(404).json({
      errors: false,
      message: lang.noPhase,
    });
  }

  if (!isValidObjectId(parentCourse)) {
    logger.debug('Parent course id is not a valid ObjectId');
    return res.status(404).json({
      errors: false,
      message: lang.noParentCourse,
    });
  }

  if (!isValidObjectId(phaseItemId)) {
    logger.debug('Phase item id is not a valid ObjectId');
    return res.status(404).json({
      errors: false,
      message: lang.noPhaseItem,
      phaseItems: [],
    });
  }

  logger.debug('Looking up parent course');
  const course = await Course.findOne({ courseId: parentCourse });

  if (!course) {
    logger.debug('No course parent course found');
    throw new NotFoundError();
  }

  logger.debug('Checking if user is application admin');
  if (currentUser?.userType !== UserTypes.Admin) {
    logger.debug('User is not application admin');
    logger.debug('Checking if user is allowed to update phase item');

    if (
      course.owner !== currentUser?.id &&
      !course.admins?.includes(currentUser?.id as string)
    ) {
      logger.debug('User is not allowed to update phase item');
      throw new NotAuthorizedError();
    }
    logger.debug('User is allowed to update phase item');
  } else
    logger.debug(
      'User is application admin. Procceding without checking permissions',
    );

  logger.debug('Looking up parent phase');
  const phase = await Phase.findOne({ phaseId: parentPhase });

  if (!phase) {
    logger.debug('No parent phase found');
    throw new NotFoundError();
  }

  logger.debug('Looking up phase item and updating it if one is found');
  const updatedPhaseItem = await PhaseItem.findByIdAndUpdate(
    phaseItemId,
    data,
    { new: true },
  );

  if (!updatedPhaseItem) {
    logger.debug('No phase item found');
    throw new NotFoundError();
  }

  logger.info('Successfully updated phase item. Returning to user');
  res.status(200).json({
    errors: false,
    message: lang.updatedPhaseItem,
    phaseItem: updatedPhaseItem,
  });
};

export default update;
