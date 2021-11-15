import {
  Listener,
  Subjects,
  GroupRemovedUserEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from '../queueGroupName';
import Group from '../../../models/group';
import logger from '../../../utils/logger';

export class GroupRemovedUserListener extends Listener<GroupRemovedUserEvent> {
  subject: Subjects.GroupRemovedUser = Subjects.GroupRemovedUser;
  queueGroupName = queueGroupName;

  async onMessage(data: GroupRemovedUserEvent['data'], msg: Message) {
    const { groupId, users } = data;

    logger.info(`Removing ${users.length} users from group reference`);

    logger.debug('Updting group');
    await Group.findByIdAndUpdate(groupId, { $pullAll: { users: users } });

    logger.info('Successfully removed users from group');
    msg.ack();
  }
}
