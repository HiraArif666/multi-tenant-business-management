import { Injectable, OnModuleInit } from '@nestjs/common';
import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

import { initUserModel } from './models/user.model';
import { initLoginTokenModel } from './models/login-token.model';
import { initCompanyTypeModel } from './models/company-type.model';
import { initBusinessUnitModel } from './models/business-unit.model';
import { initCompanyModel } from './models/company.model';

dotenv.config();

@Injectable()
export class DatabaseService implements OnModuleInit {
  private sequelize!: Sequelize;

  public User: any;
  public LoginToken: any;
  public CompanyType: any;
  public BusinessUnit: any;
  public Company: any;

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

      // Initialize Models
      this.User = initUserModel(this.sequelize);
      this.LoginToken = initLoginTokenModel(this.sequelize);
      this.CompanyType = initCompanyTypeModel(this.sequelize);
      this.BusinessUnit = initBusinessUnitModel(this.sequelize);
      this.Company = initCompanyModel(this.sequelize);

      // Setup Relationships
      this.setupRelationships();

// Database schema is managed using Sequelize migrations.

      console.log('✓ Database schema synchronized');
      console.log('✓ Models initialized successfully');
    } catch (error) {
      console.error('✗ Database connection failed:', error);
      throw error;
    }

    return this.sequelize;
  }

  private setupRelationships() {
    // ==========================
    // User <-> LoginToken
    // ==========================
    this.User.hasMany(this.LoginToken, {
      foreignKey: 'userId',
      as: 'loginTokens',
    });

    this.LoginToken.belongsTo(this.User, {
      foreignKey: 'userId',
      as: 'user',
    });

    // ==========================
    // Business Unit
    // ==========================
    this.BusinessUnit.belongsTo(this.User, {
      foreignKey: 'adminId',
      as: 'admin',
    });

    this.BusinessUnit.hasMany(this.Company, {
      foreignKey: 'businessUnitId',
      as: 'companies',
    });

    this.BusinessUnit.hasMany(this.User, {
      foreignKey: 'businessUnitId',
      as: 'users',
    });

    // ==========================
    // Company
    // ==========================
    this.Company.belongsTo(this.BusinessUnit, {
      foreignKey: 'businessUnitId',
      as: 'businessUnit',
    });

    this.Company.belongsTo(this.CompanyType, {
      foreignKey: 'companyTypeId',
      as: 'companyType',
    });

    this.Company.belongsTo(this.User, {
      foreignKey: 'adminId',
      as: 'admin',
    });

    this.Company.hasMany(this.User, {
      foreignKey: 'companyId',
      as: 'users',
    });

    // ==========================
    // User
    // ==========================
    this.User.belongsTo(this.BusinessUnit, {
      foreignKey: 'businessUnitId',
      as: 'businessUnit',
    });

    this.User.belongsTo(this.Company, {
      foreignKey: 'companyId',
      as: 'company',
    });
  }

  getSequelize() {
    return this.sequelize;
  }
}