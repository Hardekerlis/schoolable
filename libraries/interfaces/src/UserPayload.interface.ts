/** @format */

import { UserTypes } from '@gustafdahl/schoolable-enums';

export interface UserPayload {
  email: string;
  sessionId: string;
  id: string;
  userType: UserTypes;
  name: {
    first: string;
    last: string;
  };
  lang: string;
}
