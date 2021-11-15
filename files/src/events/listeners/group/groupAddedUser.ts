import {
  Listener,
  Subjects,
  GroupAddedUserEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from '../queueGroupName';
import Group from '../../../models/group';
import logger from '../../../utils/logger';

export class GroupAddedUserListener extends Listener<GroupAddedUserEvent> {
  subject: Subjects.GroupAddedUser = Subjects.GroupAddedUser;
  queueGroupName = queueGroupName;

  async onMessage(data: GroupAddedUserEvent['data'], msg: Message) {
    const { groupId, users } = data;

    logger.info(`Adding ${users.length} users to group reference`);

    logger.debug('Updting group');
    await Group.findByIdAndUpdate(groupId, {
      $push: { users: { $each: users } },
    });

    logger.info('Successfully added users to group');
    msg.ack();
  }
}
