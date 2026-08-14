const { registerSchema } = require('../src/validations/registerSchema');

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

    expect(error).toBeUndefined();
    expect(value.email).toBe('deryakendircikahraman@example.com');
  });

  it('rejects a weak password', () => {
    const { error } = registerSchema.validate({
      ...validBody,
      password: 'password',
    });

    expect(error).toBeDefined();
  });

  it('rejects users under 18', () => {
    const { error } = registerSchema.validate({
      ...validBody,
      dob: '2015-01-01',
    });

    expect(error).toBeDefined();
    expect(error.details[0].message).toBe('You must be at least 18 years old');
  });

  it('rejects role in the request body', () => {
    const { error } = registerSchema.validate({
      ...validBody,
      role: 'ADMIN',
    });

    expect(error).toBeDefined();
  });

  it('allows phone to be omitted', () => {
    const { error } = registerSchema.validate(validBody);
    expect(error).toBeUndefined();
  });

  it('rejects an empty name', () => {
    const { error } = registerSchema.validate({
      ...validBody,
      name: '',
    });

    expect(error).toBeDefined();
  });

  it('defaults accountType to requester', () => {
    const { error, value } = registerSchema.validate(validBody);

    expect(error).toBeUndefined();
    expect(value.accountType).toBe('requester');
  });

  it('accepts volunteer accountType', () => {
    const { error, value } = registerSchema.validate({
      ...validBody,
      accountType: 'volunteer',
    });

    expect(error).toBeUndefined();
    expect(value.accountType).toBe('volunteer');
  });

  it('rejects an invalid accountType', () => {
    const { error } = registerSchema.validate({
      ...validBody,
      accountType: 'admin',
    });

    expect(error).toBeDefined();
  });
});
