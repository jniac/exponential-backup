#!/usr/bin/env node

import meow from 'meow'

import { backupWithPruning, defaultBackupWithPruningOptions as options } from './index'
import { StrategyArg } from './range'

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
      }
    },
  })

const { expBase, intervalMs, levels, destination, strategy: strategyString } = cli.flags
const strategy = (strategyString ?? { expBase, intervalMs, levels }) as StrategyArg
backupWithPruning(cli.input[0], { destination, strategy })
