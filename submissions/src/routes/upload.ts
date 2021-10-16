import { Request, Response, Express } from 'express';
import { isValidObjectId } from 'mongoose';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';
import { UserTypes } from '@gustafdahl/schoolable-enums';
import {
  NotFoundError,
  NotAuthorizedError,
  BadRequestError,
  UnexpectedError,
} from '@gustafdahl/schoolable-errors';
import { CONFIG } from '@gustafdahl/schoolable-utils';

import Course from '../models/course';
import Phase from '../models/phase';
import PhaseItem from '../models/phaseItem';
import File from '../models/file';

import logger from '../utils/logger';
import b2 from '../utils/b2';

const upload = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const { phaseItemId, parentPhase, parentCourse } = req.body;
  const _lang = req.lang;
  const lang = LANG[_lang];

  logger.info('Starting upload of file(s)');
  // @ts-ignore
  if (!(req.files[0] as Express.Multer.File)) {
    logger.debug('No files found in request');
    throw new BadRequestError(lang.needFile);
  }

  if (!isValidObjectId(parentPhase)) {
    logger.debug('Parent phase id is not a valid ObjectId');
    return res.status(404).json({
      errors: false,
      message: lang.noPhase,
    });
  }

  if (!isValidObjectId(parentCourse)) {
    logger.debug('Parent course id is not a valid ObjectId');
    return res.status(404).json({
      errors: false,
      message: lang.noParentCourse,
    });
  }

  if (!isValidObjectId(phaseItemId)) {
    logger.debug('Phase item id is not a valid ObjectId');
    return res.status(404).json({
      errors: false,
      message: lang.noPhaseItem,
      phaseItems: [],
    });
  }

  logger.debug('Looking up paren course');
  const course = await Course.findOne({ courseId: parentCourse });

  if (!course) {
    logger.debug('No parent course found');
    throw new NotFoundError();
  }
  logger.debug('Parent course found');

  logger.debug('Checking if user is application admin');
  if (currentUser?.userType !== UserTypes.Admin) {
    logger.debug('User is not application admin');
    logger.debug('Checking if user is allowed to upload files to phase item');

    if (
      course.owner !== currentUser?.id &&
      !course.admins?.includes(currentUser?.id as string) &&
      !course.students?.includes(currentUser?.id as string)
    ) {
      logger.debug('User is not allowed to upload files to phase item');
      throw new NotAuthorizedError();
    }
    logger.debug('User is allowed to upload files to phase item');
  } else
    logger.debug(
      'User is application admin. Procceding without checking permissions',
    );

  logger.debug('Looking up parent phase');
  const phase = await Phase.findOne({ phaseId: parentPhase });

  if (!phase) {
    logger.debug('No parent phase found');
    throw new NotFoundError();
  }

  logger.debug('Parent phase found');

  logger.debug('Looking up phase item');
  const phaseItem = await PhaseItem.findOne({
    phaseItemId,
  });

  if (!phaseItem) {
    logger.debug('No phase item found');
    throw new NotFoundError();
  }
  logger.debug('Phase item found');

  interface ReturnData {
    fileName?: string;
    contentType?: string;
    parentPhaseItemId?: string;
    uploadTimestamp?: string;
  }

  let returnData: ReturnData[] = [];
  if (process.env.NODE_ENV !== 'test') {
    logger.debug('Authorizing for backblaze b2');
    // TODO: Don't run this every upload. Tokens are valid for 24 hours
    await b2.authorize();

    logger.debug('Authorized!');

    logger.debug('Getting backblaze storage bucket');
    let {
      data: { buckets },
    } = await b2.getBucket({ bucketName: CONFIG.bucket.name });

    if (buckets[0]) {
      logger.debug('Found storage bucket');

      logger.debug('Looping through uploaded files and uploading them');
      logger.debug(`Will loop ${req.files!.length} time(s)`);
      const uploadStartTs = +new Date();
      for (const file of req.files as Express.Multer.File[]) {
        const { originalname } = file;

        logger.debug('Getting upload URL to backblaze bucket');
        let {
          data: { uploadUrl, authorizationToken },
        } = await b2.getUploadUrl({
          bucketId: buckets[0].bucketId,
        });

        logger.debug('Retrieved upload URL');

        const fileName = `${phaseItemId}/${currentUser?.name.first}-${currentUser?.name.last}/${originalname}`;

        logger.debug(`Uploading file with name ${originalname} to backblaze`);
        const { data } = await b2.uploadFile({
          uploadUrl: uploadUrl,
          uploadAuthToken: authorizationToken,
          fileName: fileName,
          data: file.buffer,
          mime: file.mimetype,
        });

        logger.debug('Uploaded files to backblaze');

        logger.debug('Building database reference to file');
        const newFileDbRef = File.build({
          fileName: originalname,
          b2FileId: data.fileId,
          b2BucketId: data.bucketId,
          contentType: data.contentType,
          uploadTimestamp: data.uploadTimestamp,
          phaseItemId: phaseItem.phaseItemId,
          grader: course.owner,
          uploader: currentUser?.id as string,
        });

        logger.debug('Saving file reference');
        await newFileDbRef.save();
        logger.debug('Saved reference');

        returnData.push({
          fileName: originalname,
          contentType: data.contentType,
          parentPhaseItemId: phaseItemId,
          uploadTimestamp: data.uploadTimestamp,
        });
      }
      logger.info(
        `Upload(s) finished. It took ${+new Date() - uploadStartTs} ms`,
      );
    } else {
      logger.error('No Backblaze B2 storage bucket found');
      throw new UnexpectedError();
    }
  }

  logger.info('Successfully uploaded file(s). Returning to user');

  res.status(201).json({
    errors: false,
    message: lang.uploaded,
    data: returnData,
  });
};

export default upload;
