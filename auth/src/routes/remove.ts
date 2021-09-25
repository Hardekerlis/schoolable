import { Request, Response } from 'express';
import { UserTypes } from '@gustafdahl/schoolable-enums';
import {
  NotAuthorizedError,
  UnexpectedError,
} from '@gustafdahl/schoolable-errors';
import { CONFIG } from '@gustafdahl/schoolable-utils';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

import UserCreatedPublisher from '../events/userCreated';
import { natsWrapper } from '../utils/natsWrapper';
import User from '../models/user';
import UserSettings from '../models/userSettings';
import logger from '../utils/logger';

const register = async (req: Request, res: Response) => {};

export default register;
