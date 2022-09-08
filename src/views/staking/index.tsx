import { useWallet } from "@solana/wallet-adapter-react"
import { FC } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandPointUp } from "@fortawesome/free-solid-svg-icons";
import _ from 'lodash';
import useStaking from "hooks/useStaking";
import useWalletNFTs from "hooks/useWalletNFTs";


export const StakingView: FC = ({ }) => {
    const wallet = useWallet();
    const staking = useStaking();
    const walletNFTs = useWalletNFTs(true); // true in order to skip staked NFTs

    return (
        <div className="md:hero mx-auto p-4 relative w-screen">
            <div className="md:hero-content flex flex-col">
                <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
                    Staking
                </h1>
                <h4 className="md:w-full text-center text-slate-300 my-2">
                    <p>Stake your OceanGuardians</p>
                </h4>
                {wallet.connected ? (
                  <div className="flex flex-col space-y-2 mt-6">
                    {!staking.loading && !walletNFTs.loading ? (
                      <>
                        <div className="bg-second p-2 rounded">
                          <p className="font-bold">Total Staked</p>
                          <p className="text-2xl font-bold text-blue">30%</p>
                          <p>165 / 555</p>
                        </div>
                      {staking.userStakedEntries.length !== 0 ? (
                      <>
                        <div className="bg-second p-2 rounded">
                          <p className="font-bold">You've Staked</p>
                          <p className="text-2xl font-bold text-blue">{staking.userStakedEntries.length}</p>
                          <p>OceanGuardian NFTs</p>
                        </div>
                        <div className="bg-second p-2 rounded">
                          <p className="font-bold">Total Daily Accrual Rate</p>
                          <p className="text-2xl font-bold text-blue">{staking.totalDailyAccrualRate.toFixed(2)}</p>
                          <p>Swap Traits to increase your rewards</p>
                        </div>
                      </>
                      ) : (
                      <>
                        <div className="bg-second p-2 rounded">
                          <p className="font-bold text-xl">Ready to Stake?</p>
                          <p className="my-2">Stake your OceanGuardians and earn $WAVE</p>
                        </div>
                      </>
                      )}
                      {walletNFTs.walletNFTs.length === 0 && staking.userStakedEntries.length === 0 ? (
                        <div className="!mt-8 bg-second p-2 rounded">
                          <p className="text-center">It appears you don't have any OceanGuardians</p>
                          <div className="flex items-center space-x-4 my-4 justify-center">
                            <p className="font-bold underline">Buy one on</p>
                            <a target="_blank" href="https://magiceden.io/marketplace/oceanguardians" className="font-bold bg-me hover:bg-mehover rounded px-6 py-2">Magic Eden</a>
                          </div>
                        </div>
                      ) : (
                        // NFT display
                        <div className="!mt-8">
                        {staking.userStakedEntries.length > 0 && ( // staked NFTs only shown if existant
                          <div className="bg-second p-2 rounded">
                            <div className="flex justify-between">
                              <p className="font-bold text-lg mb-4 mt-2">{`Staked NFTs (${staking.userStakedEntries.length})`}</p>
                              <div>
                                <p>Claimable Rewards</p>
                                <p className="text-xl font-bold text-blue text-right">{staking.totalClaimableRewards.toFixed(2)}</p>
                              </div>
                            </div>
                            <button className="btn btn-block btn bg-gradient-to-tr from-[#9945FF] to-[#14F195] my-2">Claim all</button>
                            <div className="space-y-2 mt-2">
                              {_.map(staking.userStakedEntries, (entry) => {
                                console.log(entry);
                                return (                                  
                                  <div className="bg-second mb-1 px-2 py-1 rounded flex justify-between items-center" key={entry.nft.externalMetadata.name}>
                                    <p>{entry.nft.externalMetadata.name}</p>
                                    <button className="my-2 btn btn-sm bg-button">Unstake</button>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        {walletNFTs.walletNFTs.length > 0 && ( // unstaked NFTs only shown if existant
                          <div className="bg-second p-2 rounded mt-8 mb-4">
                            <p className="font-bold text-lg mb-4 mt-2">{`Unstaked NFTs (${walletNFTs.walletNFTs.length})`}</p> 
                            <div className="space-y-2 mt-2">
                              {_.map(walletNFTs.walletNFTs, (nft) => {
                                return (                                  
                                  <div className="bg-second mb-1 px-2 py-1 rounded flex justify-between items-center" key={nft.externalMetadata.name}>
                                    <p>{nft.externalMetadata.name}</p>
                                    <button className="my-2 btn btn-sm bg-button">Stake</button>
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
                      <>
                      <div className="bg-second p-2 rounded animate-pulse h-24"></div>
                      <div className="bg-second p-2 rounded animate-pulse h-24"></div>
                      <svg className="!mt-6 place-self-center animate-spin h-5 w-5 bg-blue" viewBox="0 0 24 24"></svg>
                      </>
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