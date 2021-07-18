/** @format */

import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class Password {
  /*
    Hash string with salt
    @param {string} password to be hashed
    @returns {string} returns the complete hash
  */
  static async toHash(password: string) {
    const salt = randomBytes(8).toString('hex');
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;

    return `${buf.toString('hex')}.${salt}`;
  }

  /*
    Compare password with stored password. Used when checking a password
    supplied by user
    @param {string} the hashed password stored in the database
    @param {string} the plain text password supplied by user
    @returns {boolean} whether or not the hashed password and the plain text
    password match
  */
  static async compare(storedPassword: string, suppliedPassword: string) {
    const [hash, salt] = storedPassword.split('.');

    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

    return buf.toString('hex') === hash;
  }
}
