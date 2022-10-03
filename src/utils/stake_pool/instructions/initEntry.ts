/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import * as beet from '@metaplex-foundation/beet'

/**
 * @category Instructions
 * @category InitEntry
 * @category generated
 */
export type InitEntryInstructionArgs = {
  user: web3.PublicKey
}
/**
 * @category Instructions
 * @category InitEntry
 * @category generated
 */
export const initEntryStruct = new beet.BeetArgsStruct<
  InitEntryInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['user', beetSolana.publicKey],
  ],
  'InitEntryInstructionArgs'
)
/**
 * Accounts required by the _initEntry_ instruction
 *
 * @property [_writable_] stakeEntry
 * @property [_writable_] stakePool
 * @property [] originalMint
 * @property [] originalMintMetadata
 * @property [_writable_, **signer**] payer
 * @category Instructions
 * @category InitEntry
 * @category generated
 */
export type InitEntryInstructionAccounts = {
  stakeEntry: web3.PublicKey
  stakePool: web3.PublicKey
  originalMint: web3.PublicKey
  originalMintMetadata: web3.PublicKey
  payer: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const initEntryInstructionDiscriminator = [
  207, 80, 17, 185, 229, 148, 170, 183,
]

/**
 * Creates a _InitEntry_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category InitEntry
 * @category generated
 */
export function createInitEntryInstruction(
  accounts: InitEntryInstructionAccounts,
  args: InitEntryInstructionArgs,
  programId = new web3.PublicKey('CsfVevZy66ARUY74VCw8Hqxzjkjis9qLAN3bj49m5wTB')
) {
  const [data] = initEntryStruct.serialize({
    instructionDiscriminator: initEntryInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.stakeEntry,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.stakePool,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.originalMint,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.originalMintMetadata,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.payer,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
  ]

  if (accounts.anchorRemainingAccounts != null) {
    for (const acc of accounts.anchorRemainingAccounts) {
      keys.push(acc)
    }
  }

  const ix = new web3.TransactionInstruction({
    programId,
    keys,
    data,
  })
  return ix
}
