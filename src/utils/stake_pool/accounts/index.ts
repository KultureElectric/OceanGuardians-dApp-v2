export * from './StakeEntry'
export * from './StakePool'

import { StakePool } from './StakePool'
import { StakeEntry } from './StakeEntry'

export const accountProviders = { StakePool, StakeEntry }
