import {
  Listener,
  Subjects,
  SubmissionUploadedEvent,
  LANG,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from '../queueGroupName';
import User from '../../../models/user';

import { io } from '../../../sockets';

import logger from '../../../utils/logger';

export class SubmissionUploadedListener extends Listener<SubmissionUploadedEvent> {
  subject: Subjects.SubmissionUploaded = Subjects.SubmissionUploaded;
  queueGroupName = queueGroupName;

  async onMessage(data: SubmissionUploadedEvent['data'], msg: Message) {
    const { courseName, moduleName, phaseName, fileNames, userId } = data;

    const userToNotify = await User.findById(userId);

    if (!userToNotify) {
      return msg.ack();
    }

    // TODO: Add check to make sure user wants this kind of notification

    if ((userToNotify.sockets as string[])[0]) {
      for (const socketId of userToNotify.sockets) {
        const socket = await io.sockets.sockets.get(socketId);

        const lang = LANG[`${socket.request.currentUser.lang}`];

        // socket.emit('notification', {
        //   header: lang.submissionUploaded.header,
        //   body: lang.submissionUploaded.body,
        //   files:
        // });
      }
    }

    msg.ack();
  }
}
