import { Request, Response } from 'express';
import {
  LANG,
  InvalidObjectIdError,
  DocumentNotFoundError,
  UserTypes,
  NotAuthorizedError,
} from '@gustafdahl/schoolable-common';
import { isValidObjectId } from 'mongoose';

import { CourseDoc } from '../models/course';
import Module from '../models/module';
import Phase from '../models/phase';
import PhasePage from '../models/phasePage';

import logger from '../utils/logger';
import { natsWrapper } from '../utils/natsWrapper';

import { PhaseCreatedPublisher } from '../events';

const create = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const lang = LANG[`${req.lang}`];
  const { parentModuleId, name } = req.body;

  logger.info('Attempting create a phase');

  logger.debug('Checking if parent module id is a valid object id');
  if (!isValidObjectId(parentModuleId)) {
    logger.debug('Parent module id is not a valid object id');
    throw new InvalidObjectIdError(lang.noModuleFound);
  }
  logger.debug('Parent module id is a valid object id');

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
  // @ts-ignore
  if (currentUser !== UserTypes.Admin) {
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

  logger.debug('Building phase page');
  const phasePage = PhasePage.build({});

  logger.debug('Saving phase page');
  await phasePage.save();

  logger.debug('Building phase');
  const phase = Phase.build({
    name,
    parentModule: _module,
    page: phasePage,
  });

  logger.debug('Saving phase');
  await phase.save();

  await new PhaseCreatedPublisher(natsWrapper.client, logger).publish({
    parentModuleId: _module.id,
    parentCourseId: (_module.parentCourse as CourseDoc).id,
    name: phase.name,
  });
  logger.verbose('Sent Nats phase created event');

  logger.info('Successfully created phase');

  res.status(201).json({
    errors: false,
    message: lang.createdPhase,
    phase,
  });
};

export default create;
