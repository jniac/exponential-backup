import chokidar from 'chokidar'
import { build } from './build.mjs'

const watcher = chokidar.watch('src', {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
})

async function tryBuild() {
  try {
    await build()
  } catch (error) {
    console.error(error)
  }
}

watcher.on('add', tryBuild)
watcher.on('change', tryBuild)
watcher.on('unlink', tryBuild)