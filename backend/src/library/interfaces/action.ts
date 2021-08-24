/** @format */

import { ActionTypes } from '../enums/actionTypes';

export interface Action {
  actionType: ActionTypes;
  download?: string; // URL
  goTo?: string; // URL
  openMenu?: string;
}
