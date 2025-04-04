// fix-imports.js
import { readdir, readFile, stat, writeFile } from 'fs/promises'
import path from 'path'

/**
 * @param {string} input 
 * @param {Regexp | Regexp[]} regex 
 * @param {(match: string, ...groups: any[]) => Promise<string>} asyncReplacer 
 * @returns 
 */
export async function replaceAsync(
  input,
  regex,
  asyncReplacer,
) {
  if (Array.isArray(regex)) {
    let result = input
    for (const r of regex) {
      result = await replaceAsync(result, r, asyncReplacer)
    }
    return result
  }

  /**
   * @type{{
   *   match: string
   *   index: number
   *   length: number
   *   groups: any[]
   *   replacement: string
   * }[]}
   */
  const matches = []

  // Clone the regex with the global flag to find all matches
  const globalRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g')

  let match
  while ((match = globalRegex.exec(input))) {
    const [fullMatch, ...groups] = match
    const replacement = await asyncReplacer(fullMatch, ...groups)
    matches.push({
      match: fullMatch,
      index: match.index,
      length: fullMatch.length,
      groups,
      replacement,
    })
  }

  // Reconstruct the string
  let result = ''
  let lastIndex = 0

  for (const { index, length, replacement } of matches) {
    result += input.slice(lastIndex, index)
    result += replacement
    lastIndex = index + length
  }

  result += input.slice(lastIndex)
  return result
}

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
async function addJsExtensionsInFile(filePath) {
  let changed = false
  const content = await readFile(filePath, 'utf8')

  const updated = await replaceAsync(
    content,
    [
      /import\s+[^'"]*['"]([^'"]+)['"]/g,
      /export\s+(?!.*\b(?:const|function)\b).*[{\*]\s+from\s+[^'"]*['"]([^'"]+)['"]/g,
    ],
    async (match, jsPath) => {
      if (!isRelativeImport(jsPath) || hasExtension(jsPath))
        return match

      const absPath = path.resolve(path.dirname(filePath), jsPath + '.js')

      try {
        // Throws if file does not exist
        await stat(absPath)
        changed = true
        return match.replace(jsPath, jsPath + '.js')
      } catch {
        throw new Error(`Missing file for import: ${jsPath} in ${filePath}`)
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
export async function addJsExtensions(rootDir) {
  const absRoot = path.resolve(rootDir)
  for await (const file of jsFiles(absRoot)) {
    await addJsExtensionsInFile(file)
  }
}
