import { AnchorProvider, Program, BN, utils } from "@project-serum/anchor";
import { PublicKey, Keypair, Connection, Transaction, SystemProgram, SYSVAR_RENT_PUBKEY, sendAndConfirmRawTransaction } from "@solana/web3.js";
import { StakePool } from "../../public/stake_pool";
import { OgRewardDistributor } from "../../public/og_reward_distributor";
import Toast from "components/Toast";

import * as metaplex from "@metaplex-foundation/mpl-token-metadata";
import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { getOrCreateATA, getATAAddressSync } from "@saberhq/token-utils";
import { SolanaProvider, Provider } from "@saberhq/solana-contrib"
import {
    findTokenManagerAddress,
    findMintCounterId,
    findMintManagerId,
} from "@cardinal/token-manager/dist/cjs/programs/tokenManager/pda";
import { tryGetAccount } from "@cardinal/common";
import {
    getRemainingAccountsForKind,
    TOKEN_MANAGER_ADDRESS,
    TokenManagerKind,
    withRemainingAccountsForReturn,
} from "@cardinal/token-manager/dist/cjs/programs/tokenManager";
import { tokenManager } from "@cardinal/token-manager/dist/cjs/programs";
import _ from "lodash";
import { createInitEntryInstruction, createStakeInstruction, createUnstakeInstruction, createCloseStakeEntryInstruction, createClaimReceiptMintInstruction, PROGRAM_ID as poolProgramId, StakeEntry } from "./stake_pool";
import { createInitRewardEntryInstruction, createClaimRewardsInstruction, createUpdateRewardEntryInstruction, createCloseRewardEntryInstruction, PROGRAM_ID as distributorProgramId, RewardDistributor } from "./reward_distributor";

import { toast } from "react-toastify"

export const poolSeed = new PublicKey("CxT4Tg9m9hWrCdbZU7Sm375SYGK1NE7RYwoUabWNE8aK");
const rewardManager = new PublicKey("Bsuz9UMhvY6pYs7RsKPPmusm8ks4xHSR3QQUq8mNt3Bf");

const stakingAuthority = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.NEXT_PUBLIC_STAKING_AUTHORITY)))

const connection = new Connection(process.env.NEXT_PUBLIC_ENDPOINT, "confirmed");

// stake function

