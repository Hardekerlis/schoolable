import Queue from 'bull';
import { CONFIG } from '@gustafdahl/schoolable-utils';

import { RemoveCoursePublisher } from '../events/publishers/removeCourse';
import { natsWrapper } from '../utils/natsWrapper';

interface Payload {
  courseId: string;
}

const removeCourseQueue = new Queue<Payload>('remove:course', {
  redis: {
    host: CONFIG.redis.host,
  },
});

console.log(CONFIG.redis.host);

removeCourseQueue.process(async (job) => {
  new RemoveCoursePublisher(natsWrapper.client).publish({
    courseId: job.data.courseId,
  });
});

export default removeCourseQueue;
