/** @format */

import nodemailer from 'nodemailer';

import { CONFIG } from '../lib/misc/config';

async function createTestAccount() {
  const testAccount = await nodemailer.createTestAccount();
  return testAccount;
}

export = async function sendMail() {
  const isDev = process.env.NODE_ENV === 'dev';
  if (isDev) {
    const testAccount = createTestAccount();
  }

  const transporter = nodemailer.createTransport({
    host: isDev ? 'smtp.ehereal.email' : CONFIG.emailService.host,
    port: isDev ? 587 : CONFIG.emailService.port,
    secure: isDev ? false : CONFIG.emailService.secure,
    auth: {
      // @ts-ignore
      user: isDev ? testAccount.user : CONFIG.emailService.username,
      // @ts-ignore
      pass: isDev ? testAccount.pass : CONFIG.emailService.password,
    },
  });
};
