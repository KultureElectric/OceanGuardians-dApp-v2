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
 * @category CloseRewardDistributor
 * @category generated
 */
export const closeRewardDistributorStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'CloseRewardDistributorInstructionArgs'
)
/**
 * Accounts required by the _closeRewardDistributor_ instruction
 *
 * @property [_writable_] rewardDistributor
 * @property [] stakePool
 * @property [_writable_] rewardMint
 * @property [_writable_, **signer**] signer
 * @category Instructions
 * @category CloseRewardDistributor
 * @category generated
 */
export type CloseRewardDistributorInstructionAccounts = {
  rewardDistributor: web3.PublicKey
  stakePool: web3.PublicKey
  rewardMint: web3.PublicKey
  signer: web3.PublicKey
  tokenProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const closeRewardDistributorInstructionDiscriminator = [
  15, 243, 181, 170, 59, 223, 157, 82,
]

/**
 * Creates a _CloseRewardDistributor_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category CloseRewardDistributor
 * @category generated
 */
export function createCloseRewardDistributorInstruction(
  accounts: CloseRewardDistributorInstructionAccounts,
  programId = new web3.PublicKey('DEvYCMc1BQ7uN3hHgdmHgiNQee2vydMdX3xg9ZJf42c8')
) {
  const [data] = closeRewardDistributorStruct.serialize({
    instructionDiscriminator: closeRewardDistributorInstructionDiscriminator,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.rewardDistributor,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.stakePool,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.rewardMint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.signer,
      isWritable: true,
      isSigner: true,
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
