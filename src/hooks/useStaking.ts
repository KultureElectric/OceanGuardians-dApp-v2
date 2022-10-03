import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { BorshAccountsCoder, utils, Program, AnchorProvider } from "@project-serum/anchor";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import _ from "lodash"
import { solana } from 'aleph-sdk-ts/accounts';
import { aggregate } from 'aleph-sdk-ts';
import { toast } from "react-toastify"

import { StakePool } from "../../public/stake_pool";
import { OgRewardDistributor } from "../../public/og_reward_distributor";
import { useEffect, useState } from "react";

import { getNFTMetadata } from "utils/nfts";
import { PROGRAM_ID as poolProgramId } from "utils/stake_pool";
import { PROGRAM_ID as distributorProgramId } from "utils/reward_distributor";
import { NFT } from "./useWalletNFTs";

const poolIdl: StakePool = require("../../public/stake_pool.json");
const distributorIdl: OgRewardDistributor = require("../../public/og_reward_distributor.json");

const baseRate = 60;

const useStaking = (tx: string) => {
  const { connection } = useConnection();  
  const wallet = useWallet();

  const [loading, setLoading] = useState(true)
  const [userStakedEntries, setUserStakedEntries] = useState([]);
  const [totalClaimableRewards, setTotalClaimableRewards] = useState(0);
  const [totalDailyAccrualRate, setTotalDailyAccrualRate] = useState(0);

  const provider = new AnchorProvider(connection, wallet, {});
  const distributorProgram = new Program<OgRewardDistributor>(distributorIdl, distributorProgramId, provider);    
  const poolSeed = new PublicKey("CxT4Tg9m9hWrCdbZU7Sm375SYGK1NE7RYwoUabWNE8aK");

  useEffect(() => {
    const fetchStaking = async() => {
      setLoading(true);
      setUserStakedEntries([]);
      setTotalClaimableRewards(0);
      setTotalDailyAccrualRate(0);

      try {
        const [stakePoolPda] = await PublicKey.findProgramAddress(
          [Buffer.from("stake-pool"), poolSeed.toBuffer()],
          poolProgramId
        );

        const [rewardDistributorPda] = await PublicKey.findProgramAddress(
            [utils.bytes.utf8.encode("reward-distributor"), stakePoolPda.toBuffer()],
            distributorProgramId
        );
        
        const rewardDistributor = await distributorProgram.account.rewardDistributor.fetch(rewardDistributorPda)
        
        const userStakedEntriesRaw = await connection.getProgramAccounts(
          poolProgramId,
          {
              filters: [
                  { memcmp: { offset: 41, bytes: bs58.encode([1])} },
                  { memcmp: { offset: 81, bytes: wallet.publicKey.toBase58()} }
              ]
          }
        );     

        const coder = new BorshAccountsCoder(poolIdl);

        for (const account of userStakedEntriesRaw) {
          const stakeEntryData = coder.decode(
            "StakeEntry",
            account.account.data
          );   
          const [rewardEntryPda] = await PublicKey.findProgramAddress(
            [utils.bytes.utf8.encode("reward-entry"), rewardDistributorPda.toBuffer(), account.pubkey.toBuffer()],
            distributorProgramId
          );                    

          const rewardEntry = await distributorProgram.account.rewardEntry.fetch(rewardEntryPda);

          // Fetch Metaplex NFT
          let stakedNFT: NFT;
          if (stakeEntryData.stakeMint) {
            stakedNFT = await getNFTMetadata(stakeEntryData.stakeMint.toBase58(), connection); 
          } else {
            stakedNFT = await getNFTMetadata(stakeEntryData.originalMint.toBase58(), connection);
          }

          // Fetch Dynamic Layers
          const id = stakedNFT?.externalMetadata.name.replace(' #', 'Official');

          const alephAcc = solana.ImportAccountFromPrivateKey(Uint8Array.from(JSON.parse(process.env.NEXT_PUBLIC_ALEPH_KP || '')));

          const dynamicLayers: any = await aggregate.Get({address: alephAcc.address, keys: [id], APIServer: "https://official.aleph.cloud"});

          // Calculate Claimable rewards   

          const time = await connection.getBlockTime((await connection.getSlot("processed")))              
 
          const claimableRewards = 
              ((stakeEntryData.totalStakeSeconds.toNumber() - rewardEntry.rewardSecondsReceived.toNumber())
              + (time - stakeEntryData.lastStakedAt.toNumber()))
              / rewardDistributor.rewardDurationSeconds.toNumber()
              * (rewardDistributor.rewardAmount.toNumber() / 10e8)
              * (rewardEntry.multiplier.toNumber() / 100);
        
          setTotalClaimableRewards(prev => prev + claimableRewards)
          setTotalDailyAccrualRate(prev => prev + baseRate * (rewardEntry.multiplier.toNumber() / 100))
          setUserStakedEntries(entries => [...entries, {
            ...account,
            parsed: stakeEntryData,
            rewardEntry: rewardEntry,
            nft: stakedNFT,
            dynamicLayers: dynamicLayers,
            claimableRewards: claimableRewards
          }])      
        }

        setLoading(false);
      } catch (error) {
        toast("Failed to load staking")
        console.log(error);
      }
    }

    if (wallet.publicKey) {
      console.log("Fetching Staking");
      fetchStaking()
    }
  }, [wallet.publicKey, tx]);

  return {userStakedEntries, totalClaimableRewards, totalDailyAccrualRate, loading};
}

export default useStaking