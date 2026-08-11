jest.mock('../src/config/prisma', () => ({
  volunteerProfile: {
    findUnique: jest.fn(),
  },
}));

const prisma = require('../src/config/prisma');
const { requireVolunteerProfile } = require('../src/middleware/volunteerProfileAuth');

describe('requireVolunteerProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls next when the user has a volunteer profile', async () => {
    prisma.volunteerProfile.findUnique.mockResolvedValue({ userId: 3 });
    const next = jest.fn();

    await requireVolunteerProfile({ user: { id: 3 } }, { status: jest.fn(), json: jest.fn() }, next);

    expect(next).toHaveBeenCalled();
  });

  it('returns 403 when the user has no volunteer profile', async () => {
    prisma.volunteerProfile.findUnique.mockResolvedValue(null);
    const json = jest.fn();
    const res = { status: jest.fn(() => ({ json })) };

    await requireVolunteerProfile({ user: { id: 3 } }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({ error: 'Forbidden' });
  });
});
