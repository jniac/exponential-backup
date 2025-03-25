export declare const defaultExponentialOptions: {
    intervalMs: number;
    levels: number;
    expBase: number;
};
export declare const exponential: (options: Partial<typeof defaultExponentialOptions>) => number[];
export declare const rangeStrategies: {
    exponentionalWithFlatDay: () => number[];
};
export type StrategyArg = Partial<typeof defaultExponentialOptions> | keyof typeof rangeStrategies;
export declare class TimeRangeMap<T> {
    markers: number[];
    map: Map<number, T>;
    add(time: number, value: T): void;
    ranges(): Generator<{
        start: number;
        end: number;
        values: NonNullable<T>[];
    }, void, unknown>;
    rangeInfo(): void;
    strategy(arg: StrategyArg): this;
}
