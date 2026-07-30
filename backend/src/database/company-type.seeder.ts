import { DatabaseService } from './database.service';

export async function seedCompanyTypes(
  database: DatabaseService,
) {
  const companyTypes = [
    'Vendor',
    'Supplier',
    'Contractor',
    'Consultant',
    'Customer',
  ];

  for (const name of companyTypes) {
    const exists = await database.CompanyType.findOne({
      where: { name },
    });

    if (!exists) {
      await database.CompanyType.create({
        name,
        description: null,
      });

      console.log(`✓ Company Type created: ${name}`);
    }
  }

  console.log('✓ Company Types seeded successfully');
}