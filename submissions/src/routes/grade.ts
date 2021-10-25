import { Request, Response } from 'express';
import { LANG, NotAuthorizedError } from '@gustafdahl/schoolable-common';

import File, { Comment } from '../models/file';

import SubmissionGradedPublisher from '../events/publishers/submissionGradedPublishers';

import logger from '../utils/logger';
import { natsWrapper } from '../utils/natsWrapper';

const grade = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const { fileId, grade, comments } = req.body;
  const _lang = req.lang;
  const lang = LANG[_lang];

  logger.info('Updating grade');

  logger.debug('Looking up file');
  const file = await File.findById(fileId);

  if (!file) {
    logger.debug('No file found');
    return res.status(404).json({
      errors: false,
      message: lang.noFileFound,
    });
  }

  logger.debug('Checking if user is allowed to grade submission');
  if (file.grader !== currentUser?.id) {
    logger.debug('User is not allowed to grade submission');
    throw new NotAuthorizedError();
  }

  logger.debug('User is allowed to grade submission');

  logger.debug('Adding grade and comments to file');
  if (comments) file.comments = comments as Comment[];

  file.grade = grade;

  logger.debug('Saving grade and comments');
  await file.save();

  new SubmissionGradedPublisher(natsWrapper.client, logger).publish({
    userId: file.uploader,
    grade,
  });
  logger.debug('Published submission graded NATS event');

  logger.info('File successfully graded');
  res.status(200).json({
    errors: false,
    message: lang.submissionGraded,
  });
};

export default grade;
