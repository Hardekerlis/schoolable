import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import {
  NotFoundError,
  NotAuthorizedError,
  LANG,
  UserTypes,
  CONFIG,
} from '@gustafdahl/schoolable-common';
import { DateTime } from 'luxon';

import Course from '../models/course';
import Phase from '../models/phase';
import PhaseItem from '../models/phaseItem';

import PhaseItemQueueRemovePublisher from '../events/publishers/phaseItemQueueRemove';

import logger from '../utils/logger';
import { natsWrapper } from '../utils/natsWrapper';

const remove = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const { phaseItemId, parentPhaseId, parentCourseId } = req.body;
  const _lang = req.lang;
  const lang = LANG[_lang];

  if (!isValidObjectId(parentPhaseId)) {
    logger.debug('Parent phase id is not a valid ObjectId');
    return res.status(404).json({
      errors: false,
      message: lang.noPhase,
    });
  }

  if (!isValidObjectId(parentCourseId)) {
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
  const course = await Course.findById(parentCourseId);

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
  const phase = await Phase.findById(parentPhaseId);

  if (!phase) {
    logger.debug('No parent phase found');
    throw new NotFoundError();
  }

  const phaseItem = await PhaseItem.findById(phaseItemId);

  if (!phaseItem) {
    logger.debug('No phase item found');
    throw new NotFoundError();
  }

  const removeAt = DateTime.now()
    .plus(CONFIG.debug ? { seconds: 5 } : { days: 30 })
    .toJSDate();

  phaseItem.deletion = {
    isUpForDeletion: true,
    removeAt,
  };

  phaseItem.locked = true;
  phaseItem.hidden = true;

  await phaseItem.save();

  if (process.env.NODE_ENV !== 'test') {
    // Publishes event to nats service
    new PhaseItemQueueRemovePublisher(natsWrapper.client, logger).publish({
      parentCourseId: course.id as string,
      parentPhaseId: phase.id,
      phaseItemId: phaseItem.id,
      removeAt: removeAt,
    });

    logger.info('Sent Nats phase item queue remove event');
  }

  res.status(200).json({
    errors: false,
    message: lang.upForDeletion.replace('%name%', phaseItem.name),
    phaseItem,
  });
};

export default remove;
