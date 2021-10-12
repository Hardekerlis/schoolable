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

import logger from '../utils/logger';
import b2 from '../utils/b2';

const upload = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const { phaseItemId, parentPhase, parentCourse } = req.body;
  const _lang = req.lang;
  const lang = LANG[_lang];

  // @ts-ignore
  if (!(req.files[0] as Express.Multer.File)) {
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

  const course = await Course.findOne({ courseId: parentCourse });

  if (!course) {
    logger.debug('No course parent course found');
    throw new NotFoundError();
  }

  logger.debug('Checking if user is application admin');
  if (currentUser?.userType !== UserTypes.Admin) {
    logger.debug('User is not application admin');
    logger.debug('Checking if user is allowed to update phase item');

    if (
      course.owner !== currentUser?.id &&
      !course.admins?.includes(currentUser?.id as string) &&
      !course.students?.includes(currentUser?.id as string)
    ) {
      logger.debug('User is not allowed to update phase item');
      throw new NotAuthorizedError();
    }
    logger.debug('User is allowed to update phase item');
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

  const phaseItem = await PhaseItem.findOne({
    phaseItemId,
    // parentPhase,
    // parentCourse,
  });

  if (!phaseItem) {
    throw new NotFoundError();
  }

  interface ReturnData {
    fileName?: string;
    contentType?: string;
    parentPhaseItemId?: string;
    uploadTimestamp?: string;
  }

  let returnData: ReturnData[] = [];
  if (process.env.NODE_ENV !== 'test') {
    await b2.authorize();
    let {
      data: { buckets },
    } = await b2.getBucket({ bucketName: CONFIG.bucket.name });

    if (buckets[0]) {
      for (const file of req.files as Express.Multer.File[]) {
        let {
          data: { uploadUrl, authorizationToken },
        } = await b2.getUploadUrl({
          bucketId: buckets[0].bucketId,
        });

        const fileName = `${phaseItemId}/${currentUser?.name.first}-${currentUser?.name.last}/${file.originalname}`;

        const { data } = await b2.uploadFile({
          uploadUrl: uploadUrl,
          uploadAuthToken: authorizationToken,
          fileName: fileName,
          data: file.buffer,
          mime: file.mimetype,
        });

        returnData.push({
          fileName: file.originalname,
          contentType: data.contentType,
          parentPhaseItemId: phaseItemId,
          uploadTimestamp: data.uploadTimestamp,
        });
      }
    } else throw new UnexpectedError();
  }

  res.status(201).json({
    errors: false,
    message: lang.uploaded,
    data: returnData,
  });
};

export default upload;
