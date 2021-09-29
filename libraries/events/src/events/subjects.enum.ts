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

  RemoveCourse = 'remove:course',
  RemoveUser = 'remove:user',
}
