import {
  Listener,
  Subjects,
  SubmissionUploadedEvent,
} from '@gustafdahl/schoolable-common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from '../queueGroupName';

import User from '../../../models/user';
import Notification from '../../../models/notification';

import eventEmitter from '../../../notifications/notificationEvent';

import logger from '../../../utils/logger';

import NotificationCompiler from '../../../utils/notification';

export class SubmissionUploadedListener extends Listener<SubmissionUploadedEvent> {
  subject: Subjects.SubmissionUploaded = Subjects.SubmissionUploaded;
  queueGroupName = queueGroupName;

  async onMessage(data: SubmissionUploadedEvent['data'], msg: Message) {
    const { courseName, moduleName, phaseName, fileNames, userId } = data;

    const userToNotify = await User.findById(userId);

    if (!userToNotify) {
      return msg.ack();
    }

    const notification = await Notification.findOne({
      main: 'course',
      secondary: 'secondary',
      sub: 'upload',
    });

    if (!notification) {
      logger.error('No notification found. This is an error');
    }

    const compiledNotification = new NotificationCompiler({
      title: notification!.title,
      body: notification!.body,
      category: notification!.category,
    }).setLanguage(userToNotify.lang);

    compiledNotification.replaceBodyPlaceholders({
      files: fileNames.join(' '),
      courseName,
      moduleName,
      phaseName,
    });

    eventEmitter.emit('notify', userToNotify, compiledNotification);

    msg.ack();
  }
}
