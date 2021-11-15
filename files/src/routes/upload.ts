import { Request, Response } from 'express';
import {
  BadRequestError,
  LANG,
  UserPayload,
  NotAuthorizedError,
  UnexpectedError,
  CONFIG,
} from '@gustafdahl/schoolable-common';
import { isValidObjectId } from 'mongoose';
import { matchedData } from 'express-validator';

import logger from '../utils/logger';
import backblaze from '../utils/b2';

import File from '../models/file';
import Course, { CourseDoc } from '../models/course';
import User, { UserDoc } from '../models/user';
import Group, { GroupDoc } from '../models/group';

const upload = async (req: Request, res: Response) => {
  const currentUser = req.currentUser as UserPayload;
  const lang = LANG[`${req.lang}`];
  const body = matchedData(req, { locations: ['body'] });
  const { file } = req;

  logger.info('Attempting to upload file');

  logger.debug('Checking if a file is present in request');
  // @ts-ignore
  if (!(file as Express.Multer.File)) {
    logger.debug('No file found in request');
    throw new BadRequestError(lang.noAcceptedFile);
  }
  logger.debug('Found file');

  logger.debug('Checking if file name is long enough');
  if (file!.originalname.length <= 0) {
    logger.debug('Name is to short');
    return res.status(400).json({
      errors: [{ message: lang.nameToShort }],
    });
  }
  logger.debug('Name is long enough');

  const verifiedFileAccess = {
    courses: [] as CourseDoc[],
    users: [] as UserDoc[],
    groups: [] as GroupDoc[],
    public: false,
  };

  logger.debug('Checking if uploading user has defined access for file');
  // Access is going to be a stringified json object if access exists
  if (body.access) {
    logger.debug('User has defined access for file');
    const { access } = body;
    let courses, users, groups, _public;
    try {
      logger.debug('Trying to parse the json in the access variable');
      // Theses are the values which are going to exist in access
      const json = JSON.parse(access);
      courses = json.courses;
      users = json.users;
      groups = json.groups;
      _public = json.public;
    } catch (err) {
      logger.error('Failed to parse JSON');
      throw new BadRequestError(lang.invalidJson);
    }

    logger.debug('Checking if file should be public');
    if (!_public) {
      logger.debug('File should not be public');

      logger.debug('Checking if users is defined in access');
      if (users) {
        logger.debug('Users are defined in access');
        logger.debug('Looping through the users');
        for (const user of users) {
          logger.debug('Checkign if user id is a valid Object Id');
          if (!isValidObjectId(user)) {
            logger.warn('Invalid object id');
            continue;
          }

          logger.debug('Looking up user');
          const userDoc = await User.findById(user);

          if (userDoc) {
            logger.debug('Found user');
            verifiedFileAccess.users.push(userDoc);
          } else logger.debug('No user found');
        }
      }

      logger.debug('Checking if courses is defined in access');
      if (courses) {
        logger.debug('Users are defined in access');
        logger.debug('Looping through the courses');
        for (const course of courses) {
          logger.debug('Checkign if course id is a valid Object Id');
          if (!isValidObjectId(course)) {
            logger.warn('Invalid object id');
            continue;
          }

          logger.debug('Looking up course');
          const courseDoc = await Course.findById(course);

          if (courseDoc) {
            logger.debug('Found course');

            logger.debug('Checking if user is allowed to add course to file');
            if (
              courseDoc.owner !== currentUser.id &&
              !courseDoc.admins?.includes(currentUser.id)
            ) {
              logger.debug('User is not allowed to display file to course');
              throw new NotAuthorizedError();
            }
            logger.debug('User is allowed to display file to course');

            verifiedFileAccess.courses.push(courseDoc);
          } else logger.debug('No course found');
        }
      }

      logger.debug('Checking if groups is defined in access');
      if (groups) {
        logger.debug('Users are defined in access');
        logger.debug('Looping through the groups');
        for (const group of groups) {
          logger.debug('Checkign if group id is a valid Object Id');
          if (!isValidObjectId(group)) {
            logger.warn('Invalid object id');
            continue;
          }

          logger.debug('Looking up group');
          const groupDoc = await Group.findById(group);

          if (groupDoc) {
            logger.debug('Found group');
            verifiedFileAccess.groups.push(groupDoc);
          } else logger.debug('No group found');
        }
      }
    } else {
      logger.debug('File should be public');
      verifiedFileAccess.public = _public;
    }
  }

  const uploadStartTs = +new Date();

  logger.debug('Authorizing for backblaze b2');
  await backblaze.authorize();
  logger.debug('Authorized!');

  const fileName = `${currentUser?.id}/${req.file!.originalname}`;

  logger.debug('Getting backblaze storage bucket');
  const {
    data: { buckets },
  } = await backblaze.getBucket({ bucketName: CONFIG.bucket.name });

  if (buckets[0]) {
    logger.debug('Found storage bucket');

    logger.debug('Getting upload URL to backblaze bucket');
    const {
      data: { uploadUrl, authorizationToken },
    } = await backblaze.getUploadUrl({ bucketId: buckets[0].bucketId });

    logger.debug(`Uploading file with name ${file!.originalname} to backblaze`);
    const { data } = await backblaze.uploadFile({
      uploadUrl: uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName: fileName,
      data: file!.buffer as Buffer,
      mime: file?.mimetype,
    });
    logger.debug('Uploaded file to backblaze');

    logger.debug('Building file');
    const newFile = File.build({
      owner: currentUser.id,
      fileName: file?.originalname!,
      access: verifiedFileAccess,
      b2FileId: data.fileId,
      b2BucketId: data.bucketId,
      contentType: data.contentType,
      uploadTimestamp: data.uploadTimestamp,
    });

    logger.debug('Saving file');
    await newFile.save();

    logger.info(`Upload finished. It took ${+new Date() - uploadStartTs} ms`);

    const fileUrl = `https://${req.get('host')}/api/files/${newFile.id}`;

    logger.info('Successfully uploaded file');
    res.status(201).json({
      errors: false,
      message: lang.uploadedFile,
      url: fileUrl,
    });
  } else {
    logger.error('No bucket found');
    throw new UnexpectedError();
  }
};

export default upload;
