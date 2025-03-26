#!/usr/bin/env node

import meow from 'meow'

import { backupWithPruning, defaultBackupWithPruningOptions as options } from './backup'
import { StrategyArg } from './range'
import { cleanKeys } from './utils'

const cli = meow(`
  Usage
    $ exponential-backup <input>  
  `,
  {
    importMeta: import.meta,
    flags: {
      destination: {
        type: 'string',
        shortFlag: 'd',
        default: options.destination,
      },
      intervalMs: {
        type: 'number',
        shortFlag: 'i',
        aliases: ['interval-ms'],
      },
      levels: {
        type: 'number',
        shortFlag: 'l',
      },
      expBase: {
        type: 'number',
        shortFlag: 'b',
        aliases: ['exp-base'],
      },
      strategy: {
        type: 'string',
        shortFlag: 's',
      },
      dryRun: {
        type: 'boolean',
        shortFlag: 'n',
        aliases: ['dry-run'],
      }
    },
  })

const {
  dryRun,
  expBase,
  intervalMs,
  levels,
  destination,
  strategy: strategyString,
} = cli.flags
const expArgs = cleanKeys({ expBase, intervalMs, levels })
const strategy = (strategyString ?? Object.keys(expArgs).length > 0 ? expArgs : undefined) as StrategyArg
backupWithPruning(cli.input[0], { destination, dryRun, strategy })
