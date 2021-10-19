// import { Request, Response } from 'express';
// import { BadRequestError } from '@gustafdahl/schoolable-errors';
// import { LANG } from '@gustafdahl/schoolable-loadlanguages';
//
// import UserLogoutEvent from '../events/userLogout';
// import { natsWrapper } from '../utils/natsWrapper';
// import logger from '../utils/logger';
//
// const logout = async (req: Request, res: Response) => {
//   const currentUser = req.currentUser;
//   const _lang = req.lang;
//   const lang = LANG[_lang];
//
//   logger.info('Checking if user is logged in before attempting to logout');
//
//   // Check if user is logged in
//   if (!currentUser) {
//     throw new BadRequestError(lang.notLoggedIn);
//   }
//
//   logger.info('Clearing users cookie');
//   res.clearCookie('token');
//
//   // Couldnt get nats mock to work
//   // Code is only ran if its not test environment
//   if (process.env.NODE_ENV !== 'test') {
//     // Publishes event to nats service
//     new UserLogoutEvent(natsWrapper.client, logger).publish({
//       userId: currentUser.id,
//     });
//     logger.info('Sent Nats logout event');
//   }
//
//   logger.info('Logged user out');
//   res.status(200).json({
//     errors: false,
//     message: lang.loggedOut,
//   });
// };
//
// export default logout;
