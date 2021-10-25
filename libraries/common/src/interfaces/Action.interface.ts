/** @format */

import { ActionTypes } from "../"

export interface Action {
  actionType: ActionTypes;
  download?: string;
  goTo?: string;
  openMenu?: string;
}
