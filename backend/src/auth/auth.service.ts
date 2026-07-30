import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthService {
  private readonly jwtSecret =
    process.env.JWT_SECRET || 'your-secret-key-change-this';

  private readonly normalExpiry = '8h';
  private readonly rememberExpiry = '30d';

  constructor(
    private databaseService: DatabaseService,
  ) {}

  // =====================================
  // Seed Super Admin
  // =====================================

  async createSuperAdmin() {
    try {
      const existingAdmin =
        await this.databaseService.User.findOne({
          where: {
            username: 'test',
          },
        });

      if (existingAdmin) {
        return {
          success: false,
          message:
            'Superadmin already exists',
          user: {
            username:
              existingAdmin.username,
            email: existingAdmin.email,
            role: existingAdmin.role,
          },
        };
      }

      const hashedPassword =
        await bcrypt.hash('1234', 10);

      const superAdmin =
        await this.databaseService.User.create({
          username: 'test',
          email: 'test@test.com',
          password: hashedPassword,
          name: 'Test User',

          role: 'superadmin',

          businessUnitId: null,
          selectedBusinessUnitId: null,

          companyId: null,
          selectedCompanyId: null,

          isActive: true,
        });

      return {
        success: true,
        message:
          'Superadmin created successfully',
        user: {
          id: superAdmin.id,
          username:
            superAdmin.username,
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
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // =====================================
  // LOGIN
  // =====================================

  async login(
    username: string,
    password: string,
    rememberMe = false,
  ) {
    username = username.trim();
    password = password.trim();

    const user =
      await this.databaseService.User.findOne({
        where: {
          username,
        },
        raw: true,
      });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.password,
      );

    if (!validPassword) {
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

        role: user.role,

        businessUnitId: user.businessUnitId,
        selectedBusinessUnitId:
          user.selectedBusinessUnitId,

        companyId: user.companyId,
        selectedCompanyId:
          user.selectedCompanyId,
      },
      this.jwtSecret,
      {
        expiresIn,
      },
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

    const userRoles =
      await this.databaseService.UserRole.findAll({
        where: {
          userId: user.id,
        },
        include: [
          {
            model:
              this.databaseService.Role,
            as: 'role',
            attributes: [
              'id',
              'name',
            ],
          },
        ],
      });

    const roleIds = userRoles.map(
      (x: any) => x.roleId,
    );

    let permissions: string[] = [];

    if (roleIds.length) {
      const rolePermissions =
        await this.databaseService.RolePermission.findAll(
          {
            where: {
              roleId: roleIds,
            },
            include: [
              {
                model:
                  this.databaseService.Permission,
                as: 'permission',
                attributes: [
                  'permissionKey',
                ],
              },
            ],
          },
        );

      permissions = Array.from(
        new Set(
          rolePermissions
            .map(
              (x: any) =>
                x.permission
                  ?.permissionKey,
            )
            .filter(Boolean),
        ),
      );
    }

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

        profilePicture: user.profilePicture,

        businessUnitId:
          user.businessUnitId,

        selectedBusinessUnitId:
          user.selectedBusinessUnitId,

        companyId:
          user.companyId,

        selectedCompanyId:
          user.selectedCompanyId,
      },

      roles: userRoles.map(
        (x: any) => ({
          id: x.role.id,
          name: x.role.name,
        }),
      ),

      permissions,
    };
  }

  // ==========================
  // Logout
  // ==========================

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

  // ==========================
  // Create User
  // ==========================

  async createUser(
    userData: any,
    adminUser: any,
  ) {
    const existing =
      await this.databaseService.User.findOne({
        where: {
          [Op.or]: [
            {
              username: userData.username,
            },
            {
              email: userData.email,
            },
          ],
        },
      });

    if (existing) {
      throw new BadRequestException(
        'Username or Email already exists',
      );
    }

    const password = await bcrypt.hash(
      userData.password,
      10,
    );

    const businessUnitId =
      adminUser.role === 'superadmin'
        ? adminUser.selectedBusinessUnitId
        : adminUser.businessUnitId;

    if (!businessUnitId) {
      throw new BadRequestException(
        'Please select a Business Unit first',
      );
    }

    const user =
      await this.databaseService.User.create({
        username: userData.username,
        email: userData.email,
        password,
        name: userData.name,

        role: userData.role || 'user',

        businessUnitId,
        companyId: null,

        selectedBusinessUnitId: null,
        selectedCompanyId: null,

        isActive: true,

        createdBy: adminUser.id,
      });

    if (
      userData.roleIds &&
      Array.isArray(userData.roleIds)
    ) {
      await this.databaseService.UserRole.bulkCreate(
        userData.roleIds.map(
          (roleId: number) => ({
            userId: user.id,
            roleId,
          }),
        ),
      );
    }

    return {
      success: true,
      message: 'User created successfully',
      user,
    };
  }

  // ==========================
  // Validate Token
  // ==========================

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
        new Date(loginToken.expiresAt) < new Date()
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