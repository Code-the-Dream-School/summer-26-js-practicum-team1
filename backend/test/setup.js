require('dotenv').config({ path: '.env.test' });

if (process.env.DATABASE_URL && !/test/i.test(process.env.DATABASE_URL)) {
  throw new Error(
    'Refusing to run tests: DATABASE_URL does not look like a test database ' +
      '(expected something containing "test"). Check .env.test.'
  );
}
