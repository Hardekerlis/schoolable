import { Request, Response } from 'express';
import { BadRequestError, LANG } from '@gustafdahl/schoolable-common';

const check = async (req: Request, res: Response) => {
  const { currentUser } = req;
  const _lang = req.lang;
  const lang = LANG[_lang];

  if (!currentUser) {
    throw new BadRequestError(lang.notLoggedIn);
  }

  res.status(200).json({
    errors: false,
    message: lang.isLoggedIn,
    currentUser,
  });
};

export default check;
