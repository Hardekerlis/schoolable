import EventEmitter from 'events';

import { UserDoc } from '../../models/user';

const eventEmitter = new EventEmitter();

import { notificationHandler } from '../notificationHandler';

// Email
eventEmitter.on('notify', notificationHandler.email);

// App
eventEmitter.on('notify', notificationHandler.app);

export default eventEmitter;
