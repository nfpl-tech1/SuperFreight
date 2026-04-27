export function groupBy<TItem, TKey extends PropertyKey>(
  items: TItem[],
  keySelector: (item: TItem) => TKey,
) {
  const groups = new Map<TKey, TItem[]>();

  for (const item of items) {
    const key = keySelector(item);
    const existing = groups.get(key);
    if (existing) {
      existing.push(item);
      continue;
    }

    groups.set(key, [item]);
  }

  return groups;
}

export function groupMappedBy<TItem, TValue, TKey extends PropertyKey>(
  items: TItem[],
  keySelector: (item: TItem) => TKey,
  valueSelector: (item: TItem) => TValue | undefined,
) {
  const groups = new Map<TKey, TValue[]>();

  for (const item of items) {
    const value = valueSelector(item);
    if (!value) {
      continue;
    }

    const key = keySelector(item);
    const existing = groups.get(key);
    if (existing) {
      existing.push(value);
      continue;
    }

    groups.set(key, [value]);
  }

  return groups;
}

export function isNonEmpty(value: string | null | undefined): value is string {
  return Boolean(value && value.trim());
}
