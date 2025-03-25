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
    if (d > 0)
        parts.push(`${d}d`);
    if (d < 3) {
        if (h > 0)
            parts.push(`${h.toString().padStart(2, '0')}h`);
        if (m > 0 || h > 0)
            parts.push(`${m.toString().padStart(2, '0')}m`);
        if (h < 3) {
            parts.push(`${s.toString().padStart(2, '0')}s`); // show seconds if short
        }
    }
    return parts.join(' ');
}
