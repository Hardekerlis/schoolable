/** @format */

import nodemailer from 'nodemailer';
import { CONFIG } from '../library';

import { logger } from '../logger/logger';

async function createTestAccount() {
  const testAccount = await nodemailer.createTestAccount();
  return testAccount;
}

async function sendMail(email: string, subject: string, html: string) {
  try {
    const isDev = process.env.NODE_ENV === 'dev';
    let testAccount;
    if (isDev) {
      testAccount = createTestAccount();
    }

    const transporter = nodemailer.createTransport({
      host: testAccount ? 'smtp.ethereal.email' : CONFIG.smtpOptions.host,
      port: testAccount ? 587 : CONFIG.smtpOptions.port,
      secure: testAccount ? false : CONFIG.smtpOptions.secure,
      auth: {
        // @ts-ignore
        user: testAccount ? testAccount.user : CONFIG.smtpOptions.username,
        // @ts-ignore
        pass: testAccount ? testAccount.pass : CONFIG.smtpOptions.password,
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
