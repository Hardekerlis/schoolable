import Queue from 'bull';
import { CONFIG } from '@gustafdahl/schoolable-common';

import { RemoveUserPublisher } from '../events/publishers/removeUser';
import { natsWrapper } from '../utils/natsWrapper';
import logger from '../utils/logger';

interface Payload {
  userId: string;
  removingAdmin: string;
}

const removeUserQueue = new Queue<Payload>('remove:user', {
  redis: {
    host: CONFIG.redis.host,
  },
});

removeUserQueue.process(async (job) => {
  new RemoveUserPublisher(natsWrapper.client, logger).publish({
    userId: job.data.userId,
    removingAdmin: job.data.removingAdmin,
  });
});

export default removeUserQueue;
