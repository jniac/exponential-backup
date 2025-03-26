# exponential-decay

_**smart, exponential-decay backup retention strategy**_

or

_**logarithmic time-based pruning**_

Usage:
```typescript
import { backupWithPruning } from 'exponential-backup'
// This will backup the file data.json into the destination folder and look for 
// previous backup and prunes them according to an exponential rule. 
backupWithPruning('data.json', {
  dryRun: true,
  destination: 'data-backups'
})
```

Examples of dry run output:
```
Range strategy: exponentionalWithFlatDay
┌───────┬────────────┬───────┐
│ index │ end        │ count │
├───────┼────────────┼───────┤
│ 0     │ < 05s      │ 1     │
│ 1     │ < 15s      │ 0     │
│ 2     │ < 45s      │ 0     │
│ 3     │ < 02m 15s  │ 1     │
│ 4     │ < 06m 45s  │ 2     │
│ 5     │ < 20m 15s  │ 1     │
│ 6     │ < 01h 00m  │ 9     │
│ 7     │ < 02h 00m  │ 3     │
│ 8     │ < 04h 00m  │ 0     │
│ 9     │ < 06h 00m  │ 0     │
│ 10    │ < 08h 00m  │ 0     │
│ 11    │ < 10h 00m  │ 0     │
│ 12    │ < 12h 00m  │ 10    │
│ 13    │ < 14h 00m  │ 0     │
│ 14    │ < 16h 00m  │ 19    │
│ 15    │ < 18h 00m  │ 1     │
│ 16    │ < 20h 00m  │ 0     │
│ 17    │ < 22h 00m  │ 0     │
│ 18    │ < 1d 00h   │ 0     │
│ 19    │ < 2d       │ 1     │
│ 20    │ < 4d       │ 0     │
│ 21    │ < 11d      │ 0     │
│ 22    │ < 31d      │ 0     │
│ 23    │ < 93d      │ 0     │
│ 24    │ < Infinity │ 0     │
└───────┴────────────┴───────┘
```