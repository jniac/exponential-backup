export function cleanKeys(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));
}
export function formatTimespan(ms) {
    if (Number.isFinite(ms) === false)
        return ms.toString();
    if (ms < 1000)
        return `${ms}ms`;
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    const s = sec % 60;
    const m = min % 60;
    const h = hr % 24;
    const d = day;
    const parts = [];
    let push = false;
    if (push ||= d > 0)
        parts.push(`${d}d`);
    if (d < 2) { // Show hours if less than 2 days
        if (push ||= h > 0)
            parts.push(`${h.toString().padStart(2, '0')}h`);
        if (push ||= m > 0)
            parts.push(`${m.toString().padStart(2, '0')}m`);
        if (push ||= s > 0)
            parts.push(`${s.toString().padStart(2, '0')}s`);
    }
    return parts.slice(0, 2).join(' ');
}
export function formatTable(rows) {
    if (rows.length === 0)
        return '';
    const lines = [];
    const headers = Object.keys(rows[0]);
    const colWidths = headers
        .map(h => Math.max(h.length, ...rows.map(row => String(row[h]).length)));
    const paddedWidths = colWidths.map(w => w + 2);
    const buildLine = (left, mid, right, fill) => left +
        paddedWidths.map(w => fill.repeat(w)).join(mid) +
        right;
    const formatRow = (values) => '│ ' +
        values.map((val, i) => val.padEnd(colWidths[i])).join(' │ ') +
        ' │';
    // Top border
    lines.push(buildLine('┌', '┬', '┐', '─'));
    // Header row
    lines.push(formatRow(headers));
    // Divider
    lines.push(buildLine('├', '┼', '┤', '─'));
    // Rows
    for (const row of rows) {
        const values = headers.map(h => String(row[h]));
        lines.push(formatRow(values));
    }
    // Bottom border
    lines.push(buildLine('└', '┴', '┘', '─'));
    return lines.join('\n');
}
