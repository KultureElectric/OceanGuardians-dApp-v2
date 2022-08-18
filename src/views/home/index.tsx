// Next, React
import { FC, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import _ from 'lodash';
import { NFT } from 'hooks/useWalletNFTs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandPointUp } from '@fortawesome/free-solid-svg-icons';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import config from "../../../public/traits/config.json"

// Wallet
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

// Components
import pkg from '../../../package.json';
import ListItem from 'components/ListItem';
import NFTDisplay from 'components/NFTDisplay';

import { swapTrait } from 'utils/swapTrait';

// Store
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';
import useUserTokenBalanceStore from 'stores/useUserTokenBalanceStore';
import { notify } from 'utils/notifications';

// Hooks
import useWalletNFTs from 'hooks/useWalletNFTs';

export const HomeView: FC = ({ }) => {
  const [activeNFT, setActiveNFT] = useState<NFT>(null);
  const [traitReference, setTraitReference] = useState(null);
  const [previewTrait, setPreviewTrait] = useState('');    
  const [formError, setFormError] = useState('');
  const [receipt, setReceipt] = useState<{alephHash: string, txHash: string, traitReference: string, from: string, to: string}>(null);
  const [reload, setReload] = useState(0);
  const [swapLoading, setSwapLoading] = useState(false)

  const wallet = useWallet();
  const walletNFTs = useWalletNFTs();

  const refSwap = useRef(null);
  
  const { connection } = useConnection();
  // Balances
  const balance = useUserSOLBalanceStore((s) => s.balance)
  const { getUserSOLBalance } = useUserSOLBalanceStore()
  const waveBalance = useUserTokenBalanceStore((s) => s.balance)
  const { getUserTokenBalance } = useUserTokenBalanceStore()

  useEffect(() => {
    if (wallet.publicKey) {
      console.log(wallet.publicKey.toBase58())
      getUserSOLBalance(wallet.publicKey, connection)
      getUserTokenBalance(wallet.publicKey, connection)
    }
  }, [wallet.publicKey, connection, getUserSOLBalance, getUserTokenBalance])

  const handleSubmit = async(e: any) => {
    e.preventDefault();

    // get price for transaction
    const price = _.find(config[traitReference].traits, (o) => {
      return o.name === previewTrait
    }).price

    if (previewTrait === activeNFT.dynamicLayers[traitReference]) {
      setFormError("This trait is already active")
    } else if (previewTrait === "") {
      setFormError("Select a trait")
    } else if (price && waveBalance < price) {
      setFormError('Not enough $WAVE');
    }else {
      setFormError('')
      setSwapLoading(true)
      const res = await swapTrait(previewTrait, traitReference, activeNFT, wallet, connection, price);
      setReload(reload + 1)      
      setReceipt(res)
      setSwapLoading(false)
      setTraitReference(null)
    }
  }

  return (
    <div className="md:hero mx-auto p-4 relative w-screen">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          Dashboard
        </h1>
        <h4 className="md:w-full text-center text-slate-300 my-2">
          <p>Simply dApp with a Trait Swap for swapping your favourite traits of the OceanGuardians collection.</p>
        </h4>
        {/* NFT List Section */}
        {wallet.connected ? (   
          <div className="pt-4 md:flex md:flex-col md:items-center">
            <p className="font-bold py-2 md:text-lg">Your NFTs</p>
            <div className="flex items-center space-x-2 overflow-x-auto touch-pan-x">
            {walletNFTs.length ? (
              _.map(walletNFTs, nft => {                    
                return <ListItem nft={nft} reload={reload} activeNFT={activeNFT} setActiveNFT={(nft: NFT) => {setActiveNFT(nft)}} key={nft.externalMetadata.name} />
              })
            ) : (
              <>
              <div className="w-36 md:w-44 aspect-square rounded bg-header animate-pulse"></div>
              <div className="w-36 md:w-44 aspect-square rounded bg-header animate-pulse"></div>
              </>
            )}
            </div>
            {/* Active NFT Section */}
            {activeNFT ? (
              <div className="pt-4 md:w-3/4">
                <h1 className="pt-4 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">{activeNFT.externalMetadata.name}</h1>
                {/* First Dynamic Attributes with different Styling */}
                <p className="font-bold py-2 md:text-lg">Attributes</p>
                <div className="flex flex-wrap">
                  {
                  _.map(Object.keys(activeNFT.dynamicLayers), key => {                    
                    return (
                        <div onClick={() => {setTraitReference(key); setPreviewTrait(''); setFormError(""); refSwap.current.scrollIntoView({ behavior: "smooth"})}} className="border border-second mr-2 mb-1 px-2 py-1 rounded bg-gradient-to-tr from-[#000000] to-[#3B4F78] transition ease-in-out delay-50 hover:-translate-y-1 duration-100" key={key}>
                          <div className="stat-title">{key}</div>
                          <div className="text-sm">{activeNFT.dynamicLayers[key]}</div>
                        </div>
                      )
                    })
                    
                  } 
                  {/* Then the normal attributes */}
                  {
                    _.map(activeNFT.externalMetadata.attributes, attribute => {                  
                      return (
                        <div className="border border-second mr-2 mb-1 px-2 py-1 rounded" key={attribute.trait_type}>
                          <div className="stat-title">{attribute.trait_type}</div>
                          <div className="text-sm">{attribute.value}</div>
                        </div>
                      )
                    })
                  }
                </div>
                {/* Trait Swap */}
                <div>
                  <h1 ref={refSwap} className="my-4 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">Swap</h1>
                  {/* NFT Display */}
                  <div className="lg:flex">
                  <NFTDisplay activeNFT={activeNFT} traitReference={traitReference} previewTrait={previewTrait} />
                  <div className="bg-second p-2 rounded-b lg:rounded-none lg:!rounded-r lg:px-4 lg:w-full">
                    <div className="grid grid-cols-3 space-x-1 pt-2">
                    { // Swap Select
                    _.map(Object.keys(activeNFT.dynamicLayers), key => {         
                      if (key === traitReference) {
                        return (
                          <div key={key} onClick={() => {setTraitReference(key); setPreviewTrait(''); setFormError(""); setReceipt(null)}} className="border border-second mb-1 px-2 py-1 rounded bg-gradient-to-tr from-[#3a3a3a] to-[#3B4F78] -translate-y-1">
                            <div className="text-sm">{key}</div>
                          </div>
                        )
                      }           
                      return (
                          <div key={key} onClick={() => {setTraitReference(key); setPreviewTrait(''); setFormError(""); setReceipt(null)}} className="border border-second mb-1 px-2 py-1 rounded bg-gradient-to-tr from-[#000000] to-[#3B4F78] transition ease-in-out delay-50 hover:-translate-y-1 duration-100">
                            <div className="text-sm">{key}</div>
                          </div>
                        )
                      })
                    }
                    </div>
                    { // Select Form
                      traitReference ? (
                        <div className="my-4">
                            <p className="text-sm"><FontAwesomeIcon icon={faInfoCircle} /> Choose a <span className="underline">{traitReference}</span> for <span>{activeNFT.externalMetadata.name}</span></p>
                            <form>
                              <select className="my-2 select select-bordered select-ghost select-sm w-full" value={previewTrait} onChange={(e) => {setPreviewTrait(e.target.value); setFormError("")}}>
                                <option disabled value=''>{`Select ${traitReference}`}</option>
                                {
                                  _.map(config[traitReference].traits, trait => {
                                    return (
                                      <option key={trait.name} value={trait.name}>{trait.name}</option>
                                    )
                                  })
                                }
                              </select>
                              <p className="text-xs text-error mb-2">{formError}</p>
                                {previewTrait && (
                                  _.map(config[traitReference].traits, (trait) => {
                                    if (trait.name === previewTrait) {
                                      return (
                                        <div className="flex my-4 space-x-2">
                                        <div className="border border-second mb-1 px-2 py-1 rounded bg-gradient-to-tr from-[#6B8FD6] to-[#3B4F78] text-xs">PRICE: <span className="font-bold text-base">{trait.price}</span> $WAVE</div>
                                        <div className="border border-second mb-1 px-2 py-1 rounded bg-gradient-to-tr from-[#6B8FD6] to-[#3B4F78] text-xs">MULTIPLIER: <span className="fnt-bold text-base">{trait.multiplier}X</span></div>
                                        </div>
                                      )
                                    }
                                  }))
                                }
                              <div className="flex justify-between">
                                <p className="text-xs">Current trait: <span className="font-bold">{activeNFT.dynamicLayers[traitReference]}</span></p>
                                {previewTrait && (
                                  <>
                                  <FontAwesomeIcon icon={faArrowRight}/>
                                  <p className="text-xs">Trait selected: <span className="font-bold underline">{previewTrait}</span></p>
                                  </>
                                )}
                              </div>
                              <button type='submit' className={"btn btn-block btn bg-gradient-to-tr from-[#9945FF] to-[#14F195] my-2 " + (swapLoading && " loading")} onClick={handleSubmit}>SWAP</button>
                              <p className="text-center text-xs text-inherit stat-title">Powered by Dynamic Labs</p>
                            </form>
                        </div>
                      ) : ( // Begin of the else statements - Select Trait first
                        <p className="text-center py-8 italic">Select a Trait to Swap <FontAwesomeIcon className='animate-bounce' icon={faHandPointUp} size="lg" /></p>
                      )
                    }
                    {receipt && (
                      <div className="border rounded p-2 border-header">
                        <div className="flex justify-between">
                          <p className="font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">SUCCESS!</p>
                          <div className="space-x-1">
                            <a target="_blank" className="btn btn-info btn-outline btn-xs" href={'https://solscan.io/tx/' + receipt.txHash + '?cluster=mainnet'}>Solscan</a>
                            <a target="_blank" className="btn btn-info btn-outline btn-xs" href={"https://explorer.aleph.im/address/SOL/2BMddnLuE54MZdvbjGoy8RiTdYaZ1rYeVFn1aTcsybvR/message/AGGREGATE/" + receipt.alephHash}>Aleph</a>
                          </div>
                        </div>
                        <p className="font-bold text-center my-4"><span className="italic">{`${receipt.from}`}</span> <FontAwesomeIcon icon={faArrowRight} /> <span className="underline">{`${receipt.to}`}</span></p>
                      </div>
                      )
                    }
                  </div>
                  </div>
                </div>
              </div>
            ) : ( // Select an NFT first
              <p className="text-center py-8 italic">Click on one of your NFTs <FontAwesomeIcon className='animate-bounce' icon={faHandPointUp} size="lg" /></p>
            )
            }
          </div>
          ) : ( // Connect your wallet first
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
  );
};