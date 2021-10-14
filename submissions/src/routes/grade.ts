import { Request, Response } from 'express';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';
import { NotAuthorizedError } from '@gustafdahl/schoolable-errors';

import File, { Comment } from '../models/file';

import SubmissionGradedPublisher from '../events/publishers/submissionGradedPublishers';

import logger from '../utils/logger';
import { natsWrapper } from '../utils/natsWrapper';

const grade = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const { fileId, grade, comments } = req.body;
  const _lang = req.lang;
  const lang = LANG[_lang];

  const file = await File.findById(fileId);

  if (!file) {
    return res.status(404).json({
      errors: false,
      message: lang.noFileFound,
    });
  }

  if (file.grader !== currentUser?.id) {
    throw new NotAuthorizedError();
  }

  if (comments) file.comments = comments as Comment[];

  file.grade = grade;

  await file.save();

  new SubmissionGradedPublisher(natsWrapper.client, logger).publish({
    userId: file.uploader,
    grade,
  });

  res.status(200).json({
    errors: false,
    message: lang.submissionGraded,
  });
};

export default grade;
