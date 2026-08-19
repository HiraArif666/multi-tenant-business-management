import { Injectable, OnModuleInit } from '@nestjs/common';
import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

import { initUserModel } from './models/user.model';
import { initLoginTokenModel } from './models/login-token.model';
import { initCompanyTypeModel } from './models/company-type.model';
import { initBusinessUnitModel } from './models/business-unit.model';
import { initCompanyModel } from './models/company.model';
import { initFileModel } from './models/file.model';
import { initExpenseModel } from './models/expense.model';
import { initApprovalSettingModel } from './models/approval-setting.model';
import { initApprovalSettingApproverModel } from './models/approval-setting-approver.model';
import { initAuditLogModel } from './models/audit-log.model';
import { registerAuditHooks } from '../audit-log/audit-hooks';

import { initRoleModel } from './models/role.model';
import { initPermissionModel } from './models/permission.model';
import { initRolePermissionModel } from './models/role-permission.model';
import { initUserRoleModel } from './models/user-role.model';

import { setupAuthAssociations } from './associations/auth.association';
import { setupBusinessUnitAssociations } from './associations/business-unit.association';
import { setupCompanyAssociations } from './associations/company.association';
import { setupUserAssociations } from './associations/user.association';
import { setupRbacAssociations } from './associations/rbac.association';
import {
  setupExpenseAssociations,
  setupApprovalSettingAssociations,
} from './associations/expense.association';

import { initSecurityLogModel } from './models/security-log.model';

import { seedSuperAdmin } from './seeder';
import { seedPermissions } from './permission.seeder';
import { seedCompanyTypes } from './company-type.seeder';
import {
  seedRoles,
  seedRolePermissions,
  seedSuperAdminRole,
} from './rbac.seeder';
import { initReportModel } from './models/report.model';
import {initJobScheduleModel} from './models/jobschedule.model';
import { initNotificationModel } from './models/notification.model';

dotenv.config();

@Injectable()
export class DatabaseService implements OnModuleInit {
  private sequelize!: Sequelize;

  public User: any;
  public LoginToken: any;
  public CompanyType: any;
  public BusinessUnit: any;
  public Company: any;
  public File: any;
  public Expense: any;
  public ApprovalSetting: any;
  public ApprovalSettingApprover: any;
  public AuditLog: any;
public Notification: any;

  // RBAC
  public Role: any;
  public Permission: any;
  public RolePermission: any;
  public UserRole: any;
  
  public SecurityLog: any;
  SelectedBusinessUnit: any;
  public Report!: typeof import('./models/report.model').Report;
  public JobSchedule: any;

  async onModuleInit() {
    await this.initialize();
  }

  async initialize() {
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
      this.File = initFileModel(this.sequelize);
      this.Expense = initExpenseModel(this.sequelize);
      this.ApprovalSetting = initApprovalSettingModel(this.sequelize);
      this.ApprovalSettingApprover = initApprovalSettingApproverModel(this.sequelize);
      this.AuditLog = initAuditLogModel(this.sequelize);
this.Notification = initNotificationModel(this.sequelize);
      // RBAC Models

      this.Role = initRoleModel(this.sequelize);
      this.Permission = initPermissionModel(this.sequelize);
      this.RolePermission = initRolePermissionModel(this.sequelize);
      this.UserRole = initUserRoleModel(this.sequelize);
      this.SecurityLog = initSecurityLogModel(this.sequelize);
      this.Report = initReportModel(this.sequelize);

      // ==========================
      // Setup Associations
      // ==========================

      // initialization:
      this.JobSchedule = initJobScheduleModel(this.sequelize);
      this.setupRelationships();

      // ==========================
      // Seed Data (ORDER MATTERS)
      // ==========================

      // 1. Permissions
      await seedPermissions(this);

      // 2. System Roles
      await seedRoles(this);

      // 2b. Master Data Company Types
      await seedCompanyTypes(this);

      // 3. Role -> Permission mapping
      await seedRolePermissions(this);

      // 4. Super Admin User
      await seedSuperAdmin(this);

      // 5. Assign Super Admin Role
      await seedSuperAdminRole(this);

      // ==========================
      // Audit Logging (must be last — after seeding, so
      // seed-time inserts don't get logged as "user actions")
      // ==========================

      registerAuditHooks(this.User, this.AuditLog, {
        module: 'Users',
        tableName: 'users',
      });

      registerAuditHooks(this.BusinessUnit, this.AuditLog, {
        module: 'Business Units',
        tableName: 'business_units',
      });

      registerAuditHooks(this.Company, this.AuditLog, {
        module: 'Master Data',
        tableName: 'companies',
      });

      registerAuditHooks(this.CompanyType, this.AuditLog, {
        module: 'Company Types',
        tableName: 'company_types',
      });

      registerAuditHooks(this.Role, this.AuditLog, {
        module: 'Roles',
        tableName: 'roles',
      });

      registerAuditHooks(this.Expense, this.AuditLog, {
        module: 'Expenses',
        tableName: 'expenses',
      });

      registerAuditHooks(this.ApprovalSetting, this.AuditLog, {
        module: 'Settings',
        tableName: 'approval_settings',
      });

      console.log('✓ Audit logging enabled');

      console.log('✓ Database initialized successfully');
    } catch (error) {
      console.error('✗ Database initialization failed:', error);
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

      Expense: this.Expense,
      ApprovalSetting: this.ApprovalSetting,
      ApprovalSettingApprover: this.ApprovalSettingApprover,
    };

    setupAuthAssociations(models);
    setupBusinessUnitAssociations(models);
    setupCompanyAssociations(models);
    setupUserAssociations(models);
    setupRbacAssociations(models);
    setupExpenseAssociations(models);
    setupApprovalSettingAssociations(models);
  }

  getSequelize() {
    return this.sequelize;
  }
}