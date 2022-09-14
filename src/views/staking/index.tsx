import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { FC } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandPointUp } from "@fortawesome/free-solid-svg-icons";
import _ from 'lodash';
import { PublicKey } from "@solana/web3.js";
import useStaking from "hooks/useStaking";
import useWalletNFTs from "hooks/useWalletNFTs";

import ListItemStaking from "components/ListItemStaking";

import config from "../../../public/traits/config.json"
import { claimRewards, stakeNFTs, unstakeNFTs } from "utils/stakingInstructions";

export const StakingView: FC = ({ }) => {
    const connection = useConnection();
    const wallet = useWallet();
    const staking = useStaking();
    const walletNFTs = useWalletNFTs(true); // true in order to skip staked NFTs

    const claimStakingRewards = async() => {
      let nftIds = Array<PublicKey>();

      _.forEach(staking.userStakedEntries, entry => {        
        nftIds.push(entry.parsed.originalMint)
      })

      const res = await claimRewards(nftIds, wallet);      
    }

    const stake = async(nftMint: PublicKey, multiplier: number) => {
      const res = await stakeNFTs(nftMint, wallet, multiplier)
    }

    const unstake = async(nftMint: PublicKey) => {
      const res = await unstakeNFTs(nftMint, wallet)
    }

    return (
        <div className="md:hero mx-auto p-4 relative w-screen">
            <div className="md:hero-content flex flex-col w-full">
                <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
                    Staking
                </h1>
                <h4 className="md:w-full text-center text-slate-300 my-2">
                    <p>Stake your OceanGuardians</p>
                </h4>
                {wallet.connected ? (
                  <div className="pt-4 md:flex md:flex-col md:items-center md:w-full"> {/* Important Css classes */}
                    {!staking.loading && !walletNFTs.loading ? (
                      <>
                      <div className="space-y-2 md:space-y-0 md:space-x-2 md:flex md:flex-row md:items-center md:justify-center md:w-3/4">
                        <div className={"bg-second p-2 rounded " + (staking.userStakedEntries.length !== 0 ? "md:w-1/3" : "md:w-1/2")}>
                          <p className="font-bold">Total Staked</p>
                          <p className="text-2xl font-bold text-blue">30%</p>
                          <p>165 / 555</p>
                        </div>
                      {staking.userStakedEntries.length !== 0 ? (
                      <>
                        <div className="bg-second p-2 rounded md:w-1/3">
                          <p className="font-bold">You've Staked</p>
                          <p className="text-2xl font-bold text-blue">{staking.userStakedEntries.length}</p>
                          <p>OceanGuardian NFTs</p>
                        </div>
                        <div className="bg-second p-2 rounded md:w-1/3">
                          <p className="font-bold">Daily Accrual Rate</p>
                          <p className="text-2xl font-bold text-blue">{staking.totalDailyAccrualRate.toFixed(2)}</p>
                          <p>$WAVE</p>
                        </div>
                      </>
                      ) : (
                      <>
                        <div className="bg-second p-2 rounded md:w-1/2">
                          <p className="font-bold text-xl">Ready to Stake?</p>
                          <p className="my-2">Stake your OceanGuardians and earn $WAVE</p>
                        </div>
                      </>
                      )}
                      </div>
                      {walletNFTs.walletNFTs.length === 0 && staking.userStakedEntries.length === 0 ? (
                        <div className="!mt-8 bg-second p-2 rounded md:w-3/4">
                          <p className="text-center">It appears you don't have any OceanGuardians</p>
                          <div className="flex items-center space-x-4 my-4 justify-center">
                            <p className="font-bold underline">Buy one on</p>
                            <a target="_blank" href="https://magiceden.io/marketplace/oceanguardians" className="font-bold bg-me hover:bg-mehover rounded px-6 py-2">Magic Eden</a>
                          </div>
                        </div>
                      ) : (
                        // NFT display
                        <div className="!mt-8 md:w-3/4">
                        {staking.userStakedEntries.length > 0 && ( // staked NFTs only shown if existant
                          <div className="bg-second p-2 md:p-4 rounded">
                            <div className="flex justify-between">
                              <p className="font-bold text-lg md:text-2xl mb-4 mt-2">{`Staked NFTs (${staking.userStakedEntries.length})`}</p>
                              <div className="flex items-center space-x-2">
                                <div className="flex flex-col">
                                <p className="text-right">Claimable Rewards</p>
                                <p className="text-xl font-bold text-blue text-right">{staking.totalClaimableRewards.toFixed(2)}</p>
                                </div>
                                <button onClick={claimStakingRewards} className="hidden md:block w-40 btn btn bg-gradient-to-tr from-[#9945FF] to-[#14F195] my-2 hover:brightness-95">Claim all</button>

                              </div>
                            </div>
                            <button onClick={claimStakingRewards} className="md:hidden btn btn-block btn bg-gradient-to-tr from-[#9945FF] to-[#14F195] my-2 hover:brightness-95">Claim all</button>
                            <div className="space-y-2.5 mt-4">
                              {_.map(staking.userStakedEntries, (entry) => {
                                console.log(entry);
                                return (                                  
                                  <div className="bg-second mb-1 rounded flex" key={entry.nft.externalMetadata.name}>
                                    <ListItemStaking nft={entry.nft}/>
                                    <div className="w-full flex flex-col justify-between px-2 py-1">
                                      <p className="font-bold md:text-xl">{entry.nft.externalMetadata.name}</p>
                                      <div className="flex items-end justify-between">
                                        <div className="text-xs md:text-base">
                                          <p>Claimable Rewards<br/><span className="text-base md:text-lg text-blue font-bold">{entry.claimableRewards.toFixed(2)}</span></p>
                                          <p>Multiplier<br/><span className="text-base md:text-lg text-blue font-bold">{entry.rewardEntry.multiplier.toNumber() / 100}</span></p>
                                        </div>
                                        <button onClick={() => unstake(entry.parsed.originalMint)} className="my-2 btn btn-sm md:btn-md bg-button hover:bg-buttonhover">Unstake</button>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        {walletNFTs.walletNFTs.length > 0 && ( // unstaked NFTs only shown if existant
                          <div className="bg-second p-2 rounded mt-8 mb-4">
                            <p className="font-bold text-lg md:text-2xl mb-4 md:mb-6 mt-2">{`Unstaked NFTs (${walletNFTs.walletNFTs.length})`}</p> 
                            <div className="space-y-2.5 mt-2">
                              {_.map(walletNFTs.walletNFTs, (nft) => {
                                let multiplier = 1;

                                _.forEach(Object.keys(config), (key) => {
                                  multiplier *= _.find(config[key].traits, o => {
                                    return o.name === nft.dynamicLayers[key]
                                  }).multiplier;
                                })
                                
                                return (                                  
                                  <div className="bg-second rounded flex" key={nft.externalMetadata.name}>
                                    <ListItemStaking nft={nft}/>
                                    <div className="w-full flex flex-col justify-between px-2 py-1">
                                      <p className="font-bold mt-2 md:text-xl">{nft.externalMetadata.name}</p>
                                      <div className="flex items-center justify-between">
                                        <p className="text-xs md:text-base">Multiplier<br/><span className="text-blue font-bold text-base md:text-lg">{multiplier.toFixed(2)}</span></p>
                                        <button onClick={() => stake(nft.mint, multiplier)} className="my-2 btn btn-sm md:btn-md bg-button hover:bg-buttonhover">Stake</button>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        </div>
                      )}
                      </>
                    ) : (
                      <div className="space-y-2 flex flex-col md:items-center md:w-2/3">
                        <div className="bg-second p-2 rounded animate-pulse h-24 md:w-full"></div>
                        <div className="bg-second p-2 rounded animate-pulse h-24 md:w-full"></div>
                        <svg className="!mt-6 place-self-center animate-spin h-5 w-5 bg-blue" viewBox="0 0 24 24"></svg>
                      </div>
                    )
                    }
                  </div>
                ) : (
                  <>
                    <div className='mx-auto mt-5 border rounded-md'>
                      <WalletMultiButton />
                    </div>
                    <FontAwesomeIcon className='my-8 animate-bounce' icon={faHandPointUp} />
                  </>
                )
                }
            </div>
        </div>
    )
}