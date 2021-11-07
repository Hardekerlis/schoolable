import { Request, Response } from 'express';
import {
  UnexpectedError,
  NotAuthorizedError,
  ActionTypes,
  LANG,
} from '@gustafdahl/schoolable-common';

import CoursePage from '../models/coursePage';
import Course from '../models/course';
import User from '../models/user';

import CourseCreatedPublisher from '../events/publishers/courseCreated';
import { natsWrapper } from '../utils/natsWrapper';
import logger from '../utils/logger';

const create = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const { name } = req.body;

  const _lang = req.lang;
  const lang = LANG[_lang];

  logger.info('Starting course creation');

  const ownerId = currentUser?.id;

  logger.debug('Looking up if owner user exists');
  const ownerUser = await User.findById(ownerId);

  if (!ownerUser) {
    logger.info('No user found');
    throw new NotAuthorizedError();
  }

  logger.debug('Found user');

  logger.debug('Building coursePage');
  const coursePage = CoursePage.build({
    menu: [
      {
        title: 'Overview',
        value: 'overview',
        access: ['all'],
        actions: [
          {
            actionType: ActionTypes.LeftClick,
            goTo: 'this.overview',
          },
        ],
        removeable: false,
      },
      // Every menu item below is just for example
      // TODO: Remove example menu items
      {
        title: 'Modules',
        value: 'modules',
        access: ['all'],
        actions: [
          {
            actionType: ActionTypes.LeftClick,
            goTo: 'this.modules',
          },
        ],
        removeable: false,
      },
      {
        title: 'Attendees',
        value: 'attendees',
        access: ['all'],
        actions: [
          {
            actionType: ActionTypes.LeftClick,
            goTo: 'this.attendees',
          },
        ],
      },
      {
        title: 'Assignments',
        value: 'assignments',
        access: ['all'],
        actions: [
          {
            actionType: ActionTypes.LeftClick,
            goTo: 'this.assignments',
          },
        ],
      },
      {
        title: 'Schedule',
        value: 'schedule',
        access: ['all'],
        actions: [
          {
            actionType: ActionTypes.LeftClick,
            goTo: 'this.schedule',
          },
        ],
      },
    ],
  });

  logger.debug('Trying to save coursePage');
  try {
    await coursePage.save();
    logger.debug('Successfully saved coursePage');

    logger.debug('Building course');
    const course = Course.build({
      name: name as string,
      owner: ownerUser,
      coursePage: coursePage,
    });

    logger.debug('Trying to save course');
    await course.save();

    logger.debug('Successfully saved course');

    // Couldnt get nats mock to work
    // Code is only ran if its not test environment
    // if (process.env.NODE_ENV !== 'test') {
    // Publishes event to nats service
    await new CourseCreatedPublisher(natsWrapper.client, logger).publish({
      courseId: course.id as string,
      name: course.name,
      owner: course.owner.id,
    });

    logger.verbose('Sent Nats course created event');
    // }

    logger.info('Course successfully created. Responding user');
    res.status(201).json({
      errors: false,
      message: lang.createdCourse,
      course,
      owner: currentUser?.name,
    });
  } catch (err) {
    logger.error(
      `Ran into an error while trying to save coursePage. Error message: ${err}`,
    );
    throw new UnexpectedError();
  }
};

export default create;
