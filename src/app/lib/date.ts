export function formatDate(date: string, locale = 'ko-KR'): string {
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(date));
}
