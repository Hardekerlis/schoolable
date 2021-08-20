/** @format */

import fs from 'fs';
import mkdirp from 'mkdirp';
import { randomBytes } from 'crypto';
import dotenv from 'dotenv';
import { dirname as getDirname } from 'path';

export class Secrets {
  static path = `${__dirname}/secrets`;

  /*
    Generate secret key
    Example use case could be a secret for jsonwebtoken
    @param {string} name of file and name of key to to be saved into process.env
  */
  static async generateKeySecret(name: string) {
    const secret = randomBytes(32).toString('base64');

    name = name.toUpperCase();
    try {
      await mkdirp(getDirname(`${this.path}/${name}.env`));
      fs.writeFileSync(`${this.path}/${name}.env`, `${name}=${secret}`);
    } catch (err) {
      console.error(err);
    }
  }

  /*
    Load secret into process.env
    @param {string} name of file to load
  */
  static loadSecret(name: string) {
    name = name.toUpperCase();
    dotenv.config({ path: `${this.path}/${name}.env` });
  }
}
