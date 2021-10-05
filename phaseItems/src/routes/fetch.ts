import { Request, Response } from 'express';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';
import { isValidObjectId } from 'mongoose';
import {
  NotFoundError,
  NotAuthorizedError,
} from '@gustafdahl/schoolable-errors';
import { UserTypes } from '@gustafdahl/schoolable-enums';

import Course from '../models/course';
import Phase from '../models/phase';
import PhaseItem from '../models/phaseItem';

// TODO: Add logger

export const fetchMany = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const _lang = req.lang;
  const lang = LANG[_lang];
  const { phaseId, parentCourse } = req.body;

  if (!isValidObjectId(parentCourse)) {
    return res.status(404).json({
      errors: false,
      message: lang.noParentCourse,
      phaseItems: [],
    });
  }

  if (!isValidObjectId(phaseId)) {
    return res.status(404).json({
      errors: false,
      message: lang.noPhase,
      phaseItems: [],
    });
  }

  const course = await Course.findOne({ courseId: parentCourse });

  if (!course) {
    throw new NotFoundError();
  }

  if (currentUser?.userType !== UserTypes.Admin) {
    if (
      course.owner !== currentUser?.id &&
      !course.admins?.includes(currentUser?.id as string) &&
      !course.students?.includes(currentUser?.id as string)
    ) {
      throw new NotAuthorizedError();
    }
  }

  const phase = await Phase.findOne({ phaseId });

  if (!phase) {
    throw new NotFoundError();
  }

  // TODO: Fix so hidden phase items arent showed to students. same for phase and course services
  const phaseItems = await PhaseItem.find({
    parentPhase: phase.phaseId,
    parentCourse: phase.parentCourse,
  }).select('-parentCourse -parentPhase -paragraphs');

  if (!phaseItems[0]) {
    return res.status(404).json({
      errors: false,
      message: lang.noPhaseItems,
      phaseItems: [],
    });
  }

  res.status(200).json({
    errors: false,
    message: lang.foundPhaseItems,
    phaseItems,
  });
};

export const fetchOne = async (req: Request, res: Response) => {
  const { phaseItemId } = req.params;
  const { parentCourse, phaseId } = req.body;
  const { currentUser } = req;
  const _lang = req.lang;
  const lang = LANG[_lang];

  if (!isValidObjectId(parentCourse)) {
    return res.status(404).json({
      errors: false,
      message: lang.noParentCourse,
      phaseItems: [],
    });
  }

  if (!isValidObjectId(phaseId)) {
    return res.status(404).json({
      errors: false,
      message: lang.noPhase,
      phaseItems: [],
    });
  }

  if (!isValidObjectId(phaseItemId)) {
    return res.status(404).json({
      errors: false,
      message: lang.noPhaseItem,
      phaseItems: [],
    });
  }

  const course = await Course.findOne({ courseId: parentCourse });

  if (!course) {
    throw new NotFoundError();
  }

  if (currentUser?.userType !== UserTypes.Admin) {
    if (
      course.owner !== currentUser?.id &&
      !course.admins?.includes(currentUser?.id as string) &&
      !course.students?.includes(currentUser?.id as string)
    ) {
      throw new NotAuthorizedError();
    }
  }

  const phase = await Phase.findOne({ phaseId });

  if (!phase) {
    throw new NotFoundError();
  }

  // TODO: Fix so hidden phase items arent showed to students. same for phase and course services
  const phaseItem = await PhaseItem.findOne({
    id: phaseItemId,
    parentPhase: phase.phaseId,
    parentCourse: phase.parentCourse,
  }).select('-parentCourse -parentPhase');

  if (!phaseItem) {
    return res.status(404).json({
      errors: false,
      message: lang.noPhaseItem,
    });
  }

  res.status(200).json({
    errors: false,
    message: lang.foundPhaseItem,
    phaseItem,
  });
};
