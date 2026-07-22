import { Injectable, OnModuleInit } from '@nestjs/common';
import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

import { initUserModel } from './models/user.model';
import { initLoginTokenModel } from './models/login-token.model';
import { initCompanyTypeModel } from './models/company-type.model';
import { initBusinessUnitModel } from './models/business-unit.model';
import { initCompanyModel } from './models/company.model';

import { initRoleModel } from './models/role.model';
import { initPermissionModel } from './models/permission.model';
import { initRolePermissionModel } from './models/role-permission.model';
import { initUserRoleModel } from './models/user-role.model';

import { setupAuthAssociations } from './associations/auth.association';
import { setupBusinessUnitAssociations } from './associations/business-unit.association';
import { setupCompanyAssociations } from './associations/company.association';
import { setupUserAssociations } from './associations/user.association';
import { setupRbacAssociations } from './associations/rbac.association';

import { seedSuperAdmin } from './seeder';
import { seedPermissions } from './permission.seeder';
dotenv.config();

@Injectable()
export class DatabaseService implements OnModuleInit {
  private sequelize!: Sequelize;

  public User: any;
  public LoginToken: any;
  public CompanyType: any;
  public BusinessUnit: any;
  public Company: any;

  // RBAC
  public Role: any;
  public Permission: any;
  public RolePermission: any;
  public UserRole: any;

  async onModuleInit() {
    await this.initialize();
  }

  async initialize() {
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_DATABASE:', process.env.DB_DATABASE);
    console.log('DB_USERNAME:', process.env.DB_USERNAME);

    this.sequelize = new Sequelize({
      database: process.env.DB_DATABASE || 'multi_tenant_db',
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres123',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      dialect: 'postgres',
      logging: false,
    });

    try {
      await this.sequelize.authenticate();
      console.log('✓ Database connected successfully');

      // ==========================
      // Initialize Models
      // ==========================

      this.User = initUserModel(this.sequelize);
      this.LoginToken = initLoginTokenModel(this.sequelize);
      this.CompanyType = initCompanyTypeModel(this.sequelize);
      this.BusinessUnit = initBusinessUnitModel(this.sequelize);
      this.Company = initCompanyModel(this.sequelize);

      // RBAC Models

      this.Role = initRoleModel(this.sequelize);
      this.Permission = initPermissionModel(this.sequelize);
      this.RolePermission =
        initRolePermissionModel(this.sequelize);
      this.UserRole = initUserRoleModel(this.sequelize);

      // ==========================
      // Setup Associations
      // ==========================

      this.setupRelationships();

      // ==========================
      // Seed Data
      // ==========================

      await seedSuperAdmin(this);
      await seedPermissions(this);

      console.log('✓ Database initialized successfully');
    } catch (error) {
      console.error('✗ Database connection failed:', error);
      throw error;
    }

    return this.sequelize;
  }

  private setupRelationships() {
    const models = {
      User: this.User,
      LoginToken: this.LoginToken,
      CompanyType: this.CompanyType,
      BusinessUnit: this.BusinessUnit,
      Company: this.Company,

      Role: this.Role,
      Permission: this.Permission,
      RolePermission: this.RolePermission,
      UserRole: this.UserRole,
    };

    setupAuthAssociations(models);

    setupBusinessUnitAssociations(models);

    setupCompanyAssociations(models);

    setupUserAssociations(models);

    setupRbacAssociations(models);
  }

  getSequelize() {
    return this.sequelize;
  }
}