/** @format */

export enum Subjects {
  UserCreated = 'user:created',
  UserUpdated = 'user:updated',
  UserRemoved = 'user:removed',
  UserQueueRemove = 'user:queueRemove',

  CourseCreated = 'course:created',
  CourseUpdated = 'course:updated',
  CourseRemoved = 'course:removed',
  CourseQueueRemove = 'course:queueRemove',
  CourseAddedAdmin = 'course:addedAdmin',
  CourseRemovedAdmin = 'course:removedAdmin',
  CourseAddedStudent = 'course:addedStudent',
  CourseRemovedStudent = 'course:removedStudent',

  ModuleCreated = 'module:created',
  ModuleUpdated = 'module:updated',
  ModuleRemoved = 'module:removed',
  ModuleQueueRemove = 'module:queueRemove',

  PhaseCreated = 'phase:created',
  PhaseUpdated = 'phase:updated',
  PhaseRemoved = 'phase:removed',
  PhaseQueueRemove = 'phase:queueRemove',
  PhaseLocked = 'phase:locked',
  PhaseHidden = 'phase:hidden',

  SubmissionGraded = 'submission:graded',

  RemoveCourse = 'remove:course',
  RemoveUser = 'remove:user',
  RemoveModule = 'remove:module',
  RemovePhase = 'remove:phase',

  // ##### Below this line should all subjects be which shouldn't exist in Remove #####

  SessionContext = 'session:context',
  SessionCreated = 'session:created',
  SessionRemoved = 'session:removed',

  GroupCreated = 'group:created',
  GroupRemoved = 'group:removed',
  GroupAddedUser = 'group:addedUser',
  GroupRemovedUser = 'group:removedUser',
}
