/** @format */

import { ActionTypes } from '../enums/actionTypes';

export interface Action {
  type: ActionTypes;
  download?: string; // URL
  goTo?: string; // URL
  openMenu?: string;
}
