import { DatabaseService } from './database.service';

export async function seedPermissions(
  database: DatabaseService,
) {
  const permissions = [
    // Dashboard
    {
      module: 'Dashboard',
      subModule: null,
      action: 'View',
      permissionKey: 'dashboard.view',
    },

    // Business Units
    {
      module: 'Business Units',
      subModule: null,
      action: 'View',
      permissionKey: 'business-units.view',
    },
    {
      module: 'Business Units',
      subModule: null,
      action: 'Add',
      permissionKey: 'business-units.add',
    },
    {
      module: 'Business Units',
      subModule: null,
      action: 'Edit',
      permissionKey: 'business-units.edit',
    },
    {
      module: 'Business Units',
      subModule: null,
      action: 'Delete',
      permissionKey: 'business-units.delete',
    },

    // Company Types
    {
      module: 'Company Types',
      subModule: null,
      action: 'View',
      permissionKey: 'company-types.view',
    },
    {
      module: 'Company Types',
      subModule: null,
      action: 'Add',
      permissionKey: 'company-types.add',
    },
    {
      module: 'Company Types',
      subModule: null,
      action: 'Edit',
      permissionKey: 'company-types.edit',
    },
    {
      module: 'Company Types',
      subModule: null,
      action: 'Delete',
      permissionKey: 'company-types.delete',
    },

    // Companies
    {
      module: 'Companies',
      subModule: null,
      action: 'View',
      permissionKey: 'companies.view',
    },
    {
      module: 'Companies',
      subModule: null,
      action: 'Add',
      permissionKey: 'companies.add',
    },
    {
      module: 'Companies',
      subModule: null,
      action: 'Edit',
      permissionKey: 'companies.edit',
    },
    {
      module: 'Companies',
      subModule: null,
      action: 'Delete',
      permissionKey: 'companies.delete',
    },

    // Staff -> Users
    {
      module: 'Staff',
      subModule: 'Users',
      action: 'View',
      permissionKey: 'staff.users.view',
    },
    {
      module: 'Staff',
      subModule: 'Users',
      action: 'Add',
      permissionKey: 'staff.users.add',
    },
    {
      module: 'Staff',
      subModule: 'Users',
      action: 'Edit',
      permissionKey: 'staff.users.edit',
    },
    {
      module: 'Staff',
      subModule: 'Users',
      action: 'Delete',
      permissionKey: 'staff.users.delete',
    },

    // Staff -> Roles
    {
      module: 'Staff',
      subModule: 'Roles',
      action: 'View',
      permissionKey: 'staff.roles.view',
    },
    {
      module: 'Staff',
      subModule: 'Roles',
      action: 'Add',
      permissionKey: 'staff.roles.add',
    },
    {
      module: 'Staff',
      subModule: 'Roles',
      action: 'Edit',
      permissionKey: 'staff.roles.edit',
    },
    {
      module: 'Staff',
      subModule: 'Roles',
      action: 'Delete',
      permissionKey: 'staff.roles.delete',
    },

    // Profile
    {
      module: 'Profile',
      subModule: null,
      action: 'View',
      permissionKey: 'profile.view',
    },
    {
      module: 'Profile',
      subModule: null,
      action: 'Edit',
      permissionKey: 'profile.edit',
    },
  ];

  for (const permission of permissions) {
    const exists =
      await database.Permission.findOne({
        where: {
          permissionKey: permission.permissionKey,
        },
      });

    if (!exists) {
      await database.Permission.create({
        ...permission,
        description: permission.permissionKey,
        isActive: true,
      });

      console.log(
        `✓ Permission created: ${permission.permissionKey}`,
      );
    }
  }

  console.log('✓ Permissions seeded successfully');
}