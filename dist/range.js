import { formatTimespan } from './utils.js';
export const defaultExponentialOptions = {
    intervalMs: 1000 * 5, // 5 seconds
    levels: 14,
    expBase: 3,
};
export const exponential = (options) => {
    const { intervalMs, levels, expBase } = {
        ...defaultExponentialOptions,
        ...options,
    };
    const markers = [0];
    for (let i = 0; i < levels; i++) {
        markers.push(expBase ** i * intervalMs);
    }
    return markers;
};
export const rangeStrategies = {
    /**
     * An exponential strategy with a "flat-day" range in the middle (useful for dayly backups).
     */
    exponentionalWithFlatDay: () => {
        const expBase = 3;
        const intervalMs = 1000 * 5;
        const markers = [0];
        for (let i = 0; i < 6; i++) {
            markers.push(expBase ** i * intervalMs);
        }
        const hour = 60 * 60 * 1000;
        markers.push(hour);
        markers.push(hour * 2);
        const flatInterval = 12;
        for (let i = 1; i < flatInterval; i++) {
            markers.push((i + 1) * 2 * 60 * 60 * 1000);
        }
        const min = flatInterval * 2 * 60 * 60 * 1000;
        for (let i = 9; i < 14; i++) {
            markers.push(min + expBase ** i * intervalMs);
        }
        return markers;
    },
};
export class TimeRangeMap {
    markersStrategy = 'none';
    markers = rangeStrategies.exponentionalWithFlatDay();
    map = new Map();
    add(time, value) {
        this.map.set(time, value);
    }
    *ranges() {
        const times = Array.from(this.map.keys()).sort((a, b) => a - b);
        const { map, markers } = this;
        const n = markers.length;
        let startIndex = 0, endIndex = 0;
        for (let i = 1; i < n; i++) {
            const end = markers[i];
            while (times[endIndex] < end) {
                endIndex++;
            }
            const start = markers[i - 1];
            const values = times.slice(startIndex, endIndex).map(t => map.get(t));
            yield { start, end, values };
            startIndex = endIndex;
        }
        const values = times.slice(endIndex).map(t => map.get(t));
        yield { start: markers[n - 1], end: Infinity, values };
    }
    rangeInfo() {
        return [...this.ranges()].map(({ end, values }, index) => ({ index, end: `< ${formatTimespan(end)}`, count: values.length > 0 ? values.length : '' }));
    }
    strategy(arg) {
        if (typeof arg === 'string') {
            this.markersStrategy = arg;
            this.markers = rangeStrategies[arg]();
        }
        else {
            this.markersStrategy = `exponential(${JSON.stringify(arg).replace(/"/g, '')})`;
            this.markers = exponential(arg);
        }
        return this;
    }
}
