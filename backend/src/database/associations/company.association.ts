export function setupCompanyAssociations(models: any) {
  const {
    Company,
    CompanyType,
    BusinessUnit,
    User,
  } = models;

  Company.belongsTo(BusinessUnit, {
    foreignKey: 'businessUnitId',
    as: 'businessUnit',
  });

  Company.belongsTo(CompanyType, {
    foreignKey: 'companyTypeId',
    as: 'companyType',
  });

  Company.belongsTo(User, {
    foreignKey: 'adminId',
    as: 'admin',
  });

  Company.hasMany(User, {
    foreignKey: 'companyId',
    as: 'users',
  });
}