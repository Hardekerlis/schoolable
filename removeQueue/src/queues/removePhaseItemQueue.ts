import Queue from 'bull';
import { CONFIG } from '@gustafdahl/schoolable-utils';

import { RemovePhaseItemPublisher } from '../events/publishers/removePhaseItem';
import { natsWrapper } from '../utils/natsWrapper';
import logger from '../utils/logger';

interface Payload {
  parentCourse: string;
  parentPhase: string;
  phaseItemId: string;
}

const removePhaseItemQueue = new Queue<Payload>('remove:phaseItem', {
  redis: {
    host: CONFIG.redis.host,
  },
});

removePhaseItemQueue.process(async (job) => {
  new RemovePhaseItemPublisher(natsWrapper.client, logger).publish({
    parentCourse: job.data.parentCourse,
    parentPhase: job.data.parentPhase,
    phaseItemId: job.data.phaseItemId,
  });
});

export default removePhaseItemQueue;
