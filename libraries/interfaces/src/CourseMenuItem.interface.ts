/** @format */

import { Action } from './';

export interface CourseMenuItem {
  icon?: string; // Url to image
  access: string[]; // What user(s) can see this MenuItem
  actions: Action[]; // What actions are possible for this MenuItem
  title: string;
  value: string;
  removeable: boolean;
}
