import { Request, Response } from 'express';
import {
  LANG,
  BadRequestError,
  InvalidObjectIdError,
  UserPayload,
  NotAuthorizedError,
  DocumentNotFoundError,
  UserTypes,
  CONFIG,
  UnexpectedError,
} from '@gustafdahl/schoolable-common';
import { isValidObjectId } from 'mongoose';

import Phase from '../models/phase';
import File from '../models/file';

import logger from '../utils/logger';
import backblaze from '../utils/b2';
import { natsWrapper } from '../utils/natsWrapper';

import { SubmissionUploadedPublisher } from '../events';

interface ReturnData {
  fileName?: string;
  contentType?: string;
  phaseId?: string;
  uploadTimestamp?: string;
}

const upload = async (req: Request, res: Response) => {
  const lang = LANG[`${req.lang}`];
  const currentUser = req.currentUser as UserPayload;
  const { phaseId } = req.body;

  logger.info('Starting upload of file(s)');

  // @ts-ignore
  if (!(req.files[0] as Express.Multer.File)) {
    logger.debug('No files found in request');

    throw new BadRequestError(lang.needFiles);
  }

  logger.debug('Checking if phase id is a valid object id');
  if (!isValidObjectId(phaseId)) {
    logger.warn('Phase id is not a valid object id ');
    throw new InvalidObjectIdError(lang.noPhase);
  }

  logger.debug('Looking up phase and populating parents');
  const phase = await Phase.findById(phaseId).populate({
    path: 'parentModule',
    populate: {
      path: 'parentCourse',
    },
  });

  if (!phase) {
    logger.warn('No phase found');
    throw new DocumentNotFoundError(lang.noPhase);
  }

  logger.debug('Checking if user is application admin');
  if (currentUser.userType !== UserTypes.Admin) {
    logger.debug('User is not application admin');

    logger.debug('Checking if user is a student of course');
    if (!phase.parentModule!.parentCourse!.students!.includes(currentUser.id)) {
      logger.warn('User is not a student of course');
      throw new NotAuthorizedError();
    }

    logger.debug('User is student of course');
  } else logger.debug('User is application admin');

  let returnData: ReturnData[] = [];

  logger.debug('Authenticating for backblaze');
  await backblaze.authorize();

  logger.debug('Fetching buckets from backblaze');
  const {
    data: { buckets },
  } = await backblaze.getBucket({ bucketName: CONFIG.bucket.name });

  logger.debug('Checking if bucket was found');
  if (buckets[0]) {
    logger.debug('Bucket found');

    let index = 1;
    const uploadStartTs = +new Date();

    logger.debug('Looping through files');
    for (const file of req.files as any) {
      logger.debug(`Uploading file ${index} out of ${req.files!.length}`);
      index++;

      const { originalname } = file;

      logger.debug('Getting upload url and authorization token');
      const {
        data: { uploadUrl, authorizationToken },
      } = await backblaze.getUploadUrl({ bucketId: buckets[0].bucketId });

      const fileName = `${phase.parentModule.parentCourse.id}/${phase.parentModule.id}/${phase.id}/${currentUser.id}/${originalname}`;

      logger.debug('Uploading file to backbalze');
      const { data } = await backblaze.uploadFile({
        uploadUrl: uploadUrl,
        uploadAuthToken: authorizationToken,
        fileName: fileName,
        data: file.buffer,
        mime: file.mimetype,
      });

      logger.debug('Building file refrence in database');
      const newFile = File.build({
        fileName: originalname,
        b2FileId: data.fileId,
        b2BucketId: data.bucketId,
        contentType: data.contentType,
        uploadTimestamp: data.uploadTimestamp,
        phase: phase,
        uploader: currentUser.id,
      });

      logger.debug('Saving file reference');
      await newFile.save();

      await new SubmissionUploadedPublisher(natsWrapper.client, logger).publish(
        {
          userId: currentUser.id,
          fileName: originalname,
          fileId: newFile.id,
        },
      );

      returnData.push({
        fileName: originalname,
        contentType: data.contentType,
        phaseId: phase.id,
        uploadTimestamp: data.uploadTimestamp,
      });
    }

    logger.info(
      `Upload(s) finished. It took ${+new Date() - uploadStartTs} ms`,
    );

    res.status(201).json({
      errors: false,
      message: lang.uploaded,
      data: returnData,
    });
  } else {
    logger.error('No bucket found. This should never happen!');
    throw new UnexpectedError();
  }
};

export default upload;
