import { Yaml } from '@gustafdahl/schoolable-common';
import mongoose from 'mongoose';

import Notification from '../models/notification';

import logger from '../utils/logger';
const loadNotifications = async () => {
  logger.info('Loading notifications');

  logger.debug('Loading notifications file');
  const notifications = Yaml.load(
    __dirname.substring(0, __dirname.indexOf(`/${process.env.PARENT_FOLDER}`)) +
      '/notifications/notifications.yml',
  );

  const amountOfNotifications = Object.keys(notifications).length;

  logger.debug('Checking how many notifications are stored in the database');
  const amountOfDocuments = await Notification.countDocuments();

  logger.debug(
    'Checking if there are less notifications in database than in notifications file',
  );
  if (amountOfNotifications > amountOfDocuments) {
    const diff = amountOfNotifications - amountOfDocuments;
    logger.debug(
      `There are ${diff} less notifications in database than in file`,
    );

    logger.debug('Adding missing notifications to database');
    for (let i = 0; i < diff; i++) {
      const docIndex = i + amountOfDocuments;
      // @ts-ignore
      const notification = notifications[`${docIndex}`];

      const newNotification = Notification.build({
        index: docIndex,
        muteable: notification.muteable,
        types: notification.types,
        category: {
          main: notification.category.main,
          secondary: notification.category.secondary,
          sub: notification.category.sub,
        },
        title: notification.title,
        body: notification.body,
      });

      await newNotification.save();
    }

    logger.info(`Added ${diff} notifications to database`);

    return;
  } else if (amountOfNotifications < amountOfDocuments) {
    logger.debug('There are more notifications in database..');
    logger.debug('Reloading database');

    logger.debug('Droping database');
    await mongoose.connection.dropCollection('notifications');

    loadNotifications();
    return;
  } else {
    logger.info(
      'There is an equal (or more) notifications in database as in notifications file.',
    );
    return;
  }
};

export default loadNotifications;
