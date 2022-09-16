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

import { toast } from "react-toastify"

const idl: StakePool = require("../../public/stake_pool.json");
const distributorIdl: OgRewardDistributor = require("../../public/og_reward_distributor.json");

const programID = new PublicKey('CsfVevZy66ARUY74VCw8Hqxzjkjis9qLAN3bj49m5wTB');
const distributorProgramID = new PublicKey('DEvYCMc1BQ7uN3hHgdmHgiNQee2vydMdX3xg9ZJf42c8');
const poolAccount = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.NEXT_PUBLIC_STAKE_POOL_KP || '')));

const connection = new Connection(process.env.NEXT_PUBLIC_ENDPOINT, "confirmed");

// stake function

export const stakeNFTs = async(nftMint: PublicKey, wallet: any, multiplier: number) => {
    const stakeMintKeypair = Keypair.generate();

    const provider = new AnchorProvider(connection, wallet, {});
    const program = new Program<StakePool>(idl, programID, provider);
    const distributorProgram = new Program<OgRewardDistributor>(distributorIdl, distributorProgramID, provider);    

    let transaction = new Transaction();

    // Init Stake Entry

    const poolAuthority = new PublicKey("CxT4Tg9m9hWrCdbZU7Sm375SYGK1NE7RYwoUabWNE8aK");

    const [stakePoolPda] = await PublicKey.findProgramAddress(
        [Buffer.from("stake-pool"), poolAuthority.toBuffer()],
        programID
        );    

    const[stakeEntryPda] = await PublicKey.findProgramAddress(
        [Buffer.from("stake-entry"), stakePoolPda.toBuffer(), nftMint.toBuffer(), wallet.publicKey.toBuffer()],
        programID
    );

    const NFTMetadata = await metaplex.Metadata.getPDA(nftMint);

    // Init Stake Entry

    transaction.add(
        await program.methods.initEntry(wallet.publicKey)
            .accounts({
                stakeEntry: stakeEntryPda,
                stakePool: stakePoolPda,
                originalMint: nftMint,
                originalMintMetadata: NFTMetadata,
                payer: wallet.publicKey,
                systemProgram: SystemProgram.programId
            })
            .instruction()
    )

    // Init Reward Entry
    
    const [rewardDistributorPda] = await PublicKey.findProgramAddress(
        [utils.bytes.utf8.encode("reward-distributor"), stakePoolPda.toBuffer()],
        distributorProgram.programId
        )

    const [rewardEntryPda] = await PublicKey.findProgramAddress(
        [utils.bytes.utf8.encode("reward-entry"), rewardDistributorPda.toBuffer(), stakeEntryPda.toBuffer()],
        distributorProgram.programId
        );        
    
    transaction.add(
        await distributorProgram.methods.initRewardEntry({multiplier: new BN(multiplier * 100)})
            .accounts({
                rewardEntry: rewardEntryPda,
                stakeEntry: stakeEntryPda,
                rewardDistributor: rewardDistributorPda,
                authority: poolAccount.publicKey,
                payer: wallet.publicKey,
                systemProgram: SystemProgram.programId
            })
            .signers([wallet, poolAccount])
            .instruction()
    )

    // Init Stake Mint

    const [mintManagerId] = await findMintManagerId(stakeMintKeypair.publicKey)

    const stakeMintMetadataId = await metaplex.Metadata.getPDA(stakeMintKeypair.publicKey);

    const stakeEntryStakeMintTokenAccountId = await getATAAddressSync({
        mint: stakeMintKeypair.publicKey,
        owner: stakeEntryPda
    });    

    transaction.add(
        await program.methods.initStakeMint()
            .accounts({
                stakeEntry: stakeEntryPda,
                stakePool: stakePoolPda,
                originalMint: nftMint,
                originalMintMetadata: NFTMetadata,
                stakeMint: stakeMintKeypair.publicKey,
                stakeMintMetadata: stakeMintMetadataId,
                stakeEntryStakeMintTokenAccount: stakeEntryStakeMintTokenAccountId,
                mintManager: mintManagerId,
                payer: wallet.publicKey,
                rent: SYSVAR_RENT_PUBKEY,
                tokenProgram: TOKEN_PROGRAM_ID,
                tokenManagerProgram: TOKEN_MANAGER_ADDRESS ,
                systemProgram: SystemProgram.programId,
                tokenMetadataProgram: metaplex.MetadataProgram.PUBKEY,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
            })
            .signers([stakeMintKeypair, wallet])
            .instruction()
    );

    // Stake

    let stakeEntryOriginalMintTokenAccountId = await getATAAddressSync({
        mint: nftMint,
        owner: stakeEntryPda,
      })  
    
    const originalNFTAccount = await getATAAddressSync({
        mint: nftMint,
        owner: wallet.publicKey
    });

    transaction.add(
        await program.methods.stake(new BN(1))
            .accounts({
                stakeEntry: stakeEntryPda,
                stakeEntryOriginalMintTokenAccount: stakeEntryOriginalMintTokenAccountId,
                originalMint: nftMint,
                user: wallet.publicKey,
                userOriginalMintTokenAccount: originalNFTAccount,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
            })
            .signers([wallet])
            .instruction()
    )

    // Claim Receipt

    const [tokenManagerAddress] = await findTokenManagerAddress(stakeMintKeypair.publicKey)

    let userReceiptMintAta = await getATAAddressSync({
        mint: stakeMintKeypair.publicKey,
        owner: wallet.publicKey,
    })

    const [mintCounterId] = await findMintCounterId(
    stakeMintKeypair.publicKey,
    );

    const remainingAccounts = await getRemainingAccountsForKind(
    stakeMintKeypair.publicKey,
    TokenManagerKind.Managed
    );

    const tokenManagerReceiptMintTokenAccountId = await getATAAddressSync({
        mint: stakeMintKeypair.publicKey,
        owner: tokenManagerAddress
    })

    transaction.add(
        await program.methods.claimReceiptMint()
            .accounts({
                stakeEntry: stakeEntryPda,
                originalMint: nftMint,
                receiptMint: stakeMintKeypair.publicKey,
                stakeEntryReceiptMintTokenAccount: stakeEntryStakeMintTokenAccountId, 
                user: wallet.publicKey,
                userReceiptMintTokenAccount: userReceiptMintAta,
                tokenManagerReceiptMintTokenAccount: tokenManagerReceiptMintTokenAccountId,
                tokenManager: tokenManagerAddress, 
                mintCounter: mintCounterId,
                tokenProgram: TOKEN_PROGRAM_ID,
                tokenManagerProgram: TOKEN_MANAGER_ADDRESS,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY
            })
            .signers([wallet])
            .remainingAccounts(remainingAccounts)
            .instruction()
    )

    try {
        const blockhash = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash.blockhash
        transaction.feePayer = wallet.publicKey;
        await wallet.signTransaction(transaction);
        transaction.partialSign(stakeMintKeypair)
        transaction.partialSign(poolAccount)
         
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

    const program = new Program<StakePool>(idl, programID, provider);
    const distributorProgram = new Program<OgRewardDistributor>(distributorIdl, distributorProgramID, provider);

    let transaction = new Transaction();

    const [stakePoolPda] = await PublicKey.findProgramAddress(
        [Buffer.from("stake-pool"), poolAccount.publicKey.toBuffer()],
        programID
        );    

    const[stakeEntryPda] = await PublicKey.findProgramAddress(
        [Buffer.from("stake-entry"), stakePoolPda.toBuffer(), nftMint.toBuffer(), wallet.publicKey.toBuffer()],
        programID
    );

    const stakeEntryAccount = await program.account.stakeEntry.fetch(stakeEntryPda);

    const stakeEntryStakeMintTokenAccountId = await getATAAddressSync({
        mint: stakeEntryAccount.stakeMint,
        owner: stakeEntryPda
    });  

    if (stakeEntryAccount.stakeMint && stakeEntryAccount.stakeMintClaimed) { // TODO: look here when updating contract
    
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
    }    

    // Claim rewards

    const [rewardDistributorPda] = await PublicKey.findProgramAddress(
        [utils.bytes.utf8.encode("reward-distributor"), stakePoolPda.toBuffer()],
        distributorProgram.programId
    )

    const [rewardEntryPda] = await PublicKey.findProgramAddress(
        [utils.bytes.utf8.encode("reward-entry"), rewardDistributorPda.toBuffer(), stakeEntryPda.toBuffer()],
        distributorProgram.programId
    )

    const rewardMint = (await distributorProgram.account.rewardDistributor.fetch(rewardDistributorPda)).rewardMint;

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

    const rewardDistributorTokenAccount = await getATAAddressSync({
        mint: rewardMint,
        owner: rewardDistributorPda
    })

    transaction.add(
        await distributorProgram.methods.claimRewards()
            .accounts({
            rewardEntry: rewardEntryPda,
            rewardDistributor: rewardDistributorPda,
            rewardDistributorTokenAccount: rewardDistributorTokenAccount,
            stakeEntry: stakeEntryPda,
            stakePool: stakePoolPda,
            rewardMint: rewardMint,
            userRewardMintTokenAccount: userRewardMintAta.address,
            rewardManager: poolAccount.publicKey,
            user: wallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId
            })
            .signers([wallet])
            .instruction()
    )

    // Delete Reward Entry

    transaction.add(
        await distributorProgram.methods.closeRewardEntry()
            .accounts( {
                rewardDistributor: rewardDistributorPda,
                rewardEntry: rewardEntryPda,
                authority: poolAccount.publicKey
            })
            .signers([poolAccount, wallet])
            .instruction()
    )

    // Unstake

    const stakeEntryOriginalMintTokenAccountId = await getOrCreateATA({ provider: saberProvider, mint: nftMint, owner: stakeEntryPda, payer: wallet.publicKey })

    if (stakeEntryOriginalMintTokenAccountId.instruction) {
        console.log("stakeEntryOriginalMintTokenAccountId is being initialized");

        transaction.add(
            stakeEntryOriginalMintTokenAccountId.instruction
        )
    }

    const originalNFTAccount = await getOrCreateATA({ provider: saberProvider, mint: nftMint, owner: wallet.publicKey});

    if (originalNFTAccount.instruction) {
        console.log("originalNFTAccount is being initialized");
        
        transaction.add(
            originalNFTAccount.instruction
        )
    }

    const remainingAccountsUnstake = [{
        pubkey: stakeEntryStakeMintTokenAccountId,
        isSigner: false,
        isWritable: false,
     }]

    transaction.add(
        await program.methods.unstake()
            .accounts({
                stakeEntry: stakeEntryPda,
                originalMint: nftMint,
                stakeEntryOriginalMintTokenAccount: stakeEntryOriginalMintTokenAccountId.address,
                user: wallet.publicKey,
                userOriginalMintTokenAccount: originalNFTAccount.address,
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .signers([wallet])
            .remainingAccounts(remainingAccountsUnstake)
            .instruction()
    )

    // Close Stake Entry

    transaction.add(
        await program.methods.closeStakeEntry()
            .accounts( {
                stakePool: stakePoolPda,
                stakeEntry: stakeEntryPda,
                authority: poolAccount.publicKey
            })
            .signers([poolAccount])
            .instruction()
    )

    try {
        const blockhash = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash.blockhash;
        transaction.feePayer = wallet.publicKey;
        await wallet.signTransaction(transaction);
        transaction.partialSign(poolAccount)
         
        const unstakeTx = await connection.sendRawTransaction(transaction.serialize()); 
        
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
    const distributorProgram = new Program<OgRewardDistributor>(distributorIdl, distributorProgramID, provider);

    let transaction = new Transaction();

    const [stakePoolPda] = await PublicKey.findProgramAddress(
        [Buffer.from("stake-pool"), poolAccount.publicKey.toBuffer()],
        programID
    );    

    const [rewardDistributorPda] = await PublicKey.findProgramAddress(
        [utils.bytes.utf8.encode("reward-distributor"), stakePoolPda.toBuffer()],
        distributorProgram.programId
    );

    const rewardMint = (await distributorProgram.account.rewardDistributor.fetch(rewardDistributorPda)).rewardMint;

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

    const rewardDistributorTokenAccount = await getATAAddressSync({
        mint: rewardMint,
        owner: rewardDistributorPda
    })        

    // Loop transactions

    _.forEach(nftMints, async nftMint => {
        const[stakeEntryPda] = await PublicKey.findProgramAddress(
            [Buffer.from("stake-entry"), stakePoolPda.toBuffer(), nftMint.toBuffer(), wallet.publicKey.toBuffer()],
            programID
        );        
    
        const [rewardEntryPda] = await PublicKey.findProgramAddress(
            [utils.bytes.utf8.encode("reward-entry"), rewardDistributorPda.toBuffer(), stakeEntryPda.toBuffer()],
            distributorProgram.programId
        );

        transaction.add(
            await distributorProgram.methods.claimRewards()
                .accounts({
                    rewardEntry: rewardEntryPda,
                    rewardDistributor: rewardDistributorPda,
                    rewardDistributorTokenAccount: rewardDistributorTokenAccount,
                    stakeEntry: stakeEntryPda,
                    stakePool: stakePoolPda,
                    rewardMint: rewardMint,
                    userRewardMintTokenAccount: userRewardMintTokenAccount.address,
                    rewardManager: poolAccount.publicKey,
                    user: wallet.publicKey,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId
                })
                .signers([wallet])
                .instruction()
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