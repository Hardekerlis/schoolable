/** @format */

import nodemailer from 'nodemailer';
import { CONFIG } from '@schoolable/common';

import { logger } from '../logger/logger';

async function createTestAccount() {
  const testAccount = await nodemailer.createTestAccount();
  return testAccount;
}

async function sendMail(email: string, subject: string, html: string) {
  try {
    const isDev = process.env.NODE_ENV === 'dev';
    if (isDev) {
      const testAccount = createTestAccount();
    }

    const transporter = nodemailer.createTransport({
      host: isDev ? 'smtp.ethereal.email' : CONFIG.smtpOptions.host,
      port: isDev ? 587 : CONFIG.smtpOptions.port,
      secure: isDev ? false : CONFIG.smtpOptions.secure,
      auth: {
        // @ts-ignore
        user: isDev ? testAccount.user : CONFIG.smtpOptions.username,
        // @ts-ignore
        pass: isDev ? testAccount.pass : CONFIG.smtpOptions.password,
      },
    });

    let info = await transporter.sendMail({
      from: 'no-reply@schoolable.se',
      to: email,
      subject,
      html,
    });

    logger.info(`Email sent to ${email} with message id ${info.messageId}`);
  } catch (err) {
    logger.error(
      `Tried to send an email, encountered error. Error message: ${err}`,
    );
  }
}

export default sendMail;
