import { execa } from 'execa'
import fs from 'fs/promises'
import { addJsExtensions } from './add-js-extensions.mjs'

export async function build() {
  await fs.rm('dist', { recursive: true, force: true })
  await execa({ stdio: 'inherit' })`tsc`
  await addJsExtensions('dist')
  // addJsExtension('dist')
}

if (import.meta.url === 'file://' + process.argv[1]) {
  await build()
}