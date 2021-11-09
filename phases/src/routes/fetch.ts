import { Request, Response } from 'express';
import {
  LANG,
  InvalidObjectIdError,
  DocumentNotFoundError,
  UserTypes,
  NotAuthorizedError,
  BadRequestError,
  CONFIG,
  UserPayload,
} from '@gustafdahl/schoolable-common';
import { isValidObjectId } from 'mongoose';

import Module from '../models/module';
import Phase from '../models/phase';
import { CourseDoc } from '../models/course';

import logger from '../utils/logger';

const fetch = {
  many: async (req: Request, res: Response) => {
    const currentUser = req.currentUser as UserPayload;
    const lang = LANG[`${req.lang}`];

    logger.info('Attempting to fetch phases');

    logger.debug('Getting query');
    const url = new URL(`http://localhost:3000${req.url}`);
    const parentModuleId = url.searchParams.get('module_id');

    logger.debug('Checking if query is a valid object id');
    if (!isValidObjectId(parentModuleId)) {
      logger.debug('Query is not a valid object id');
      throw new InvalidObjectIdError(lang.noModuleFound);
    }
    logger.debug('Query is a valid object id');

    logger.debug('Fetching module from database');
    const _module = await Module.findById(parentModuleId).populate(
      'parentCourse',
    );

    if (!_module) {
      logger.debug('No module found');
      throw new DocumentNotFoundError(lang.noModuleFound);
    }
    logger.debug('Found module');

    const parentCourse = (_module.parentCourse as CourseDoc)!;

    logger.debug('Checking if user is an application admin');
    if (currentUser.userType !== UserTypes.Admin) {
      logger.debug('User is not application admin');
      logger.debug('Checking if user is allowed to fetch phases');
      if (
        parentCourse.owner.toString() !== currentUser?.id &&
        !parentCourse.students?.includes(currentUser?.id!) &&
        !parentCourse.admins?.includes(currentUser?.id!)
      ) {
        logger.debug('User is not allowed to fetch phases');
        throw new NotAuthorizedError();
      }
      logger.debug('User is allowed to fetch phases');
    } else logger.debug('User is an application admin');

    logger.debug('Fetching phases from database');
    // @ts-ignore
    const phases = await Phase.find({ parentModule: _module.id });

    if (!phases[0]) {
      logger.debug('No phases found');
      throw new DocumentNotFoundError(lang.noPhasesFound);
    }
    logger.debug('Found phases');

    logger.debug('Checking if user is a student');
    if (
      parentCourse.students?.includes(currentUser.id) &&
      currentUser.userType === UserTypes.Student
    ) {
      logger.debug('User is a student');
      logger.debug('Removing all hidden phases from response');
      for (const phase of phases) {
        if (phase.hidden) {
          phases.splice(phases.indexOf(phase), 1);
        }
      }
      logger.debug('Removed all hidden phases');
    }

    logger.info('Successfully fetched phases');

    res.status(200).json({
      errors: false,
      message: lang.fetchedPhases,
      phases,
    });
  },
  one: async (req: Request, res: Response) => {
    const currentUser = req.currentUser as UserPayload;
    const lang = LANG[`${req.lang}`];
    const { phaseId } = req.params;

    logger.info('Attempting to fetch phase');

    logger.debug('Checking if phase id is a valid object id');
    if (!isValidObjectId(phaseId)) {
      logger.debug('Phase id is not a valid object id');
      throw new InvalidObjectIdError(lang.noPhaseFound);
    }
    logger.debug('Phase id is a valid object id');

    logger.debug('Fetching phase from database');
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
      logger.debug('Checking if user is allowed to fetch phases');
      if (
        parentCourse.owner.toString() !== currentUser?.id &&
        !parentCourse.students?.includes(currentUser?.id!) &&
        !parentCourse.admins?.includes(currentUser?.id!)
      ) {
        logger.debug('User is not allowed to fetch phases');
        throw new NotAuthorizedError();
      }
      logger.debug('User is allowed to fetch phases');
    } else logger.debug('User is an application admin');

    logger.debug('Checking if user is a student');
    if (
      parentCourse.students?.includes(currentUser.id) &&
      currentUser.userType === UserTypes.Student
    ) {
      logger.debug('User is a student');
      logger.debug('Checking if phase is hidden');
      if (phase.hidden) {
        logger.debug('User is not allowed to see this phase');
        throw new DocumentNotFoundError(lang.noPhaseFound);
      }
      logger.debug('Phase is not hidden');
    }

    phase.parentModule = undefined;

    logger.info('Successfully fetched phase');
    res.status(200).json({
      errors: false,
      message: lang.fetchedPhase,
      phase,
    });
  },
};

export default fetch;
