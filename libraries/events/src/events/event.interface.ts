/** @format */

import { Subjects } from './subjects.enum';

export interface Event {
  subject: Subjects;
  data: any;
}
