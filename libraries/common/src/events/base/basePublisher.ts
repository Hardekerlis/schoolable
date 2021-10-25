/** @format */

import { Stan } from 'node-nats-streaming';
import { Event } from '../events/';

interface Logger {
  info: Function;
}

export abstract class Publisher<T extends Event> {
  abstract subject: T['subject'];
  protected client: Stan;
  logger: Logger;

  constructor(client: Stan, logger: Logger) {
    this.client = client;
    this.logger = logger;
  }

  publish(data: T['data']): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) {
          return reject(err);
        }

        this.logger.info(`Event published to subject: ${this.subject}`);

        resolve();
      });
    });
  }
}
