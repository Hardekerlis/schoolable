import { Request, Response } from 'express';
import B2 from 'backblaze-b2';
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

  if (!req.files[0]) {
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

  const phaseItem = await PhaseItem.findOne({
    phaseItemId,
    parentPhase,
    parentCourse,
  });

  // console.log(phaseItem, phaseItemId, parentPhase, parentCourse);

  if (!phaseItem) {
    throw new NotFoundError();
  }

  await b2.authorize();
  let {
    data: { buckets },
  } = await b2.getBucket({ bucketName: CONFIG.bucket.name });

  if (buckets[0]) {
    for (const file of req.files) {
      let {
        data: { uploadUrl, authorizationToken },
      } = await b2.getUploadUrl({
        bucketId: buckets[0].bucketId,
      });

      console.log(uploadUrl);
      console.log(authorizationToken);

      // const asd = await b2.uploadFile({
      //   uploadUrl,
      //   authorizationToken,
      // });
    }

    res.status(202).send();
  } else throw new UnexpectedError();
  // let uploadUrl = await b2.getUploadUrl({
  //   bucketId: response.data.buckets[0].bucketId,
  // });
  //
  // const res1 = await b2.uploadFile({
  //   uploadUrl: uploadUrl.data.uploadUrl,
  //   uploadAuthToken: uploadUrl.data.authorizationToken,
  //   fileName: 'test',
  //   data: req.files[0]?.buffer,
  // });
};

export default upload;
