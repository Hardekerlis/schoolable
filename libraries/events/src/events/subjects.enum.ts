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

  PhaseItemCreated = 'phaseItem:created',
  PhaseItemUpdated = 'phaseItem:updated',
  PhaseItemRemoved = 'phaseItem:removed',
  PhaseItemQueueRemove = 'phaseItem:queueRemove',

  SubmissionGraded = 'submission:graded',

  RemoveCourse = 'remove:course',
  RemoveUser = 'remove:user',
  RemovePhase = 'remove:phase',
  RemovePhaseItem = 'remove:phaseItem',
}
