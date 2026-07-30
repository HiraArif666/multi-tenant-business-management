export function setupModuleAssociations(models: any) {
  const { Module, Permission } = models;

  Module.hasMany(Module, {
    foreignKey: 'parentId',
    as: 'children',
  });

  Module.belongsTo(Module, {
    foreignKey: 'parentId',
    as: 'parent',
  });

  Module.hasMany(Permission, {
    foreignKey: 'moduleId',
    as: 'permissions',
  });

  Permission.belongsTo(Module, {
    foreignKey: 'moduleId',
    as: 'module',
  });
}