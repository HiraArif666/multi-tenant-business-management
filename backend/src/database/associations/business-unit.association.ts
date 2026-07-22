export function setupBusinessUnitAssociations(models: any) {
  const {
    User,
    Company,
    BusinessUnit,
  } = models;

  BusinessUnit.belongsTo(User, {
    foreignKey: 'adminId',
    as: 'admin',
  });

  BusinessUnit.hasMany(Company, {
    foreignKey: 'businessUnitId',
    as: 'companies',
  });

  BusinessUnit.hasMany(User, {
    foreignKey: 'businessUnitId',
    as: 'users',
  });
}