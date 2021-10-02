import Queue from 'bull';
import { CONFIG } from '@gustafdahl/schoolable-utils';

import { RemovePhasePublisher } from '../events/publishers/removePhase';
import { natsWrapper } from '../utils/natsWrapper';
import logger from '../utils/logger';

interface Payload {
  parentCourse: string;
  phaseId: string;
}

const removeCourseQueue = new Queue<Payload>('remove:course', {
  redis: {
    host: CONFIG.redis.host,
  },
});

removeCourseQueue.process(async (job) => {
  new RemovePhasePublisher(natsWrapper.client, logger).publish({
    parentCourse: job.data.parentCourse,
    phaseId: job.data.phaseId,
  });
});

export default removeCourseQueue;