export const stakeNFTs = async(nftMint: PublicKey, wallet: any, multiplier: number) => {
    // const stakeMintKeypair = Keypair.generate();

    const provider = new AnchorProvider(connection, wallet, {});
    const saberProvider = SolanaProvider.init({
        connection: connection,
        wallet: wallet,
    })
    // const poolProgram = new Program<StakePool>(poolIdl, poolProgramId, provider);
    // const distributorProgram = new Program<OgRewardDistributor>(distributorIdl, distributorProgramId, provider);    

    let transaction = new Transaction();

    // Init Stake Entry

    const [stakePoolPda] = await PublicKey.findProgramAddress(
        [Buffer.from("stake-pool"), poolSeed.toBuffer()],
        poolProgramId
        );    

    const[stakeEntryPda] = await PublicKey.findProgramAddress(
        [Buffer.from("stake-entry"), stakePoolPda.toBuffer(), nftMint.toBuffer(), wallet.publicKey.toBuffer()],
        poolProgramId
    );

    const nftMetadata = await metaplex.Metadata.getPDA(nftMint);

    // Init Stake Entry

    transaction.add(
            createInitEntryInstruction({
                stakeEntry: stakeEntryPda,
                stakePool: stakePoolPda,
                originalMint: nftMint,
                originalMintMetadata: nftMetadata,
                payer: wallet.publicKey,
                systemProgram: SystemProgram.programId
            }, {user: wallet.publicKey})
        )

    // Init Reward Entry
    
    const [rewardDistributorPda] = await PublicKey.findProgramAddress(
        [utils.bytes.utf8.encode("reward-distributor"), stakePoolPda.toBuffer()],
        distributorProgramId
        )

    const [rewardEntryPda] = await PublicKey.findProgramAddress(
        [utils.bytes.utf8.encode("reward-entry"), rewardDistributorPda.toBuffer(), stakeEntryPda.toBuffer()],
        distributorProgramId
        );        
    
    transaction.add(
            createInitRewardEntryInstruction({
                rewardEntry: rewardEntryPda,
                stakeEntry: stakeEntryPda,
                rewardDistributor: rewardDistributorPda,
                authority: stakingAuthority.publicKey,
                payer: wallet.publicKey,
                systemProgram: SystemProgram.programId
            }, {ix: {multiplier: new BN(multiplier * 100)}})
        )

    // Init Stake Mint

    // const [mintManagerId] = await findMintManagerId(stakeMintKeypair.publicKey)

    // const stakeMintMetadataId = await metaplex.Metadata.getPDA(stakeMintKeypair.publicKey);

    // const stakeEntryStakeMintTokenAccountId = await getATAAddressSync({
    //     mint: stakeMintKeypair.publicKey,
    //     owner: stakeEntryPda
    // });    

    // transaction.add(
    //     await poolProgram.methods.initStakeMint()
    //         .accounts({
    //             stakeEntry: stakeEntryPda,
    //             stakePool: stakePoolPda,
    //             originalMint: nftMint,
    //             originalMintMetadata: nftMetadata,
    //             stakeMint: stakeMintKeypair.publicKey,
    //             stakeMintMetadata: stakeMintMetadataId,
    //             stakeEntryStakeMintTokenAccount: stakeEntryStakeMintTokenAccountId,
    //             mintManager: mintManagerId,
    //             payer: wallet.publicKey,
    //             rent: SYSVAR_RENT_PUBKEY,
    //             tokenProgram: TOKEN_PROGRAM_ID,
    //             tokenManagerProgram: TOKEN_MANAGER_ADDRESS ,
    //             systemProgram: SystemProgram.programId,
    //             tokenMetadataProgram: metaplex.MetadataProgram.PUBKEY,
    //             associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
    //         })
    //         .signers([stakeMintKeypair, wallet])
    //         .instruction()
    // );

    // Stake

    let stakeEntryOriginalMintAta = getATAAddressSync({ // Not sure if ata creation is neccessary
        mint: nftMint,
        owner: stakeEntryPda,
      })  
    
    const userOriginalMintAta = getATAAddressSync({
        mint: nftMint,
        owner: wallet.publicKey
    });

    transaction.add(
            createStakeInstruction({
                stakeEntry: stakeEntryPda,
                stakeEntryOriginalMintTokenAccount: stakeEntryOriginalMintAta,
                originalMint: nftMint,
                user: wallet.publicKey,
                userOriginalMintTokenAccount: userOriginalMintAta,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                rent: SYSVAR_RENT_PUBKEY
            }, {amount: new BN(1)})
        )

    // Claim Receipt

    const [tokenManagerAddress] = await findTokenManagerAddress(nftMint)

        const tokenManagerReceiptMintTokenAccountId = await getOrCreateATA({
            provider: saberProvider,
            mint: nftMint,
            owner: tokenManagerAddress
        });

        if (tokenManagerReceiptMintTokenAccountId.instruction) {
            transaction.add(tokenManagerReceiptMintTokenAccountId.instruction)
        }

        const [mintCounterId] = await findMintCounterId(
            nftMint,
        );

        const remainingAccounts = await getRemainingAccountsForKind( // Edition accounts
            nftMint,
            TokenManagerKind.Edition
        );

    transaction.add(
            createClaimReceiptMintInstruction({
                stakeEntry: stakeEntryPda,
                originalMint: nftMint,
                receiptMint: nftMint, // same as original Mint
                stakeEntryReceiptMintTokenAccount: stakeEntryOriginalMintAta,
                user: wallet.publicKey,
                userReceiptMintTokenAccount: userOriginalMintAta,
                tokenManagerReceiptMintTokenAccount: tokenManagerReceiptMintTokenAccountId.address,
                tokenManager: tokenManagerAddress,
                mintCounter: mintCounterId,
                tokenProgram: TOKEN_PROGRAM_ID,
                tokenManagerProgram: TOKEN_MANAGER_ADDRESS,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY,
                anchorRemainingAccounts: remainingAccounts
            })
        )

    try {
        const blockhash = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash.blockhash
        transaction.feePayer = wallet.publicKey;
        await wallet.signTransaction(transaction);
        // transaction.partialSign(stakeMintKeypair)
        transaction.partialSign(stakingAuthority)
         
        const stakeTx = await connection.sendRawTransaction(transaction.serialize());

        const toastId = toast.loading(Toast("Confirming Tx...", stakeTx))
        
        const confirmation = await connection.confirmTransaction({
                signature: stakeTx,
                blockhash: blockhash.blockhash,
                lastValidBlockHeight: blockhash.lastValidBlockHeight,
        }, 'finalized');

        if (confirmation.value.err === null) {
            toast.update(toastId, {render: Toast("Success", stakeTx), type: "success", autoClose: 5000, isLoading: false})
        } else {
            toast.update(toastId, {render: Toast(`Error. ${confirmation.value.err.toString()}`, stakeTx), type: "error", autoClose: 5000, isLoading: false})
        }
 
        return stakeTx
    } catch (error) {
        toast(error.toString())
        console.log("Err:" + error);
    }

}

