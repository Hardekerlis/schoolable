/** @format */

import { UserTypes } from '@gustafdahl/schoolable-enums';

export interface UserPayload {
  email: string;
  id: string;
  userType: UserTypes;
  sessionId: string;
  lang: string;
}
