import { useWallet } from "@solana/wallet-adapter-react"
import { FC } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandPointUp } from "@fortawesome/free-solid-svg-icons";
import useStaking from "hooks/useStaking";

export const StakingView: FC = ({ }) => {
    const wallet = useWallet();
    const [totalClaimableRewards, userStakedEntries] = useStaking();
    console.log(totalClaimableRewards);
    console.log(userStakedEntries);
    
    

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
                    // Staking Stats
                    <div></div>
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