export const unstakeNFTs = async(nftMint: PublicKey, wallet: any) => {
    const provider = new AnchorProvider(connection, wallet, {});
    const saberProvider: Provider = SolanaProvider.init({
        connection: connection,
        wallet: wallet
    })

    // const poolProgram = new Program<StakePool>(poolIdl, poolProgramId, provider);
    // const distributorProgram = new Program<OgRewardDistributor>(distributorIdl, distributorProgramId, provider);

    let transaction = new Transaction();

    const [stakePoolPda] = await PublicKey.findProgramAddress(
        [Buffer.from("stake-pool"), poolSeed.toBuffer()],
        poolProgramId
        );    

    const[stakeEntryPda] = await PublicKey.findProgramAddress(
        [Buffer.from("stake-entry"), stakePoolPda.toBuffer(), nftMint.toBuffer(), wallet.publicKey.toBuffer()],
        poolProgramId
    );

    const stakeEntryAccount = await StakeEntry.fromAccountAddress(connection, stakeEntryPda);

    const stakeEntryOriginalMintAta = getATAAddressSync({ mint: nftMint, owner: stakeEntryPda })

    let remainingAccountsUnstake


    if (stakeEntryAccount.stakeMint && stakeEntryAccount.stakeMintClaimed) { // TODO: look here when updating contract
        
        const stakeEntryStakeMintTokenAccountId = getATAAddressSync({
            mint: stakeEntryAccount.stakeMint,
            owner: stakeEntryPda
        });

        remainingAccountsUnstake = [{
            pubkey: stakeEntryStakeMintTokenAccountId,
            isSigner: false,
            isWritable: false,
        }]

        console.log("returning NFT copy");
    
        const [tokenManagerAddress] = await findTokenManagerAddress(stakeEntryAccount.stakeMint)

        const tokenManagerData = await tryGetAccount(() =>
        tokenManager.accounts.getTokenManager(connection, tokenManagerAddress)
        );            
        
        const remainingAccountsForReturn = await withRemainingAccountsForReturn(
            new Transaction(),
            connection,
            wallet,
            tokenManagerData,
        );    

        const tokenManagerReceiptMintTokenAccountId = await getATAAddressSync({mint: stakeEntryAccount.stakeMint, owner: tokenManagerAddress })
        
        transaction.add(
            await tokenManager.instruction.invalidate(
                connection,
                wallet,
                stakeEntryAccount.stakeMint,
                tokenManagerAddress,
                TokenManagerKind.Managed,
                tokenManagerData.parsed.state,
                tokenManagerReceiptMintTokenAccountId,
                tokenManagerData?.parsed.recipientTokenAccount,
                remainingAccountsForReturn
            )
        )
    } else if (!stakeEntryAccount.stakeMint && stakeEntryAccount.stakeMintClaimed) {        
        remainingAccountsUnstake = [{
            pubkey: stakeEntryOriginalMintAta,
            isSigner: false,
            isWritable: false,
        }]

        console.log("Invalidating Token Manager");
        
        const [tokenManagerAddress] = await findTokenManagerAddress(nftMint);
        
        const tokenManagerAta = getATAAddressSync({
            mint: nftMint,
            owner: tokenManagerAddress
        });

        const tokenManagerData = await tryGetAccount(() =>
            tokenManager.accounts.getTokenManager(connection, tokenManagerAddress)
        );                     

        const remainingAccountsForReturn = await withRemainingAccountsForReturn(
            new Transaction(),
            connection,
            wallet,
            tokenManagerData,
        ); 

        transaction.add(
            await tokenManager.instruction.invalidate(
                connection,
                wallet,
                nftMint,
                tokenManagerAddress,
                TokenManagerKind.Edition,
                tokenManagerData.parsed.state,
                tokenManagerAta,
                tokenManagerData.parsed.recipientTokenAccount,
                remainingAccountsForReturn
            )
        )
    }

    // Claim rewards

    const [rewardDistributorPda] = await PublicKey.findProgramAddress(
        [utils.bytes.utf8.encode("reward-distributor"), stakePoolPda.toBuffer()],
        distributorProgramId
    )

    const [rewardEntryPda] = await PublicKey.findProgramAddress(
        [utils.bytes.utf8.encode("reward-entry"), rewardDistributorPda.toBuffer(), stakeEntryPda.toBuffer()],
        distributorProgramId
    )

    const rewardMint = (await RewardDistributor.fromAccountAddress(connection, rewardDistributorPda)).rewardMint;

    const userRewardMintAta = await getOrCreateATA({
        provider: saberProvider,
        mint: rewardMint,
        owner: wallet.publicKey,
        payer: wallet.publicKey,
      });

    if (userRewardMintAta.instruction) {        
        transaction.add(
            userRewardMintAta.instruction
        )
    }

    const rewardDistributorTokenAccount = getATAAddressSync({
        mint: rewardMint,
        owner: rewardDistributorPda
    })

    transaction.add(
        createClaimRewardsInstruction({
            rewardEntry: rewardEntryPda,
            rewardDistributor: rewardDistributorPda,
            rewardDistributorTokenAccount: rewardDistributorTokenAccount,
            stakeEntry: stakeEntryPda,
            stakePool: stakePoolPda,
            rewardMint: rewardMint,
            userRewardMintTokenAccount: userRewardMintAta.address,
            rewardManager: rewardManager,
            user: wallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId
        })
    )


    // Delete Reward Entry

    transaction.add(
            createCloseRewardEntryInstruction({
                rewardDistributor: rewardDistributorPda,
                rewardEntry: rewardEntryPda,
                rewardManager: rewardManager,
                authority: stakingAuthority.publicKey
            })
        )

    // Unstake

    const userOriginalMintAta = getATAAddressSync({ mint: nftMint, owner: wallet.publicKey});

    transaction.add(
            createUnstakeInstruction({
                stakeEntry: stakeEntryPda,
                originalMint: nftMint,
                stakeEntryOriginalMintTokenAccount: stakeEntryOriginalMintAta,
                user: wallet.publicKey,
                userOriginalMintTokenAccount: userOriginalMintAta,
                tokenProgram: TOKEN_PROGRAM_ID,
                anchorRemainingAccounts: remainingAccountsUnstake
            })
        )

    // Close Stake Entry

    transaction.add(
            createCloseStakeEntryInstruction({
                stakePool: stakePoolPda,
                stakeEntry: stakeEntryPda,
                rewardManager: rewardManager,
                authority: stakingAuthority.publicKey
            })
    )
    console.log(transaction);

    try {
        const blockhash = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash.blockhash;
        transaction.feePayer = wallet.publicKey;
        await wallet.signTransaction(transaction);
        transaction.partialSign(stakingAuthority)        
         
        const unstakeTx = await connection.sendRawTransaction(transaction.serialize(), { skipPreflight: true }); 
        
        const toastId = toast.loading(Toast("Confirming Tx...", unstakeTx))
        
        const confirmation = await connection.confirmTransaction({
                signature: unstakeTx,
                blockhash: blockhash.blockhash,
                lastValidBlockHeight: blockhash.lastValidBlockHeight,
        }, 'finalized');

        if (confirmation.value.err === null) {
            toast.update(toastId, {render: Toast("Success", unstakeTx), type: "success", autoClose: 5000, isLoading: false})
        } else {
            toast.update(toastId, {render: Toast(`Error. ${confirmation.value.err.toString()}`, unstakeTx), type: "error", autoClose: 5000, isLoading: false})
        }

        return unstakeTx     

        } catch (error) {
            toast(error.toString())
            console.log("Err:" + error);
    }
}

