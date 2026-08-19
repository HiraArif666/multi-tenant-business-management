import * as bcrypt from 'bcrypt';
import { DatabaseService } from './database.service';

export async function seedSuperAdmin(
  databaseService: DatabaseService,
) {
  // ======================================
  // Create / Find Super Admin User
  // ======================================

  const hashedPassword = await bcrypt.hash('123456', 10);

  const [superAdmin, created] =
    await databaseService.User.findOrCreate({
      where: {
        username: 'test',
      },
      defaults: {
        username: 'test',
        email: 'test@test.com',
        password: hashedPassword,
        name: 'Test User',
        role: 'superadmin',
        businessUnitId: null,
        companyId: null,
        isActive: true,
      },
    });

  if (created) {
    console.log('✓ Super Admin created');
  } else {
    console.log('✓ Super Admin already exists');
  }

  // ======================================
  // Find Super Admin Role
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

  // ======================================
  // Assign Super Admin Role
  // ======================================

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

  console.log('✓ Super Admin role assigned');
}