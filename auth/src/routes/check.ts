import { Request, Response } from 'express';
import { BadRequestError } from '@gustafdahl/schoolable-errors';
import { LANG } from '@gustafdahl/schoolable-loadlanguages';

const check = (req: Request, res: Response) => {
  const { currentUser } = req;
  const _lang = req.lang;
  const lang = LANG[_lang];
  console.log(currentUser);
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
