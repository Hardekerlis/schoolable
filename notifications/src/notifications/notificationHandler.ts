import { UserDoc } from '../models/user';
import { io } from '../sockets';

import CompileNotification from '../utils/notification';

interface Categories {
  main: string;
  secondary: string;
  sub: string;
}

const notifyUser = (user: UserDoc, notification: CompileNotification) => {
  const notifyUser = user.unsubscribedFrom!.find((val, index) => {
    // @ts-ignore
    const { main, secondary, sub } = val.notification.category;
    if (
      main === notification!.category.main &&
      // @ts-ignore
      secondary === notification!.category.secondary &&
      sub === notification!.category.sub
    ) {
      return true;
    }
  });

  return !!notifyUser;
};

const notificationHandler = {
  email: async (user: UserDoc, notification: CompileNotification) => {
    // TODO: Implemented email client + send email notification
    // NEED EMAIL CLIENT!!!!!!
  },
  app: async (user: UserDoc, notification: CompileNotification) => {
    const sockets = user.sockets!;

    if (notifyUser(user, notification) && sockets[0]) {
      for (const socketId of sockets) {
        const socket = io.sockets.sockets.get(socketId);

        if (socket) {
          socket.emit('notifications', {
            title: notification.title,
            body: notification.body,
            unsubscribeUrl: `http://dev.schoolable.se/unsubscribe/${notification.id}`,
            timestamp: notification.timestamp,
          });
        }
      }
    }
  },
};

export { notificationHandler };
