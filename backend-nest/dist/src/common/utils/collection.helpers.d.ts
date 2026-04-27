export declare function groupBy<TItem, TKey extends PropertyKey>(items: TItem[], keySelector: (item: TItem) => TKey): Map<TKey, TItem[]>;
export declare function groupMappedBy<TItem, TValue, TKey extends PropertyKey>(items: TItem[], keySelector: (item: TItem) => TKey, valueSelector: (item: TItem) => TValue | undefined): Map<TKey, TValue[]>;
export declare function isNonEmpty(value: string | null | undefined): value is string;
