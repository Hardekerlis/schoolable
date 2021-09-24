import { Request, Response } from 'express';
import { UserTypes } from '@gustafdahl/schoolable-enums';
import {
  NotAuthorizedError,
  UnexpectedError,
} from '@gustafdahl/schoolable-errors';
import { CONFIG, ConfigHandler } from '@gustafdahl/schoolable-utils';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

import { natsWrapper } from '../utils/natsWrapper';
import User from '../models/user';
import UserSettings from '../models/userSettings';

const register = async (req: Request, res: Response) => {
  const { email, userType, name } = req.body;
  const { currentUser } = req;

  if (currentUser && currentUser?.userType !== UserTypes.Admin)
    throw new NotAuthorizedError();

  const tempPassword = uuidv4();

  const userSettings = UserSettings.build({
    theme: 'dark',
    language: req.lang,
    notifications: [''],
  });

  try {
    await userSettings.save();

    const user = User.build({
      email,
      userType,
      name,
      password: tempPassword,
      settings: userSettings,
    });

    await user.save();

    const token = jwt.sign(
      {
        email: user.email,
        id: user.id,
        userType: user.userType,
        name: user.name,
        lang: user.settings.language,
      },
      process.env.JWT_KEY as string,
    );

    res.cookie('token', token);

    res.status(201).json({
      errors: false,
      message: 'Successfully registered user',
      user,
    });
  } catch (err) {
    console.error(err);
    throw new UnexpectedError();
  }
};

export default register;
