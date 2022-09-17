import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import _ from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

import { stakeNFTs, unstakeNFTs } from "utils/stakingInstructions";
import NFTDisplayStaking from "components/NFTDisplayStaking";
import config from "../../public/traits/config.json"

const ListItemStaking = ({input, type, setLatestTx}) => {
    const nft = type === 'staked' ? input.nft : input;
    const wallet = useWallet();

    const [loading, setLoading] = useState(false);

    let multiplier = 1;

    if (type === 'unstaked') {
        _.forEach(Object.keys(config), (key) => {
            multiplier *= _.find(config[key].traits, o => {
            return o.name === nft.dynamicLayers[key].replace('iT', 'i-T')
            })?.multiplier;
        })   
    }

    const stake = async(nftMint: PublicKey, multiplier: number) => {
      setLoading(true)
      const res = await stakeNFTs(nftMint, wallet, multiplier)
      setLoading(false)
      res && setLatestTx(res)      
    }

    const unstake = async(nftMint: PublicKey) => {
      setLoading(true)
      const res = await unstakeNFTs(nftMint, wallet)
      setLoading(false)
      res && setLatestTx(res);
    }

    return (
        <div className="bg-second mb-1 rounded flex" key={nft.externalMetadata.name}>
            <NFTDisplayStaking nft={nft}/>
            <div className="w-full flex flex-col justify-between px-2 py-1">
                <p className="font-bold md:text-xl">{nft.externalMetadata.name}</p>
                {type === 'staked' ? (
                    <div className="flex items-end justify-between">
                        <div className="text-xs md:text-base">
                            <p>Claimable Rewards<br/><span className="text-base md:text-lg text-blue font-bold">{input.claimableRewards.toFixed(2)}</span></p>
                            <p>Multiplier<br/><span className="text-base md:text-lg text-blue font-bold">{input.rewardEntry.multiplier.toNumber() / 100}</span></p>
                        </div>
                        <button onClick={() => unstake(input.parsed.originalMint)} className={"my-2 btn btn-sm md:btn-md bg-button hover:bg-buttonhover " + (loading && " loading")}>Unstake</button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <p className="text-xs md:text-base">Multiplier<br/><span className="text-blue font-bold text-base md:text-lg">{multiplier.toFixed(2)}</span></p>
                        <button onClick={() => stake(nft.mint, multiplier)} className={"my-2 btn btn-sm md:btn-md bg-button hover:bg-buttonhover " + (loading && " loading")}>Stake</button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ListItemStaking;