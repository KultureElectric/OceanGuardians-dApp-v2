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
 * @category ClaimReceiptMint
 * @category generated
 */
export const claimReceiptMintStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'ClaimReceiptMintInstructionArgs'
)
/**
 * Accounts required by the _claimReceiptMint_ instruction
 *
 * @property [_writable_] stakeEntry
 * @property [] originalMint
 * @property [_writable_] receiptMint
 * @property [_writable_] stakeEntryReceiptMintTokenAccount
 * @property [_writable_, **signer**] user
 * @property [_writable_] userReceiptMintTokenAccount
 * @property [_writable_] tokenManagerReceiptMintTokenAccount
 * @property [_writable_] tokenManager
 * @property [_writable_] mintCounter
 * @property [] tokenManagerProgram
 * @property [] associatedTokenProgram
 * @category Instructions
 * @category ClaimReceiptMint
 * @category generated
 */
export type ClaimReceiptMintInstructionAccounts = {
  stakeEntry: web3.PublicKey
  originalMint: web3.PublicKey
  receiptMint: web3.PublicKey
  stakeEntryReceiptMintTokenAccount: web3.PublicKey
  user: web3.PublicKey
  userReceiptMintTokenAccount: web3.PublicKey
  tokenManagerReceiptMintTokenAccount: web3.PublicKey
  tokenManager: web3.PublicKey
  mintCounter: web3.PublicKey
  tokenProgram?: web3.PublicKey
  tokenManagerProgram: web3.PublicKey
  associatedTokenProgram: web3.PublicKey
  systemProgram?: web3.PublicKey
  rent?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const claimReceiptMintInstructionDiscriminator = [
  31, 225, 68, 212, 88, 93, 111, 88,
]

/**
 * Creates a _ClaimReceiptMint_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category ClaimReceiptMint
 * @category generated
 */
export function createClaimReceiptMintInstruction(
  accounts: ClaimReceiptMintInstructionAccounts,
  programId = new web3.PublicKey('CsfVevZy66ARUY74VCw8Hqxzjkjis9qLAN3bj49m5wTB')
) {
  const [data] = claimReceiptMintStruct.serialize({
    instructionDiscriminator: claimReceiptMintInstructionDiscriminator,
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
      pubkey: accounts.receiptMint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.stakeEntryReceiptMintTokenAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.user,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.userReceiptMintTokenAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenManagerReceiptMintTokenAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenManager,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.mintCounter,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenManagerProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.associatedTokenProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.rent ?? web3.SYSVAR_RENT_PUBKEY,
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
