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
  private readonly jwtExpiry = '24h';

  constructor(private databaseService: DatabaseService) {}

  // ✅ SEED SUPERADMIN
  async createSuperAdmin() {
    try {
      const existingAdmin = await this.databaseService.User.findOne({
        where: { username: 'superadmin' },
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

      const hashedPassword = await bcrypt.hash('admin123', 10);

      const superAdmin = await this.databaseService.User.create({
        username: 'superadmin',
        email: 'superadmin@app.com',
        password: hashedPassword,
        name: 'Super Admin',
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
          username: 'superadmin',
          password: 'admin123',
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
  async login(username: string, password: string) {
    try {
      console.log('🔍 Login attempt:', username);

      username = username?.trim();
      password = password?.trim();

      const user = await this.databaseService.User.findOne({
        where: { username },
        raw: true,
      });

      console.log('👤 User found:', user?.username);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          businessUnitId: user.businessUnitId,
          companyId: user.companyId,
        },
        this.jwtSecret,
        {
          expiresIn: this.jwtExpiry,
        },
      );

      const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      );

      await this.databaseService.LoginToken.create({
        userId: user.id,
        token,
        expiresAt,
      });

      console.log('✓ Login successful');

      return {
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          businessUnitId: user.businessUnitId,
          companyId: user.companyId,
        },
        token,
      };
    } catch (error: any) {
      console.error('❌ Login error:', error.message);

      throw new UnauthorizedException(
        error.message || 'Login failed',
      );
    }
  }

  // ✅ CREATE USER
  async createUser(userData: any, adminUser: any) {
    try {
      console.log('👤 Creating user by:', adminUser.username);

      const validRoles = [
        'superadmin',
        'bu-admin',
        'company-admin',
      ];

      if (!validRoles.includes(adminUser.role)) {
        throw new ForbiddenException(
          'Only admins can create users',
        );
      }

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

      let finalBusinessUnitId = userData.businessUnitId;
      let finalCompanyId = userData.companyId;

      if (adminUser.role === 'bu-admin') {
        if (
          userData.businessUnitId &&
          userData.businessUnitId !==
            adminUser.businessUnitId
        ) {
          throw new ForbiddenException(
            'BU-Admin can only create users in their own BusinessUnit',
          );
        }

        finalBusinessUnitId = adminUser.businessUnitId;
      }

      if (adminUser.role === 'company-admin') {
        if (
          userData.companyId &&
          userData.companyId !== adminUser.companyId
        ) {
          throw new ForbiddenException(
            'Company-Admin can only create users in their own company',
          );
        }

        finalBusinessUnitId = adminUser.businessUnitId;
        finalCompanyId = adminUser.companyId;
      }

      const hashedPassword = await bcrypt.hash(
        userData.password,
        10,
      );

      const user = await this.databaseService.User.create({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: userData.role || 'user',
        businessUnitId: finalBusinessUnitId || null,
        companyId: finalCompanyId || null,
        isActive: true,

        // Audit Fields
        createdBy: adminUser.id,
        updatedBy: null,
        deletedBy: null,
      });

      console.log('✓ User created:', user.username);

      return {
        success: true,
        message: 'User created successfully',
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
      return jwt.verify(token, this.jwtSecret);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}