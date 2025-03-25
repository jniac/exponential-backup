// fix-imports.js
import { readdir, readFile, stat, writeFile } from 'fs/promises'
import path from 'path'

const isRelativeImport = (importPath) =>
  importPath.startsWith('./') || importPath.startsWith('../')

const hasExtension = (importPath) =>
  path.extname(importPath) !== ''

/**
 * Recursively find all .js files under a directory
 */
async function* jsFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const absPath = path.resolve(dir, entry.name)
    if (entry.isDirectory()) {
      yield* jsFiles(absPath)
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      yield absPath
    }
  }
}

/**
 * Process a file and fix its import statements
 */
async function fixImportsInFile(filePath) {
  let changed = false
  const content = await readFile(filePath, 'utf8')

  const updated = content.replace(
    /import\s+[^'"]*['"]([^'"]+)['"]/g,
    (match, importPath) => {
      if (!isRelativeImport(importPath) || hasExtension(importPath)) return match

      const absPath = path.resolve(path.dirname(filePath), importPath + '.js')

      try {
        // Throws if file does not exist
        const statPromise = stat(absPath)
        changed = true
        return match.replace(importPath, importPath + '.js')
      } catch {
        throw new Error(`Missing file for import: ${importPath} in ${filePath}`)
      }
    }
  )

  if (changed) {
    await writeFile(filePath, updated, 'utf8')
    console.log(`✅ Updated: ${filePath}`)
  }
}

/**
 * Entry point
 */
export async function fixAllImports(rootDir) {
  const absRoot = path.resolve(rootDir)
  for await (const file of jsFiles(absRoot)) {
    await fixImportsInFile(file)
  }
}
