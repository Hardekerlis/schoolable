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

const update = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const { phaseItemId, parentPhase, parentCourse } = req.body;
  const data = req.body;
  delete data.phaseItemId;
  delete data.parentPhase;
  delete data.parentCourse;
  const _lang = req.lang;
  const lang = LANG[_lang];

  if (!isValidObjectId(parentPhase)) {
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

  const phase = await Phase.findOne({ phaseId: parentPhase });

  if (!phase) {
    throw new NotFoundError();
  }

  const updatedPhaseItem = await PhaseItem.findByIdAndUpdate(
    phaseItemId,
    data,
    { new: true },
  );

  if (!updatedPhaseItem) {
    throw new NotFoundError();
  }

  res.status(200).json({
    errors: false,
    message: lang.updatedPhaseItem,
    phaseItem: updatedPhaseItem,
  });

  res.status(500).send();
};

export default update;
