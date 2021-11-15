import {
  Listener,
  Subjects,
  GroupCreatedEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from '../queueGroupName';
import Group from '../../../models/group';
import logger from '../../../utils/logger';

export class GroupCreatedListener extends Listener<GroupCreatedEvent> {
  subject: Subjects.GroupCreated = Subjects.GroupCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: GroupCreatedEvent['data'], msg: Message) {
    const { groupId, name, users } = data;

    logger.info('Creating group reference');

    logger.debug('Building group');
    const group = Group.build({ id: groupId, name, users });

    logger.debug('Saving group');
    await group.save();

    logger.info('Successfully created group reference');
    msg.ack();
  }
}
