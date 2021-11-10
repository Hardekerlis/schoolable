import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import {
  UserPayload,
  LANG,
  InvalidObjectIdError,
  DocumentNotFoundError,
  UserTypes,
  NotAuthorizedError,
} from '@gustafdahl/schoolable-common';
import { isValidObjectId } from 'mongoose';

import { CourseDoc } from '../models/course';
import Phase from '../models/phase';

import logger from '../utils/logger';
import { natsWrapper } from '../utils/natsWrapper';

import { PhaseUpdatedPublisher } from '../events';

const update = async (req: Request, res: Response) => {
  const currentUser = req.currentUser as UserPayload;
  const lang = LANG[`${req.lang}`];

  const data = matchedData(req, { locations: ['body'] });
  const { phaseId } = data;
  delete data.phaseId;

  logger.info(`Attempting to update phase`);

  logger.debug('Checking if phase id is a valid object id');
  if (!isValidObjectId(phaseId)) {
    logger.debug('Phase id is not a valid object id');
    throw new InvalidObjectIdError(lang.noPhaseFound);
  }
  logger.debug('Phase id is a valid object id');

  logger.debug('Looking up phase to be updated');
  const phase = await Phase.findById(phaseId)
    .populate('page')
    .populate({
      path: 'parentModule',
      populate: {
        path: 'parentCourse',
      },
    });

  if (!phase) {
    logger.debug('No phase found');
    throw new DocumentNotFoundError(lang.noPhaseFound);
  }
  logger.debug('Found phase');

  const parentCourse = phase.parentModule.parentCourse as CourseDoc;

  logger.debug('Checking if user is an application admin');
  if (currentUser.userType !== UserTypes.Admin) {
    logger.debug('User is not application admin');
    logger.debug('Checking if user is allowed to update phase');
    if (
      parentCourse.owner !== currentUser.id &&
      !parentCourse.admins?.includes(currentUser.id)
    ) {
      logger.debug('User is not allowed to update phase');
      throw new NotAuthorizedError();
    }
    logger.debug('User is allowed to update phase');
  } else logger.debug('User is an application admin');

  logger.debug('Looping through data');
  for (const key in data as any) {
    if (key === 'page') {
      for (const pageKey in data[key] as any) {
        logger.debug(`Updating ${pageKey} key in phase page`);
        // @ts-ignore
        phase[key][pageKey] = data[key][pageKey];
      }
    } else {
      logger.debug(`Updating ${key} key in phase`);
      // @ts-ignore
      phase[key] = data[key];
    }
  }

  logger.debug('Saving updated phase');
  await phase.save();

  await new PhaseUpdatedPublisher(natsWrapper.client, logger).publish({
    name: phase.name,
    phaseId: phase.id,
    parentModuleId: phase.parentModule.id,
    parentCourseId: parentCourse.id,
  });
  logger.verbose('Sent Nats phase updated event');

  //@ts-ignore
  phase.parentModule = undefined;

  logger.info('Successfully updated phase');
  res.status(200).json({
    errors: false,
    message: lang.updatedPhase,
    phase,
  });
};

export default update;
