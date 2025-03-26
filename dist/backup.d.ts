import { StrategyArg } from './range';
declare const defaultOptions: {
    destination: string;
    dryRun: boolean;
    verbose: boolean;
    strategy: StrategyArg;
};
type Options = Partial<typeof defaultOptions>;
declare function backupWithPruning(source: string, incomingOptions: Options): Promise<void>;
export { backupWithPruning, Options as BackupWithPruningOptions, defaultOptions as defaultBackupWithPruningOptions };
