export function setupExpenseAssociations(models: any) {
  const {
    Expense,
    User,
    BusinessUnit,
  } = models;

  Expense.belongsTo(BusinessUnit, {
    foreignKey: 'businessUnitId',
    as: 'businessUnit',
  });

  Expense.belongsTo(User, {
    foreignKey: 'approvedBy',
    as: 'approver',
  });

  Expense.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator',
  });
}

export function setupApprovalSettingAssociations(
  models: any,
) {
  const {
    ApprovalSetting,
    ApprovalSettingApprover,
    BusinessUnit,
    User,
  } = models;

  ApprovalSetting.belongsTo(BusinessUnit, {
    foreignKey: 'businessUnitId',
    as: 'businessUnit',
  });

  ApprovalSetting.hasMany(ApprovalSettingApprover, {
    foreignKey: 'approvalSettingId',
    as: 'approvers',
  });

  ApprovalSettingApprover.belongsTo(ApprovalSetting, {
    foreignKey: 'approvalSettingId',
    as: 'approvalSetting',
  });

  ApprovalSettingApprover.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });
}