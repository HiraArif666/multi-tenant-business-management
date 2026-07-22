import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthService {
private readonly jwtSecret = 'your-secret-key-change-this';

private readonly normalExpiry = '8h';
private readonly rememberExpiry = '30d';

  constructor(private databaseService: DatabaseService) {}

  // ✅ SEED SUPERADMIN
  async createSuperAdmin() {
    try {
      const existingAdmin = await this.databaseService.User.findOne({
        where: { username: 'test' },
      });

      if (existingAdmin) {
        return {
          success: false,
          message: 'Superadmin already exists',
          user: {
            username: existingAdmin.username,
            email: existingAdmin.email,
            role: existingAdmin.role,
          },
        };
      }

      const hashedPassword = await bcrypt.hash('1234', 10);

      const superAdmin = await this.databaseService.User.create({
        username: 'test',
        email: 'test@test.com',
        password: hashedPassword,
        name: 'Test User',
        role: 'superadmin',
        businessUnitId: null,
        companyId: null,
        isActive: true,
      });

      console.log('✓ Superadmin created');

      return {
        success: true,
        message: 'Superadmin created successfully',
        user: {
          id: superAdmin.id,
          username: superAdmin.username,
          email: superAdmin.email,
          name: superAdmin.name,
          role: superAdmin.role,
        },
        loginCredentials: {
          username: 'test',
          password: '1234',
        },
      };
    } catch (error: any) {
      console.error('❌ Seed error:', error.message);

      return {
        success: false,
        message: error.message,
      };
    }
  }

  // ✅ LOGIN

async login(
  username: string,
  password: string,
  rememberMe = false,
) {
  try {
    username = username.trim();
    password = password.trim();

    const user = await this.databaseService.User.findOne({
      where: { username },
      raw: true,
    });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const valid = await bcrypt.compare(
      password,
      user.password,
    );

    if (!valid) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const expiresIn = rememberMe
      ? this.rememberExpiry
      : this.normalExpiry;

const token = jwt.sign(
  {
    id: user.id,
    username: user.username,
    email: user.email,
    businessUnitId: user.businessUnitId,
    companyId: user.companyId,
  },
  this.jwtSecret,
  {
expiresIn: '7d',  },
);

    const expiresAt = new Date();

    if (rememberMe) {
      expiresAt.setDate(
        expiresAt.getDate() + 30,
      );
    } else {
      expiresAt.setHours(
        expiresAt.getHours() + 8,
      );
    }

    await this.databaseService.LoginToken.create({
      userId: user.id,
      token,
      expiresAt,
      isRevoked: false,
    });

    return {
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        businessUnitId: user.businessUnitId,
        companyId: user.companyId,
      },
    };
  } catch (error: any) {
    throw new UnauthorizedException(
      error.message || 'Login failed',
    );
  }
}

//Logout
async logout(token: string) {
  const loginToken =
    await this.databaseService.LoginToken.findOne({
      where: {
        token,
        isRevoked: false,
      },
    });

  if (!loginToken) {
    return {
      success: true,
      message: 'Already logged out',
    };
  }

  await loginToken.update({
    isRevoked: true,
    expiresAt: new Date(),
  });

  return {
    success: true,
    message: 'Logout successful',
  };
}


  // ✅ CREATE USER
async createUser(userData: any, adminUser: any) {
  try {
    console.log(
      '👤 Creating user by:',
      adminUser.username,
    );

    const existingUserByUsername =
      await this.databaseService.User.findOne({
        where: {
          username: userData.username,
        },
      });

    if (existingUserByUsername) {
      throw new BadRequestException(
        'Username already exists',
      );
    }

    const existingUserByEmail =
      await this.databaseService.User.findOne({
        where: {
          email: userData.email,
        },
      });

    if (existingUserByEmail) {
      throw new BadRequestException(
        'Email already exists',
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        userData.password,
        10,
      );

    const user =
      await this.databaseService.User.create({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        name: userData.name,

        // Temporary until role column is removed
        role: userData.role || 'user',

        businessUnitId:
          userData.businessUnitId || null,

        companyId:
          userData.companyId || null,

        isActive: true,

        createdBy: adminUser.id,
        updatedBy: null,
        deletedBy: null,
      });

    // ==========================
    // Assign Roles
    // ==========================

    if (
      userData.roleIds &&
      Array.isArray(userData.roleIds)
    ) {
      for (const roleId of userData.roleIds) {
        await this.databaseService.UserRole.create({
          userId: user.id,
          roleId,
        });
      }
    }

    console.log(
      '✓ User created:',
      user.username,
    );

    return {
      success: true,
      message: 'User created successfully',
      user,
    };
  } catch (error: any) {
    console.error(
      '❌ Create user error:',
      error.message,
    );

    throw new BadRequestException(
      error.message || 'Failed to create user',
    );
  }
}

  // ✅ VALIDATE TOKEN
async validateToken(token: string) {
  try {
    const loginToken =
      await this.databaseService.LoginToken.findOne({
        where: {
          token,
          isRevoked: false,
        },
      });

    if (!loginToken) {
      throw new UnauthorizedException(
        'Token revoked',
      );
    }

    if (
      new Date(loginToken.expiresAt) <
      new Date()
    ) {
      throw new UnauthorizedException(
        'Token expired',
      );
    }

    return jwt.verify(token, this.jwtSecret);
  } catch {
    throw new UnauthorizedException(
      'Invalid token',
    );
  }
}
}