import { Request, Response } from 'express';
import { LANG } from '@gustafdahl/schoolable-common';

import Group from '../models/group';

import logger from '../utils/logger';
import { natsWrapper } from '../utils/natsWrapper';

import { GroupRemovedPublisher } from '../events/publishers';

const remove = async (req: Request, res: Response) => {
  const lang = LANG[`${req.lang}`];
  const { groupId } = req.body;

  logger.info('Attempting to remove group');

  logger.debug('Looking up group and removing it');
  const removedGroup = await Group.findByIdAndRemove(groupId);

  if (!removedGroup) {
    logger.debug('No group found');
    return res.status(404).json({
      errors: false,
      message: lang.noGroupFound,
    });
  }
  logger.debug('Found group and removed it');

  if (process.env.NODE_ENV !== 'test') {
    // Publishes event to nats service
    new GroupRemovedPublisher(natsWrapper.client, logger).publish({
      groupId: removedGroup.id,
    });

    logger.verbose('Sent Nats group created event');
  }

  logger.info('Successfully removed group');

  res.status(200).json({
    errors: false,
    message: lang.removedGroup,
  });
};

export default remove;
