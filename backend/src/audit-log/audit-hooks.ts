import { getAuditContext } from './audit-context';

interface AuditHookOptions {
  module: string;
  tableName: string;
}

// Fields that should never be written into an audit log, even though
// they're part of the model's data (password hashes, reset tokens).
const SENSITIVE_FIELDS = [
  'password',
  'resetPasswordToken',
  'resetPasswordExpires',
];

function sanitize(data: any): Record<string, any> | null {
  if (!data) return null;

  const plain =
    typeof data.toJSON === 'function'
      ? data.toJSON()
      : { ...data };

  for (const field of SENSITIVE_FIELDS) {
    delete plain[field];
  }

  return plain;
}

// Attaches afterCreate/afterUpdate/afterDestroy hooks to `model`. From
// then on, every create/update/delete on that model — no matter which
// service triggers it — writes a row to audit_logs automatically, with
// whoever's "current request" info is live in AsyncLocalStorage at
// that moment (see audit-context.ts).
export function registerAuditHooks(
  model: any,
  auditLogModel: any,
  options: AuditHookOptions,
) {
  const write = async (
    action: 'create' | 'update' | 'delete',
    recordId: any,
    beforeValues: any,
    afterValues: any,
  ) => {
    const ctx = getAuditContext();

    try {
      await auditLogModel.create({
        userId: ctx?.userId ?? null,
        userName: ctx?.userName ?? null,
        ipAddress: ctx?.ipAddress ?? null,
        userAgent: ctx?.userAgent ?? null,

        module: options.module,
        tableName: options.tableName,
        recordId:
          recordId != null ? String(recordId) : null,
        action,

        beforeValues,
        afterValues,

        businessUnitId: ctx?.businessUnitId ?? null,
      });
    } catch (error) {
      // An audit-logging failure should never break the actual
      // create/update/delete it's trying to record.
      console.error(
        `Failed to write audit log for ${options.tableName}:`,
        error,
      );
    }
  };

  model.addHook(
    'afterCreate',
    async (instance: any) => {
      await write(
        'create',
        instance.id,
        null,
        sanitize(instance),
      );
    },
  );

  model.addHook(
    'beforeUpdate',
    (instance: any, options: any) => {
      // Snapshot the pre-change state here, while it's still
      // reliably available — by the time afterUpdate fires,
      // Sequelize may have already synced _previousDataValues
      // to match the new values, making before === after.
      options.__auditBefore = sanitize(
        instance._previousDataValues ??
          instance.dataValues,
      );
    },
  );

  model.addHook(
    'afterUpdate',
    async (instance: any, options: any) => {
      const before = options?.__auditBefore ?? null;

      await write(
        'update',
        instance.id,
        before,
        sanitize(instance),
      );
    },
  );

  model.addHook(
    'afterDestroy',
    async (instance: any) => {
      await write(
        'delete',
        instance.id,
        sanitize(instance),
        null,
      );
    },
  );
}