export const claimRewards = async(nftMints: Array<PublicKey>, wallet: any) => {
    const provider = new AnchorProvider(connection, wallet, {});
    const saberProvider: Provider = SolanaProvider.init({
        connection: connection,
        wallet: wallet
    })
    // const distributorProgram = new Program<OgRewardDistributor>(distributorIdl, distributorProgramId, provider);

    let transaction = new Transaction();

    const [stakePoolPda] = await PublicKey.findProgramAddress(
        [Buffer.from("stake-pool"), poolSeed.toBuffer()],
        poolProgramId
    );    

    const [rewardDistributorPda] = await PublicKey.findProgramAddress(
        [utils.bytes.utf8.encode("reward-distributor"), stakePoolPda.toBuffer()],
        distributorProgramId
    );

    const rewardMint = (await RewardDistributor.fromAccountAddress(connection, rewardDistributorPda)).rewardMint

    const userRewardMintTokenAccount = await getOrCreateATA({
        provider: saberProvider,
        mint: rewardMint,
        owner: wallet.publicKey,
        payer: wallet.publicKey
    });

    if (userRewardMintTokenAccount.instruction) {
        console.log("userRewardMintTokenAccount is being initialized");

        transaction.add(
            userRewardMintTokenAccount.instruction
        )
    }

    const rewardDistributorAta = getATAAddressSync({
        mint: rewardMint,
        owner: rewardDistributorPda
    })        

    // Loop transactions

    _.forEach(nftMints, async nftMint => {
        const[stakeEntryPda] = await PublicKey.findProgramAddress(
            [Buffer.from("stake-entry"), stakePoolPda.toBuffer(), nftMint.toBuffer(), wallet.publicKey.toBuffer()],
            poolProgramId
        );        
    
        const [rewardEntryPda] = await PublicKey.findProgramAddress(
            [utils.bytes.utf8.encode("reward-entry"), rewardDistributorPda.toBuffer(), stakeEntryPda.toBuffer()],
            distributorProgramId
        );

        transaction.add(
            createClaimRewardsInstruction({
                rewardEntry: rewardEntryPda,
                rewardDistributor: rewardDistributorPda,
                rewardDistributorTokenAccount: rewardDistributorAta,
                stakeEntry: stakeEntryPda,
                stakePool: stakePoolPda,
                rewardMint: rewardMint,
                userRewardMintTokenAccount: userRewardMintTokenAccount.address,
                rewardManager: rewardManager,
                user: wallet.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId
            })
        )
    })

    try {
        const blockhash = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash.blockhash
        transaction.feePayer = wallet.publicKey;
        await wallet.signTransaction(transaction);
         
        const claimTx = await connection.sendRawTransaction(transaction.serialize());

        const toastId = toast.loading(Toast("Confirming Tx...", claimTx))

        const confirmation = await connection.confirmTransaction({
                signature: claimTx,
                blockhash: blockhash.blockhash,
                lastValidBlockHeight: blockhash.lastValidBlockHeight,
        }, 'finalized');

        if (confirmation.value.err === null) {
            toast.update(toastId, {render: Toast("Success", claimTx), type: "success", autoClose: 5000, isLoading: false})
        } else {
            toast.update(toastId, {render: Toast(`Error. ${confirmation.value.err.toString()}`, claimTx), type: "error", autoClose: 5000, isLoading: false})
        }
                        
        return claimTx     

        } catch (error) {
            toast(error.toString())
            console.log("Err:" + error);
    }
}