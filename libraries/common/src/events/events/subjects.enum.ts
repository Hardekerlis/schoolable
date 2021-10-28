/** @format */

export enum Subjects {
  UserCreated = 'user:created',
  UserUpdated = 'user:updated',
  UserRemoved = 'user:removed',
  UserQueueRemove = 'user:queueRemove',

  AuthLogin = 'auth:login',
  AuthLogout = 'auth:logout',

  CourseCreated = 'course:created',
  CourseUpdated = 'course:updated',
  CourseRemoved = 'course:removed',
  CourseQueueRemove = 'course:queueRemove',

  PhaseCreated = 'phase:created',
  PhaseUpdated = 'phase:updated',
  PhaseRemoved = 'phase:removed',
  PhaseQueueRemove = 'phase:queueRemove',

  PhaseItemCreated = 'phaseItem:created',
  PhaseItemUpdated = 'phaseItem:updated',
  PhaseItemRemoved = 'phaseItem:removed',
  PhaseItemQueueRemove = 'phaseItem:queueRemove',

  SubmissionGraded = 'submission:graded',

  RemoveCourse = 'remove:course',
  RemoveUser = 'remove:user',
  RemovePhase = 'remove:phase',
  RemovePhaseItem = 'remove:phaseItem',

  // ##### Below this line should all subjects be which shouldn't exist in Remove #####

  SessionContext = 'session:context',
  SessionCreated = 'session:created',
  SessionRemoved = 'session:removed',
}
