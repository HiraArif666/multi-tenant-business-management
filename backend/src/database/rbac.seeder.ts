export async function seedRoles(databaseService: any) {
  const roles = [
    {
      name: 'Super Admin',
      description: 'System Super Administrator',
      isSystem: true,
    },
    {
      name: 'BU Admin',
      description: 'Business Unit Administrator',
      isSystem: true,
    },
    {
      name: 'Company Admin',
      description: 'Company Administrator',
      isSystem: true,
    },
    {
      name: 'User',
      description: 'Normal User',
      isSystem: true,
    },
  ];

  for (const role of roles) {
    await databaseService.Role.findOrCreate({
      where: {
        name: role.name,
      },
      defaults: {
        ...role,
        isActive: true,
      },
    });
  }

  console.log('✓ Roles seeded');
}

export async function seedSuperAdminRole(databaseService: any) {
  const superAdmin =
    await databaseService.User.findOne({
      where: {
        username: 'test',
      },
    });

  if (!superAdmin) {
    console.log(
      '⚠ Super Admin user not found',
    );
    return;
  }

  const role =
    await databaseService.Role.findOne({
      where: {
        name: 'Super Admin',
      },
    });

  if (!role) {
    console.log(
      '⚠ Super Admin role not found',
    );
    return;
  }

  await databaseService.UserRole.findOrCreate({
    where: {
      userId: superAdmin.id,
      roleId: role.id,
    },
  });

  console.log(
    '✓ Super Admin role assigned',
  );
}

export async function seedRolePermissions(
  databaseService: any,
) {
  const superAdminRole =
    await databaseService.Role.findOne({
      where: {
        name: 'Super Admin',
      },
    });

  if (!superAdminRole) {
    return;
  }

  const permissions =
    await databaseService.Permission.findAll();

  for (const permission of permissions) {
    await databaseService.RolePermission.findOrCreate({
      where: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log(
    '✓ Super Admin permissions assigned',
  );
}