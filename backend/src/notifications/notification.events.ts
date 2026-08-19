export class NotificationEvent {
  constructor(
    readonly businessUnitId: number,
    readonly userId: number,
    readonly type: string,
    readonly title: string,
    readonly message: string,
    readonly actionUrl?: string,
    readonly metadata?: Record<string, any>,
  ) {}
}

export class ExpenseApprovedEvent extends NotificationEvent {
  constructor(
    businessUnitId: number,
    userId: number,
    expenseId: number,
    approverId: string,
  ) {
    super(
      businessUnitId,
      userId,
      'expense_approved',
      `Expense #EXP-${expenseId} was approved`,
      `${approverId} approved your expense request`,
      `/expenses/${expenseId}`,
      { expenseId },
    );
  }
}

export class ExpensePendingEvent extends NotificationEvent {
  constructor(
    businessUnitId: number,
    userId: number,
    expenseId: number,
  ) {
    super(
      businessUnitId,
      userId,
      'expense_pending',
      `Expense #EXP-${expenseId} requires your approval`,
      'You have a pending expense approval',
      `/expenses/${expenseId}`,
      { expenseId },
    );
  }
}

export class ExpenseRejectedEvent extends NotificationEvent {
  constructor(
    businessUnitId: number,
    userId: number,
    expenseId: number,
    rejectorId: string,
  ) {
    super(
      businessUnitId,
      userId,
      'expense_rejected',
      `Expense #EXP-${expenseId} was rejected`,
      `${rejectorId} rejected your expense request`,
      `/expenses/${expenseId}`,
      { expenseId },
    );
  }
}

export class ReportGeneratedEvent extends NotificationEvent {
  constructor(
    businessUnitId: number,
    userId: number,
    reportName: string,
  ) {
    super(
      businessUnitId,
      userId,
      'report_generated',
      'Scheduled report generated',
      `${reportName} is ready`,
      `/reports`,
      { reportName },
    );
  }
}

/**
 * USER ADDED
 */
export class UserAddedEvent extends NotificationEvent {
  constructor(
    businessUnitId: number,
    userId: number,       // notification recipient
    targetUserId: number, // newly created user
    userName: string,
  ) {
    super(
      businessUnitId,
      userId,
      'user.added',
      'New User Added',
      `${userName} has been added as a new user.`,
      `/users/${targetUserId}`,
      { userId: targetUserId },
    );
  }
}

/**
 * USER UPDATED
 */
export class UserUpdatedEvent extends NotificationEvent {
  constructor(
    businessUnitId: number,
    userId: number,
    targetUserId: number,
    userName: string,
  ) {
    super(
      businessUnitId,
      userId,
      'user.updated',
      'User Updated',
      `${userName}'s information has been updated.`,
      `/users/${targetUserId}`,
      { userId: targetUserId },
    );
  }
}

/**
 * USER DELETED
 */
export class UserDeletedEvent extends NotificationEvent {
  constructor(
    businessUnitId: number,
    userId: number,
    targetUserId: number,
    userName: string,
  ) {
    super(
      businessUnitId,
      userId,
      'user.deleted',
      'User Deleted',
      `${userName} has been deleted.`,
      '/users',
      { userId: targetUserId },
    );
  }
}

/**
 * USER PASSWORD CHANGED
 */
export class UserPasswordChangedEvent extends NotificationEvent {
  constructor(
    businessUnitId: number,
    userId: number,
    targetUserId: number,
    userName: string,
  ) {
    super(
      businessUnitId,
      userId,
      'user.password.changed',
      'Password Changed',
      `The password for ${userName} has been changed.`,
      `/users/${targetUserId}`,
      { userId: targetUserId },
    );
  }
}

/**
 * USER ROLES UPDATED
 */
export class UserRolesUpdatedEvent extends NotificationEvent {
  constructor(
    businessUnitId: number,
    userId: number,
    targetUserId: number,
    userName: string,
  ) {
    super(
      businessUnitId,
      userId,
      'user.roles.updated',
      'User Roles Updated',
      `Roles for ${userName} have been updated.`,
      `/users/${targetUserId}`,
      { userId: targetUserId },
    );
  }
}