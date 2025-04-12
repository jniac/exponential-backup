import { createHash } from 'crypto';
import { readFileSync, statSync, unlinkSync } from 'fs'; // sync is ok here
function getFileHash(filePath) {
    const buffer = readFileSync(filePath);
    return createHash('sha256').update(buffer).digest('hex');
}
export function removeConsecutiveDuplicates(backupPaths, { dryRun = false, verbose = false, } = {}) {
    let previousSize = null;
    let previousHash = null;
    let previousPath = null;
    for (const currentPath of backupPaths) {
        const currentSize = statSync(currentPath).size;
        if (previousSize === currentSize && previousPath) {
            const currentHash = getFileHash(currentPath);
            previousHash ??= getFileHash(previousPath);
            if (currentHash === previousHash) {
                if (!dryRun) {
                    unlinkSync(previousPath);
                    if (verbose) {
                        console.log(`🗑️ Deleted duplicate backup: ${previousPath}`);
                    }
                }
                else {
                    console.log(`🗑️ Would delete duplicate backup: ${previousPath}`);
                }
                // Only keep current
                previousPath = currentPath;
                previousSize = currentSize;
                previousHash = currentHash;
                continue;
            }
            previousHash = currentHash;
        }
        previousSize = currentSize;
        previousPath = currentPath;
    }
}
