import { useWallet } from "@solana/wallet-adapter-react"
import { FC } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandPointUp } from "@fortawesome/free-solid-svg-icons";
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
                          <p className="text-2xl font-bold text-blue">{staking.totalDailyAccrualRate}</p>
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
                        <div>passt</div> // TODO
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