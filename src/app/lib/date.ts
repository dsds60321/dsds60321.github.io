const parseStableDate = (value: string): Date => {
    const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (dateOnlyMatch) {
        const [, year, month, day] = dateOnlyMatch;
        return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    }

    return new Date(value);
};

export function formatDate(date: string, locale = 'ko-KR'): string {
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    }).format(parseStableDate(date));
}
