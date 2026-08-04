const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { registerSchema } = require('./registerSchema');

const validBody = {
  name: 'Derya Kendircikahraman',
  email: 'deryakendircikahraman@example.com',
  password: 'SecurePass1',
  dob: '1990-05-15',
  gender: 'FEMALE',
};

describe('registerSchema', () => {
  it('accepts valid input and lowercases email', () => {
    const { error, value } = registerSchema.validate({
      ...validBody,
      email: 'DeryaKendircikahraman@Example.com',
    });

    assert.equal(error, undefined);
    assert.equal(value.email, 'deryakendircikahraman@example.com');
  });

  it('rejects a weak password', () => {
    const { error } = registerSchema.validate({
      ...validBody,
      password: 'password',
    });

    assert.ok(error);
  });

  it('rejects users under 18', () => {
    const { error } = registerSchema.validate({
      ...validBody,
      dob: '2015-01-01',
    });

    assert.ok(error);
    assert.equal(error.details[0].message, 'You must be at least 18 years old');
  });

  it('rejects role in the request body', () => {
    const { error } = registerSchema.validate({
      ...validBody,
      role: 'ADMIN',
    });

    assert.ok(error);
  });

  it('allows phone to be omitted', () => {
    const { error } = registerSchema.validate(validBody);
    assert.equal(error, undefined);
  });

  it('rejects an empty name', () => {
    const { error } = registerSchema.validate({
      ...validBody,
      name: '',
    });

    assert.ok(error);
  });
});
