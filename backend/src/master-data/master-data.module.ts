import { Module } from '@nestjs/common';

import { CompaniesModule } from '../companies/companies.module';

import { VendorsController } from './vendors.controller';
import { SuppliersController } from './suppliers.controller';
import { ContractorsController } from './contractors.controller';
import { ConsultantsController } from './consultants.controller';
import { CustomersController } from './customers.controller';

@Module({
  imports: [CompaniesModule],
  controllers: [
    VendorsController,
    SuppliersController,
    ContractorsController,
    ConsultantsController,
    CustomersController,
  ],
})
export class MasterDataModule {}