import {
  groupBy,
  groupMappedBy,
  isNonEmpty,
} from './collection.helpers';

describe('collection.helpers', () => {
  it('groups items by key while preserving insertion order within each group', () => {
    const grouped = groupBy(
      [
        { officeId: 'office-1', name: 'Alice' },
        { officeId: 'office-2', name: 'Bob' },
        { officeId: 'office-1', name: 'Carol' },
      ],
      (item) => item.officeId,
    );

    expect(grouped.get('office-1')).toEqual([
      { officeId: 'office-1', name: 'Alice' },
      { officeId: 'office-1', name: 'Carol' },
    ]);
    expect(grouped.get('office-2')).toEqual([
      { officeId: 'office-2', name: 'Bob' },
    ]);
  });

  it('groups mapped values and skips undefined mappings', () => {
    const grouped = groupMappedBy(
      [
        { officeId: 'office-1', port: 'Nhava Sheva' },
        { officeId: 'office-1', port: undefined },
        { officeId: 'office-2', port: 'Jebel Ali' },
      ],
      (item) => item.officeId,
      (item) => item.port,
    );

    expect(grouped.get('office-1')).toEqual(['Nhava Sheva']);
    expect(grouped.get('office-2')).toEqual(['Jebel Ali']);
  });

  it('identifies non-empty trimmed strings', () => {
    expect(isNonEmpty('  value  ')).toBe(true);
    expect(isNonEmpty('   ')).toBe(false);
    expect(isNonEmpty(null)).toBe(false);
    expect(isNonEmpty(undefined)).toBe(false);
  });
});
