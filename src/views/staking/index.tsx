import { useWallet } from "@solana/wallet-adapter-react"
import { FC, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import _ from 'lodash';
import { PublicKey } from "@solana/web3.js";
import useStaking from "hooks/useStaking";
import useWalletNFTs from "hooks/useWalletNFTs";

import ListItemStaking from "components/ListItemStaking";
import { claimRewards } from "utils/stakingInstructions";

export const StakingView: FC = ({ }) => {
    const [latestTx, setLatestTx] = useState('');
    const [claimLoading, setClaimLoading] = useState(false);

    const wallet = useWallet();
    const staking = useStaking(latestTx);
    const walletNFTs = useWalletNFTs(true, latestTx); // true in order to skip staked NFTs

    const claimStakingRewards = async() => {
      setClaimLoading(true)
      let nftIds = Array<PublicKey>();

      _.forEach(staking.userStakedEntries, entry => {        
        nftIds.push(entry.parsed.originalMint)
      })

      const res = await claimRewards(nftIds, wallet);
      setClaimLoading(false)
      res && setLatestTx(res)      
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
                                <button onClick={claimStakingRewards} className={"hidden md:inline-flex w-40 btn btn-block bg-gradient-to-tr from-[#9945FF] to-[#14F195] my-2 hover:brightness-95 " + (claimLoading && " loading")}>Claim all</button>

                              </div>
                            </div>
                            <button onClick={claimStakingRewards} className={"md:hidden btn btn-block bg-gradient-to-tr from-[#9945FF] to-[#14F195] my-2 hover:brightness-95 " + (claimLoading && " loading")}>Claim all</button>
                            <div className="space-y-2.5 mt-4">
                              {_.map(staking.userStakedEntries, (entry) => {
                                return (     
                                  <ListItemStaking type="staked" input={entry} setLatestTx={(tx: string) => setLatestTx(tx)} key={entry.nft.externalMetadata.name} />                             
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
                                return (
                                  <ListItemStaking type='unstaked' input={nft} setLatestTx={(tx: string) => setLatestTx(tx)} key={nft.externalMetadata.name} />
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
                  </>
                )
                }
            </div>
        </div>
    )
}