import { createHash } from 'crypto'
import { readFileSync, statSync, unlinkSync } from 'fs' // sync is ok here

function getFileHash(filePath: string): string {
  const buffer = readFileSync(filePath)
  return createHash('sha256').update(buffer).digest('hex')
}

export function removeConsecutiveDuplicates(backupPaths: string[], {
  dryRun = false,
  verbose = false,
} = {}): void {
  let previousSize: number | null = null
  let previousHash: string | null = null
  let previousPath: string | null = null

  for (const currentPath of backupPaths) {
    const currentSize = statSync(currentPath).size

    if (previousSize === currentSize && previousPath) {
      const currentHash = getFileHash(currentPath)
      previousHash ??= getFileHash(previousPath)

      if (currentHash === previousHash) {
        if (!dryRun) {
          unlinkSync(previousPath)
          if (verbose) {
            console.log(`🗑️ Deleted duplicate backup: ${previousPath}`)
          }
        }

        else {
          console.log(`🗑️ Would delete duplicate backup: ${previousPath}`)
        }

        // Only keep current
        previousPath = currentPath
        previousSize = currentSize
        previousHash = currentHash
        continue
      }

      previousHash = currentHash
    }

    previousSize = currentSize
    previousPath = currentPath
  }
}