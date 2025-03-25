import { copyFile, mkdir, readdir } from 'fs/promises';
import path, { extname, join } from 'path';
import { TimeRangeMap } from './range.js';
const defaultOptions = {
    destination: 'backups',
    dryRun: false,
    strategy: 'exponentionalWithFlatDay',
};
async function backupWithPruning(source, incomingOptions) {
    const { destination, strategy } = {
        ...defaultOptions,
        ...incomingOptions,
    };
    const finalDestination = path.join(path.dirname(source), destination);
    await mkdir(finalDestination, { recursive: true });
    const now = Date.now();
    const sourceBasename = path.basename(source).split('.')[0];
    const fileName = `${sourceBasename}-${new Date(now).toISOString().slice(0, -1).replace(/[T:.]/g, '-')}`;
    const ext = extname(source);
    const fullName = join(finalDestination, `${fileName}${ext}`);
    await copyFile(source, fullName);
    const files = (await readdir(finalDestination)).sort();
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
    console.log(rangeMap.rangeInfo());
    for (const { file } of backups) {
        if (!keep.has(file)) {
            // await unlink(join(finalDestination, file))
        }
    }
}
export { backupWithPruning, defaultOptions as defaultBackupWithPruningOptions };
