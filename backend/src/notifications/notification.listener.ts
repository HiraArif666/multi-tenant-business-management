import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';
import {
  ExpenseApprovedEvent,
  ExpensePendingEvent,
  ReportGeneratedEvent,
  ExpenseRejectedEvent,
} from './notification.events';

import {
  UserAddedEvent,
  UserUpdatedEvent,
  UserDeletedEvent,
  UserPasswordChangedEvent,
  UserRolesUpdatedEvent,
} from './notification.events';


@Injectable()
export class NotificationListener {
  private readonly logger = new Logger('NotificationListener');

  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent('expense.approved')
  async onExpenseApproved(event: ExpenseApprovedEvent) {
    try {
      await this.notificationService.handleNotificationEvent(event);
      this.logger.log('Expense approved notification created');
    } catch (error) {
      this.logger.error('Failed to handle expense.approved event', error);
    }
  }

  @OnEvent('expense.pending')
  async onExpensePending(event: ExpensePendingEvent) {
    try {
      await this.notificationService.handleNotificationEvent(event);
      this.logger.log('Expense pending notification created');
    } catch (error) {
      this.logger.error('Failed to handle expense.pending event', error);
    }
  }

  @OnEvent('report.generated')
  async onReportGenerated(event: ReportGeneratedEvent) {
    try {
      await this.notificationService.handleNotificationEvent(event);
      this.logger.log('Report generated notification created');
    } catch (error) {
      this.logger.error('Failed to handle report.generated event', error);
    }
  }

  @OnEvent('expense.rejected')
async onExpenseRejected(event: ExpenseRejectedEvent) {
  try {
    await this.notificationService.handleNotificationEvent(event);

    this.logger.log('Expense rejected notification created');
  } catch (error) {
    this.logger.error(
      'Failed to handle expense.rejected event',
      error,
    );
  }
}

@OnEvent('user.added')
async onUserAdded(event: UserAddedEvent) {
  console.log('🔥 USER.ADDED LISTENER TRIGGERED:', event);

  try {
    await this.notificationService.handleNotificationEvent(event);

    this.logger.log(
      'User added notification created',
    );
  } catch (error) {
    this.logger.error(
      'Failed to handle user.added event',
      error,
    );
  }
}

@OnEvent('user.updated')
async onUserUpdated(event: UserUpdatedEvent) {
  console.log('🔥 USER.UPDATED LISTENER TRIGGERED:', event);

  try {
    await this.notificationService.handleNotificationEvent(event);

    this.logger.log('User updated notification created');
  } catch (error) {
    this.logger.error(
      'Failed to handle user.updated event',
      error,
    );
  }
}

@OnEvent('user.deleted')
async onUserDeleted(event: UserDeletedEvent) {
  try {
    await this.notificationService.handleNotificationEvent(event);

    this.logger.log('User deleted notification created');
  } catch (error) {
    this.logger.error(
      'Failed to handle user.deleted event',
      error,
    );
  }
}

@OnEvent('user.password.changed')
async onUserPasswordChanged(
  event: UserPasswordChangedEvent,
) {
  try {
    await this.notificationService.handleNotificationEvent(event);

    this.logger.log(
      'User password changed notification created',
    );
  } catch (error) {
    this.logger.error(
      'Failed to handle user.password.changed event',
      error,
    );
  }
}

@OnEvent('user.roles.updated')
async onUserRolesUpdated(
  event: UserRolesUpdatedEvent,
) {
  try {
    await this.notificationService.handleNotificationEvent(event);

    this.logger.log(
      'User roles updated notification created',
    );
  } catch (error) {
    this.logger.error(
      'Failed to handle user.roles.updated event',
      error,
    );
  }
}



  
}