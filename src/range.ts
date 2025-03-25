import { formatTimespan } from './utils'

export const defaultExponentialOptions = {
  intervalMs: 1000 * 5, // 5 seconds
  levels: 14,
  expBase: 3,
}

export const exponential = (options: Partial<typeof defaultExponentialOptions>) => {
  const { intervalMs, levels, expBase } = {
    ...defaultExponentialOptions,
    ...options,
  }
  const markers = [0]
  for (let i = 0; i < levels; i++) {
    markers.push(expBase ** i * intervalMs)
  }
  return markers
}

export const rangeStrategies = {
  exponentionalWithFlatDay: () => {
    const expBase = 3
    const intervalMs = 1000 * 5
    const markers = [0]
    for (let i = 0; i < 6; i++) {
      markers.push(expBase ** i * intervalMs)
    }
    const hour = 60 * 60 * 1000
    markers.push(hour)
    markers.push(hour * 2)
    const flatInterval = 12
    for (let i = 1; i < flatInterval; i++) {
      markers.push((i + 1) * 2 * 60 * 60 * 1000)
    }
    const min = flatInterval * 2 * 60 * 60 * 1000
    for (let i = 9; i < 14; i++) {
      markers.push(min + expBase ** i * intervalMs)
    }
    return markers
  },
}

export type StrategyArg = Partial<typeof defaultExponentialOptions> | keyof typeof rangeStrategies

export class TimeRangeMap<T> {
  markers = rangeStrategies.exponentionalWithFlatDay()
  map = new Map<number, T>()

  add(time: number, value: T) {
    this.map.set(time, value)
  }

  *ranges() {
    const times = Array.from(this.map.keys()).sort((a, b) => a - b)
    const { map, markers } = this
    const n = markers.length
    let startIndex = 0, endIndex = 0
    for (let i = 1; i < n; i++) {
      const end = markers[i]
      while (times[endIndex] < end) {
        endIndex++
      }
      const start = markers[i - 1]
      const values = times.slice(startIndex, endIndex).map(t => map.get(t)!)
      yield { start, end, values }
      startIndex = endIndex
    }
    const values = times.slice(endIndex).map(t => map.get(t)!)
    yield { start: markers[n - 1], end: Infinity, values }
  }

  rangeInfo() {
    return Object.fromEntries([...this.ranges()].map(({ end, values }) => [`< ${formatTimespan(end)}`, values.length]))
  }

  strategy(arg: StrategyArg) {
    if (typeof arg === 'string') {
      this.markers = rangeStrategies[arg]()
    } else {
      this.markers = exponential(arg)
    }
    return this
  }
}
