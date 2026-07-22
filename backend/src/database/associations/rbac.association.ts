export function setupRbacAssociations(models: any) {
  const {
    User,
    Role,
    Permission,
    UserRole,
    RolePermission,
  } = models;

  User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: 'userId',
    otherKey: 'roleId',
    as: 'roles',
  });

  Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: 'roleId',
    otherKey: 'userId',
    as: 'users',
  });

  Role.belongsToMany(Permission, {
    through: RolePermission,
    foreignKey: 'roleId',
    otherKey: 'permissionId',
    as: 'permissions',
  });

  Permission.belongsToMany(Role, {
    through: RolePermission,
    foreignKey: 'permissionId',
    otherKey: 'roleId',
    as: 'roles',
  });
  RolePermission.belongsTo(Permission, {
  foreignKey: 'permissionId',
  as: 'permission',
});

Permission.hasMany(RolePermission, {
  foreignKey: 'permissionId',
  as: 'rolePermissions',
});

RolePermission.belongsTo(Role, {
  foreignKey: 'roleId',
  as: 'role',
});

Role.hasMany(RolePermission, {
  foreignKey: 'roleId',
  as: 'rolePermissions',
});
}