import { execa } from 'execa'
import fs from 'fs/promises'
import { fixAllImports } from './fix-imports.mjs'

export async function build() {
  await fs.rm('dist', { recursive: true, force: true })
  await execa({ stdio: 'inherit' })`tsc`
  fixAllImports('dist')
}

if (import.meta.url === 'file://' + process.argv[1]) {
  build()
}