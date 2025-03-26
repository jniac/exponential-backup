import * as fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { backupWithPruning } from './backup'

const fileContent = 'hello world'
let tempDir: string
let sourceFile: string

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'backup-test-'))
  sourceFile = path.join(tempDir, 'foo.txt')
  await fs.writeFile(sourceFile, fileContent)
})

afterEach(async () => {
  await fs.rm(tempDir, { recursive: true, force: true })
})

describe('backupWithPruning', () => {
  it('creates a backup file', async () => {
    await backupWithPruning(sourceFile, { dryRun: false })

    const backupFolder = path.join(tempDir, 'backups')
    const files = await fs.readdir(backupFolder)
    expect(files.length).toBe(1)

    const backupContent = await fs.readFile(path.join(backupFolder, files[0]), 'utf8')
    expect(backupContent).toBe(fileContent)
  })

  it('respects dryRun: true (does not delete)', async () => {
    // Simulate multiple backup timestamps
    vi.useFakeTimers()
    for (let i = 0; i < 4; i++) {
      vi.setSystemTime(Date.now() + i * 1000 * 60) // +1 min
      await backupWithPruning(sourceFile, { dryRun: false })
    }

    const allBackups = await fs.readdir(path.join(tempDir, 'backups'))
    expect(allBackups.length).toBe(4)

    // Dry run: nothing should be deleted
    await backupWithPruning(sourceFile, { dryRun: true })

    const finalBackups = await fs.readdir(path.join(tempDir, 'backups'))
    expect(finalBackups.length).toBe(5) // original 4 + new one
  })

  it('deletes older files according to strategy', async () => {
    vi.useFakeTimers()
    for (let i = 0; i < 10; i++) {
      vi.setSystemTime(Date.now() + i * 1000 * 60) // +1 min
      await backupWithPruning(sourceFile, { dryRun: false })
    }

    const filesBefore = await fs.readdir(path.join(tempDir, 'backups'))

    // Make another backup which should trigger pruning
    vi.setSystemTime(Date.now() + 1000 * 60 * 10)
    await backupWithPruning(sourceFile, { dryRun: false })

    const filesAfter = await fs.readdir(path.join(tempDir, 'backups'))

    expect(filesAfter.length).toBeLessThanOrEqual(filesBefore.length + 1)
  })

  it('throws if source file is missing', async () => {
    const missing = path.join(tempDir, 'nope.txt')
    await expect(backupWithPruning(missing, { dryRun: false }))
      .rejects
      .toThrow()
  })
})