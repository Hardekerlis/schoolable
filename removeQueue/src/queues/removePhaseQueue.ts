import Queue from 'bull';
import { CONFIG } from '@gustafdahl/schoolable-common';

import { RemovePhasePublisher } from '../events/publishers/removePhase';
import { natsWrapper } from '../utils/natsWrapper';
import logger from '../utils/logger';

interface Payload {
  parentCourseId: string;
  parentModuleId: string;
  phaseId: string;
}

const removePhaseQueue = new Queue<Payload>('remove:phase', {
  redis: {
    host: CONFIG.redis.host,
  },
});

removePhaseQueue.process(async (job) => {
  new RemovePhasePublisher(natsWrapper.client, logger).publish({
    parentCourseId: job.data.parentCourseId,
    parentModuleId: job.data.parentModuleId,
    phaseId: job.data.phaseId,
  });
});

export default removePhaseQueue;
