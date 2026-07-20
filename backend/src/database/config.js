module.exports = {
  development: {
    username: 'postgres',
    password: 'postgres123',
    database: 'multi_tenant_db',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
  },
  test: {
    username: 'postgres',
    password: 'postgres123',
    database: 'multi_tenant_test_db',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
  },
};