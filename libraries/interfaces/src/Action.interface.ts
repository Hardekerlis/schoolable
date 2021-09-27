/** @format */

import { ActionTypes } from '@gustafdahl/schoolable-enums';

export interface Action {
  actionType: ActionTypes;
  download?: string;
  goTo?: string;
  openMenu?: string;
}
