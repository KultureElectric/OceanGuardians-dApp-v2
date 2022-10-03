/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token'
import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'

/**
 * @category Instructions
 * @category Unstake
 * @category generated
 */
export const unstakeStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'UnstakeInstructionArgs'
)
/**
 * Accounts required by the _unstake_ instruction
 *
 * @property [_writable_] stakeEntry
 * @property [] originalMint
 * @property [_writable_] stakeEntryOriginalMintTokenAccount
 * @property [_writable_, **signer**] user
 * @property [_writable_] userOriginalMintTokenAccount
 * @category Instructions
 * @category Unstake
 * @category generated
 */
export type UnstakeInstructionAccounts = {
  stakeEntry: web3.PublicKey
  originalMint: web3.PublicKey
  stakeEntryOriginalMintTokenAccount: web3.PublicKey
  user: web3.PublicKey
  userOriginalMintTokenAccount: web3.PublicKey
  tokenProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const unstakeInstructionDiscriminator = [
  90, 95, 107, 42, 205, 124, 50, 225,
]

/**
 * Creates a _Unstake_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category Unstake
 * @category generated
 */
export function createUnstakeInstruction(
  accounts: UnstakeInstructionAccounts,
  programId = new web3.PublicKey('CsfVevZy66ARUY74VCw8Hqxzjkjis9qLAN3bj49m5wTB')
) {
  const [data] = unstakeStruct.serialize({
    instructionDiscriminator: unstakeInstructionDiscriminator,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.stakeEntry,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.originalMint,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.stakeEntryOriginalMintTokenAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.user,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.userOriginalMintTokenAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
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