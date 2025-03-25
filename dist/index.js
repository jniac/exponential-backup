import * as fs from 'fs/promises';
import path from 'path';
import { TimeRangeMap } from './range.js';
import { cleanKeys, formatTimespan } from './utils.js';
const defaultOptions = {
    destination: 'backups',
    dryRun: false,
    strategy: 'exponentionalWithFlatDay',
};
async function backupWithPruning(source, incomingOptions) {
    const { destination, strategy, dryRun } = {
        ...defaultOptions,
        ...cleanKeys(incomingOptions),
    };
    const finalDestination = path.join(path.dirname(source), destination);
    await fs.mkdir(finalDestination, { recursive: true });
    const now = Date.now();
    const sourceBasename = path.basename(source).split('.')[0];
    const fileName = `${sourceBasename}-${new Date(now).toISOString().slice(0, -1).replace(/[T:.]/g, '-')}`;
    const ext = path.extname(source);
    const fullName = path.join(finalDestination, `${fileName}${ext}`);
    await fs.copyFile(source, fullName);
    const files = (await fs.readdir(finalDestination)).sort();
    const backups = files.map((file) => {
        const [YYYY, MM, DD, hh, mm, ss, ms] = file.replace(`${sourceBasename}-`, '').replace(ext, '').split('-');
        const timestamp = new Date(`${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}.${ms}Z`).getTime();
        return { file, timestamp };
    }).filter(b => !isNaN(b.timestamp));
    const rangeMap = new TimeRangeMap().strategy(strategy);
    for (const { file, timestamp } of backups) {
        rangeMap.add(now - timestamp, file);
    }
    const keep = new Set();
    for (const { start, end, values } of rangeMap.ranges()) {
        // Keep all files of the first and last range
        const keepAll = start === 0 || end === Infinity;
        if (keepAll) {
            for (const file of values) {
                keep.add(file);
            }
        }
        else {
            if (values.length > 0)
                keep.add(values[values.length - 1]);
        }
    }
    if (dryRun === false) {
        for (const { file } of backups) {
            if (!keep.has(file)) {
                await fs.unlink(path.join(finalDestination, file));
            }
        }
    }
    else {
        console.table(rangeMap.rangeInfo());
        console.log(`Would delete ${backups.length - keep.size} files:${backups.filter(b => !keep.has(b.file)).map(b => `\n  ${b.file} (${formatTimespan(now - b.timestamp)})`).join('')}`);
    }
}
export { backupWithPruning, defaultOptions as defaultBackupWithPruningOptions };
