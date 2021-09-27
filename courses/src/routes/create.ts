import { Request, Response } from 'express';
import { ActionTypes } from '@gustafdahl/schoolable-enums';
import { UnexpectedError } from '@gustafdahl/schoolable-errors';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';
import { CONFIG } from '@gustafdahl/schoolable-utils';

import CoursePage from '../models/coursePage';
import Course from '../models/course';

import logger from '../utils/logger';

const create = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const { name } = req.body;

  const _lang = req.lang;
  const lang = LANG[_lang];

  logger.info('Starting course creation');

  const ownerId = currentUser?.id;

  logger.info('Building coursePage');
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
      {
        title: 'Example 1',
        value: 'example_1',
        access: ['all'],
        actions: [
          {
            actionType: ActionTypes.RightClick,
            goTo: 'this.example_1',
          },
        ],
        removeable: false,
      },
      {
        title: 'Example 2',
        value: 'example_2',
        access: ['all'],
        actions: [
          {
            actionType: ActionTypes.LeftClick,
            goTo: 'this.example_2',
          },
        ],
        removeable: false,
      },
      {
        title: 'Example 3',
        value: 'example_3',
        access: ['all'],
        actions: [
          {
            actionType: ActionTypes.LeftClick,
            goTo: 'this.example_3',
          },
        ],
        removeable: false,
      },
    ],
  });

  logger.info('Trying to save coursePage');
  try {
    await coursePage.save();
    logger.info('Successfully saved coursePage');

    logger.info('Building course');
    const course = Course.build({
      name,
      owner: ownerId!,
      coursePage: coursePage,
    });

    logger.info('Trying to save course');
    await course.save();

    logger.info('Successfully saved course');

    logger.info('Course successfully created. Responding to user');
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
