import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Op } from 'sequelize';
import { DatabaseService } from '../database/database.service';
import { MailService } from '../mail/mail.service';
import { getAuditContext } from '../audit-log/audit-context';
import { SecurityLogService } from '../security-log/security-log.service';

@Injectable()
export class AuthService {
  private readonly jwtSecret =
    process.env.JWT_SECRET || 'your-secret-key-change-this';

  private readonly normalExpiry = '8h';
  private readonly rememberExpiry = '30d';

  private readonly maxFailedAttempts = 5;
  private readonly failedAttemptWindowMinutes = 15;
  private readonly lockoutDurationMinutes = 15;
  private readonly suspiciousIpFailureThreshold = 10;
  private readonly suspiciousIpWindowMinutes = 15;
  private readonly genericAuthError =
    'Invalid credentials';

  constructor(
    private databaseService: DatabaseService,
    private readonly mailService: MailService,
    private readonly securityLogService: SecurityLogService,
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

  private getLockMessage(lockedUntil: Date) {
    const minutesLeft = Math.max(
      1,
      Math.ceil(
        (lockedUntil.getTime() - Date.now()) /
          60000,
      ),
    );

    return `Account temporarily locked. Try again in ${minutesLeft} minute${
      minutesLeft === 1 ? '' : 's'
    }.`;
  }

  private async maybeRecordIpSuspiciousActivity() {
    const ctx = getAuditContext();
    if (!ctx?.ipAddress) {
      return;
    }

    const failureCount =
      await this.securityLogService.countFailedAttemptsByIp(
        ctx.ipAddress,
        this.suspiciousIpWindowMinutes,
      );

    if (
      failureCount >=
        this.suspiciousIpFailureThreshold &&
      !(await this.securityLogService.hasRecentSuspiciousActivity(
        ctx.ipAddress,
        this.suspiciousIpWindowMinutes,
      ))
    ) {
      await this.securityLogService.create(
        'suspicious_activity',
        {
          details: {
            reason:
              'Multiple failed login attempts from IP',
            failedAttempts: failureCount,
          },
        },
      );
    }
  }

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
      });

    if (!user) {
      await this.securityLogService.create(
        'login_failed',
        {
          username,
        },
      );
      await this.maybeRecordIpSuspiciousActivity();
      throw new UnauthorizedException(
        this.genericAuthError,
      );
    }

    const now = new Date();

    if (
      user.lockedUntil &&
      new Date(user.lockedUntil) > now
    ) {
      await this.securityLogService.create(
        'login_failed',
        {
          userId: user.id,
          username: user.username,
          businessUnitId: user.businessUnitId,
        },
      );
      throw new UnauthorizedException(
        this.getLockMessage(
          new Date(user.lockedUntil),
        ),
      );
    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.password,
      );

    if (!validPassword) {
      await this.securityLogService.create(
        'login_failed',
        {
          userId: user.id,
          username: user.username,
          businessUnitId: user.businessUnitId,
        },
      );

      const failedCount =
        await this.securityLogService.countFailedAttemptsForUser(
          user.id,
          user.username,
          this.failedAttemptWindowMinutes,
        );

      const updates: any = {
        failedLoginAttempts: failedCount,
      };

      if (failedCount >= this.maxFailedAttempts) {
        const lockedUntil = new Date(
          Date.now() +
            this.lockoutDurationMinutes *
              60 *
              1000,
        );
        updates.lockedUntil = lockedUntil;

        await user.update(updates);

        await this.securityLogService.create(
          'account_locked',
          {
            userId: user.id,
            username: user.username,
            businessUnitId: user.businessUnitId,
            details: {
              failedAttempts: failedCount,
              lockoutMinutes:
                this.lockoutDurationMinutes,
            },
          },
        );

        throw new UnauthorizedException(
          this.getLockMessage(lockedUntil),
        );
      }

      await user.update(updates);
      await this.maybeRecordIpSuspiciousActivity();

      throw new UnauthorizedException(
        this.genericAuthError,
      );
    }

    const ctx = getAuditContext();
    const ipAddress = ctx?.ipAddress ?? null;

    if (
      ipAddress &&
      (await this.securityLogService.hasPreviousSuccessfulLoginFromOtherIp(
        user.id,
        ipAddress,
      ))
    ) {
      await this.securityLogService.create(
        'suspicious_activity',
        {
          userId: user.id,
          username: user.username,
          businessUnitId: user.businessUnitId,
          details: {
            reason:
              'Successful login from a new IP address',
            ipAddress,
            userAgent: ctx?.userAgent,
          },
        },
      );

      await this.mailService.sendSuspiciousLoginAlert(
        user.email,
        ipAddress,
        ctx?.userAgent ?? null,
      );
    }

    await this.securityLogService.create(
      'login_success',
      {
        userId: user.id,
        username: user.username,
        businessUnitId: user.businessUnitId,
      },
    );

    await user.update({
      failedLoginAttempts: 0,
      lockedUntil: null,
    });

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

    if (user.role === 'superadmin') {
      const allPermissions = await this.databaseService.Permission.findAll({
        attributes: ['permissionKey'],
      });

      permissions = Array.from(
        new Set(
          allPermissions
            .map((permission: any) => permission.permissionKey)
            .filter(Boolean),
        ),
      );
    } else if (roleIds.length) {
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

async logout(token: string, user?: any) {
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

  if (user) {
    await this.securityLogService.create('logout', {
      userId: user.id,
      username: user.username,
      businessUnitId: user.businessUnitId,
    });
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

  // ==========================
  // Forgot Password
  // ==========================

  async forgotPassword(email: string) {
    const genericResponse = {
      success: true,
      message:
        'If an account exists for that email, a reset link has been sent.',
    };

    const user =
      await this.databaseService.User.findOne({
        where: { email },
      });

    // Same response whether or not the email exists —
    // don't let this endpoint be used to enumerate accounts.
    if (!user) {
      return genericResponse;
    }

    const rawToken = crypto
      .randomBytes(32)
      .toString('hex');

    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await user.update({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expires,
    });

    const frontendUrl =
      process.env.FRONTEND_URL ||
      'http://localhost:5173';

    const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;

    await this.mailService.sendPasswordResetEmail(
      user.email,
      resetLink,
    );

    return genericResponse;
  }

  // ==========================
  // Reset Password
  // ==========================

  async resetPassword(
    token: string,
    password: string,
  ) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user =
      await this.databaseService.User.findOne({
        where: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: {
            [Op.gt]: new Date(),
          },
        },
      });

    if (!user) {
      throw new BadRequestException(
        'This reset link is invalid or has expired',
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10,
    );

    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    // Log the user out everywhere — a password reset should
    // invalidate any sessions that might be on a compromised device.
    await this.databaseService.LoginToken.update(
      { isRevoked: true },
      {
        where: {
          userId: user.id,
          isRevoked: false,
        },
      },
    );

    await this.securityLogService.create(
      'password_reset',
      {
        userId: user.id,
        username: user.username,
        businessUnitId: user.businessUnitId,
        details: {
          changedBy: 'reset-link',
        },
      },
    );

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }
}

  