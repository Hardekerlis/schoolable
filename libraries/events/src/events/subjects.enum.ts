/** @format */

export enum Subjects {
  UserCreated = 'user:created',
  UserUpdated = 'user:updated',
  UserLogin = 'user:login',
  UserLogout = 'user:logout',
  UserRemoved = 'user:removed',
  UserQueueRemove = 'user:queueRemove',

  CourseCreated = 'course:created',
  CourseUpdated = 'course:updated',
  CourseRemoved = 'course:removed',
  CourseQueueRemove = 'course:queueRemove',

  PhaseCreated = 'phase:created',
  PhaseUpdated = 'phase:updated',
  PhaseRemoved = 'phase:removed',
  PhaseQueueRemove = 'phase:queueRemove',

  RemoveCourse = 'remove:course',
  RemoveUser = 'remove:user',
}
