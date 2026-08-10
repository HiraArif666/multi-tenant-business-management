import { AsyncLocalStorage } from 'async_hooks';

export interface AuditContext {
  userId: number | null;
  userName: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  businessUnitId: number | null;
}

// One instance shared app-wide. A global interceptor calls .run() with
// the current request's info at the start of every request; anything
// executed during that request (including Sequelize model hooks buried
// deep inside a service call) can read it back via getAuditContext(),
// with no need to pass req/user through every function signature.
export const auditContextStorage =
  new AsyncLocalStorage<AuditContext>();

export function getAuditContext():
  | AuditContext
  | undefined {
  return auditContextStorage.getStore();
}