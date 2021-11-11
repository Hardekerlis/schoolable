import nats, { Stan } from 'node-nats-streaming';
import logger from './logger';

class NatsWrapper {
  private _client?: Stan;

  get client() {
    if (!this._client) {
      throw new Error('Cannot access NATS client before connecting');
    }

    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, {
      url,
      connectTimeout: 20 * 1000, //10s
    });

    return new Promise((resolve, reject) => {
      this.client.on('connect', () => {
        logger.info('Connected to NATS');
        resolve('');
      });

      this.client.on('error', (err) => {
        reject(err);
      });
    });
  }
}

export const natsWrapper = new NatsWrapper();
