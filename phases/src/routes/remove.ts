import { Request, Response } from 'express';
import {
  LANG,
  InvalidObjectIdError,
  DocumentNotFoundError,
  UserTypes,
  NotAuthorizedError,
  BadRequestError,
  CONFIG,
} from '@gustafdahl/schoolable-common';
import { isValidObjectId } from 'mongoose';
import { DateTime } from 'luxon';

import Module from '../models/module';
import Phase from '../models/phase';
import { CourseDoc } from '../models/course';

import logger from '../utils/logger';
import { natsWrapper } from '../utils/natsWrapper';

import { PhaseQueueRemovePublisher } from '../events';

// TODO: Remove the need for parent module id

const remove = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const lang = LANG[`${req.lang}`];
  const { parentModuleId, phaseId } = req.body;

  logger.info('Attempting to queue phase for removal');

  logger.debug('Checking if parent module id is a valid object id');
  if (!isValidObjectId(parentModuleId)) {
    logger.debug('Parent module id is not a valid object id');
    throw new InvalidObjectIdError(lang.noModuleFound);
  }
  logger.debug('Parent module id is a valid object id');

  logger.debug('Checking if phase id is a valid object id');
  if (!isValidObjectId(phaseId)) {
    logger.debug('Phase id is not a valid object id');
    throw new InvalidObjectIdError(lang.noPhaseFound);
  }
  logger.debug('Phase id is a valid object id');

  logger.debug('Looking up module and populating parent course');
  const _module = await Module.findById(parentModuleId).populate(
    'parentCourse',
  );

  if (!_module) {
    logger.debug('No module found');
    throw new DocumentNotFoundError(lang.noModuleFound);
  }
  logger.debug('Found module');

  logger.debug('Checking if user is an application admin');
  if (currentUser?.userType !== UserTypes.Admin) {
    logger.debug('User is not application admin');
    logger.debug('Checking if user is allowed to create resources for module');
    if (
      (_module.parentCourse as CourseDoc).owner.toString() !== currentUser?.id
    ) {
      logger.debug('User is not allowed to create resources for module');
      throw new NotAuthorizedError();
    }
    logger.debug('User is allowed to create resources for module');
  } else logger.debug('User is an application admin');

  logger.debug('Looking up phase to be removed');
  const phaseToRemove = await Phase.findById(phaseId);

  if (!phaseToRemove) {
    logger.debug('No phase found');
    throw new DocumentNotFoundError(lang.noPhaseFound);
  }
  logger.debug('Found phase');

  logger.debug('Checking if phase already is up for deletion');
  if (phaseToRemove.deletion?.isUpForDeletion) {
    logger.debug('Phase is already up for deletion');
    throw new BadRequestError(lang.alreadyUpForDeletion);
  }
  logger.debug('Phase is not up for deletion');

  const removeAt = DateTime.now()
    .plus(CONFIG.debug ? { seconds: 5 } : { days: 30 })
    .toJSDate();

  logger.debug('Setting date to when phase is to be deleted by');
  phaseToRemove.deletion = {
    isUpForDeletion: true,
    removeAt,
  };

  logger.debug('Saving phase');
  await phaseToRemove.save();

  await new PhaseQueueRemovePublisher(natsWrapper.client, logger).publish({
    phaseId: phaseToRemove.id,
    parentModuleId: _module.id,
    parentCourseId: (_module.parentCourse as CourseDoc).id,
    removeAt,
  });
  logger.verbose('Sent Nats phase queued remove event');

  logger.info('Successfully queued phase for removal');
  res.status(200).json({
    errors: false,
    message: lang.upForDeletion,
    phase: phaseToRemove,
  });
};

export default remove;
