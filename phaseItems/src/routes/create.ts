import { Request, Response } from 'express';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';
import { isValidObjectId } from 'mongoose';
import {
  NotFoundError,
  NotAuthorizedError,
} from '@gustafdahl/schoolable-errors';

import Course from '../models/course';
import Phase from '../models/phase';
import PhaseItem from '../models/phaseItem';

import { natsWrapper } from '../utils/natsWrapper';
import logger from '../utils/logger';

import PhaseItemCreatedPublisher from '../events/publishers/phaseItemCreated';

// TODO: Add logger and comments

const create = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const { name, phaseId, parentCourse } = req.body;
  const _lang = req.lang;
  const lang = LANG[_lang];

  if (!isValidObjectId(phaseId)) {
    return res.status(404).json({
      errors: false,
      message: lang.noPhase,
    });
  }

  if (!isValidObjectId(parentCourse)) {
    return res.status(404).json({
      errors: false,
      message: lang.noParentCourse,
    });
  }

  const course = await Course.findOne({ courseId: parentCourse });

  if (!course) {
    throw new NotFoundError();
  }

  if (
    course.owner !== currentUser?.id &&
    !course.admins?.includes(currentUser?.id as string)
  ) {
    throw new NotAuthorizedError();
  }

  const phase = await Phase.findOne({ phaseId });

  if (!phase) {
    throw new NotFoundError();
  }

  const phaseItem = PhaseItem.build({
    name,
    parentCourse: parentCourse,
    parentPhase: phaseId,
  });

  await phaseItem.save();

  if (process.env.NODE_ENV !== 'test') {
    // Publishes event to nats service
    new PhaseItemCreatedPublisher(natsWrapper.client, logger).publish({
      parentCourse: course.id as string,
      parentPhase: phase.id,
      phaseItemId: phaseItem.id,
      name,
    });

    logger.info('Sent Nats phase item queue remove event');
  }

  res.status(201).json({
    errors: false,
    message: lang.createdPhaseItem,
    phaseItem,
  });
};

export default create;
