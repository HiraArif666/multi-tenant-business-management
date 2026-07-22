export function setupAuthAssociations(models: any) {
  const { User, LoginToken } = models;

  User.hasMany(LoginToken, {
    foreignKey: 'userId',
    as: 'loginTokens',
  });

  LoginToken.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });
}