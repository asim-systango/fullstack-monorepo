export function extractData<T>(payload: unknown): T {
    let current: unknown = payload;

    while (
        current !== null &&
        typeof current === 'object' &&
        'data' in current
    ) {
        const inner = (current as { data: unknown }).data;
        if (
            inner !== null &&
            typeof inner === 'object' &&
            'id' in (inner as object)
        ) {
            return inner as T;
        }
        current = inner;
    }

    return current as T;
}
