export function setupUserAssociations(models: any) {
  const {
    User,
    BusinessUnit,
    Company,
  } = models;

  User.belongsTo(BusinessUnit, {
    foreignKey: 'businessUnitId',
    as: 'businessUnit',
  });

  User.belongsTo(Company, {
    foreignKey: 'companyId',
    as: 'company',
  });
}