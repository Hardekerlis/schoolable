import { Request, Response } from 'express';
import { LANG } from '@gustafdahl/schoolable-common';

import Group from '../models/group';

import logger from '../utils/logger';

const fetch = async (req: Request, res: Response) => {
  const lang = LANG[`${req.lang}`];

  logger.info('Attempting to fetch groups');

  logger.debug('Getting query');
  const url = new URL(`http://localhost:3000${req.url}`);
  const name = url.searchParams.get('name');

  logger.debug('Looking up groups');
  const groups = await Group.find({ name: name as string }).limit(10);

  if (!groups[0]) {
    logger.debug("Couldn't find any groups");
    return res.status(404).json({
      errors: false,
      message: lang.noGroupsFound,
      groups: [],
    });
  }
  logger.debug('Found groups');

  logger.info('Successfully fetched groups');
  res.status(200).json({
    errors: false,
    message: lang.foundGroups,
    groups,
  });
};

export default fetch;
