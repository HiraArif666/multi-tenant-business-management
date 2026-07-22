import * as bcrypt from 'bcrypt';

export async function seedSuperAdmin(
  databaseService: any,
) {
  const existingUser =
    await databaseService.User.findOne({
      where: {
        username: 'superadmin',
      },
    });

  let superAdmin = existingUser;

  if (!existingUser) {
const hashedPassword =
  await bcrypt.hash('1234', 10);

superAdmin =
  await databaseService.User.create({
    username: 'test',
    email: 'test@test.com',
    password: hashedPassword,
    name: 'Test User',

    // Temporary until role column is removed
    role: 'superadmin',

    businessUnitId: null,
    companyId: null,

    isActive: true,
  });

    console.log(
      '✓ Super Admin user created',
    );
  }

  // ======================================
  // Assign Super Admin Role
  // ======================================

  const superAdminRole =
    await databaseService.Role.findOne({
      where: {
        name: 'Super Admin',
      },
    });

  if (!superAdminRole) {
    console.log(
      '⚠ Super Admin role not found. Run RBAC seed first.',
    );
    return;
  }

  await databaseService.UserRole.findOrCreate({
    where: {
      userId: superAdmin.id,
      roleId: superAdminRole.id,
    },
    defaults: {
      userId: superAdmin.id,
      roleId: superAdminRole.id,
    },
  });

  console.log(
    '✓ Super Admin role assigned',
  );
}