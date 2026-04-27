import { NotFoundException } from '@nestjs/common';
import {
  findByIdOrThrow,
  findOneOrThrow,
} from './find-or-throw.helpers';

describe('find-or-throw.helpers', () => {
  it('returns the found entity for id lookups', async () => {
    const repo = {
      findOne: jest.fn(() => Promise.resolve({ id: 'user-1' })),
    };

    await expect(findByIdOrThrow(repo, 'user-1', 'User')).resolves.toEqual({
      id: 'user-1',
    });
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 'user-1' },
    });
  });

  it('adds a default not-found suffix when given an entity name', async () => {
    const repo = {
      findOne: jest.fn(() => Promise.resolve(null)),
    };

    await expect(findByIdOrThrow(repo, 'user-1', 'User')).rejects.toEqual(
      new NotFoundException('User not found'),
    );
  });

  it('preserves custom not-found messages', async () => {
    const repo = {
      findOne: jest.fn(() => Promise.resolve(null)),
    };

    await expect(
      findOneOrThrow(repo, { id: 'inquiry-1' }, 'Inquiry not found for this RFQ.'),
    ).rejects.toEqual(new NotFoundException('Inquiry not found for this RFQ.'));
  });
});
