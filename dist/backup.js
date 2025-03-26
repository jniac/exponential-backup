import * as fs from 'fs/promises';
import path from 'path';
import { TimeRangeMap } from './range.js';
import { cleanKeys, formatTable, formatTimespan } from './utils.js';
const defaultOptions = {
    destination: 'backups',
    dryRun: false,
    verbose: false,
    strategy: 'exponentionalWithFlatDay',
};
async function backupWithPruning(source, incomingOptions) {
    const { destination, strategy, dryRun, verbose } = {
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
    // Compute the file to keep
    const keep = new Set();
    for (const { start, end, values } of rangeMap.ranges()) {
        // Keep all files of the first and last range
        const keepAll = start === 0 || end === Infinity;
        if (keepAll) {
            for (const file of values) {
                keep.add(file);
            }
        }
        // Keep the last file (oldest) of each range
        else {
            if (values.length > 0)
                keep.add(values[values.length - 1]);
        }
    }
    // Dry run
    if (dryRun || verbose) {
        console.log(`Range strategy: ${rangeMap.markersStrategy}`);
        console.log(formatTable(rangeMap.rangeInfo()));
        console.log(`Files to delete: ${backups.length - keep.size}`);
        let filesToDelete = backups.filter(b => !keep.has(b.file))
            .slice(0)
            .reverse()
            .map((b, index) => ({ index: index.toString(), file: b.file, age: formatTimespan(now - b.timestamp) }));
        if (filesToDelete.length === 0) {
            filesToDelete = [{ index: '-', file: 'No files to delete', age: '-' }];
        }
        if (filesToDelete.length > 8) {
            const msg = `... and ${filesToDelete.length - 8} more`;
            const age = `> ${filesToDelete[8].age}`;
            filesToDelete = filesToDelete
                .slice(0, 8)
                .concat([{ index: '...', file: msg, age }]);
        }
        console.table(formatTable(filesToDelete));
    }
    if (dryRun === false) {
        for (const { file } of backups) {
            if (!keep.has(file)) {
                await fs.unlink(path.join(finalDestination, file));
            }
        }
    }
}
export { backupWithPruning, defaultOptions as defaultBackupWithPruningOptions };
