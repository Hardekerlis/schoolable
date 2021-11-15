import {
  Listener,
  Subjects,
  GroupRemovedEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from '../queueGroupName';
import Group from '../../../models/group';
import File from '../../../models/file';
import logger from '../../../utils/logger';

export class GroupRemovedListener extends Listener<GroupRemovedEvent> {
  subject: Subjects.GroupRemoved = Subjects.GroupRemoved;
  queueGroupName = queueGroupName;

  async onMessage(data: GroupRemovedEvent['data'], msg: Message) {
    const { groupId } = data;

    logger.info('Removing group reference');

    logger.debug('Looking up group and removing it');
    await Group.findByIdAndRemove(groupId);

    logger.debug('Looking up files');
    const files = await File.find({ access: { groups: groupId } });

    if (files[0]) {
      logger.debug('Found files');
      logger.debug(`Looping through ${files.length} files`);
      for (const file of files) {
        const index = file.access.groups.indexOf(groupId);

        logger.debug('Removing group from file');
        file.access.groups.splice(index, 1);

        logger.debug('Saving file');
        await file.save();
      }
    }

    logger.info('Successfully removed group');

    msg.ack();
  }
}
