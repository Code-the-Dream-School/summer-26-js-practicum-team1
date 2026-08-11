const {
  volunteerPreferencesSchema,
} = require('../src/validations/volunteerPreferencesSchema');

const validBody = {
  serviceArea: 'Boston, MA',
  availability: {
    frequency: 'WEEKLY',
    slots: [
      { dayOfWeek: 'MON', startTime: '09:00', endTime: '12:00' },
      { dayOfWeek: 'FRI', startTime: '14:00', endTime: '18:00' },
    ],
  },
  interestIds: [1, 2],
};

describe('volunteerPreferencesSchema', () => {
  it('accepts valid preferences', () => {
    const { error } = volunteerPreferencesSchema.validate(validBody);
    expect(error).toBeUndefined();
  });

  it('allows null serviceArea and availability', () => {
    const { error } = volunteerPreferencesSchema.validate({
      serviceArea: null,
      availability: null,
      interestIds: [],
    });

    expect(error).toBeUndefined();
  });

  it('rejects endTime before startTime', () => {
    const { error } = volunteerPreferencesSchema.validate({
      ...validBody,
      availability: {
        frequency: 'WEEKLY',
        slots: [{ dayOfWeek: 'MON', startTime: '12:00', endTime: '09:00' }],
      },
    });

    expect(error).toBeDefined();
  });

  it('rejects overlapping slots on the same day', () => {
    const { error } = volunteerPreferencesSchema.validate({
      ...validBody,
      availability: {
        frequency: 'WEEKLY',
        slots: [
          { dayOfWeek: 'MON', startTime: '09:00', endTime: '12:00' },
          { dayOfWeek: 'MON', startTime: '11:00', endTime: '13:00' },
        ],
      },
    });

    expect(error).toBeDefined();
  });

  it('rejects duplicate interestIds', () => {
    const { error } = volunteerPreferencesSchema.validate({
      ...validBody,
      interestIds: [1, 1],
    });

    expect(error).toBeDefined();
  });
});
