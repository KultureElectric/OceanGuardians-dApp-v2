import { PublicKey } from "@solana/web3.js"
import { programs } from "@metaplex/js"
import { useEffect, useState } from "react"
import { getNFTsByOwner, getStakedNFTs } from "../utils/nfts"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"

export type NFT = {
  pubkey?: PublicKey
  mint: PublicKey
  onchainMetadata: programs.metadata.MetadataData
  externalMetadata: {
    attributes: Array<any>
    collection: any
    description: string
    edition: number
    external_url: string
    image: string
    name: string
    properties: {
      files: Array<string>
      category: string
      creators: Array<string>
    }
    seller_fee_basis_points: number
  },
  dynamicLayers: {}
}

const useWalletNFTs = (single?: boolean) => {
  const { connection } = useConnection();  
  const { publicKey } = useWallet();
  const [walletNFTs, setWalletNFTs] = useState<Array<NFT>>([])
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNFTs = async () => {
      setLoading(true)
      const NFTs = await getNFTsByOwner(publicKey, connection)
      setWalletNFTs(NFTs)
      if (single) {
        setLoading(false);
        return;
      }
      const stakedNFTs = await getStakedNFTs(publicKey, connection);      
      setWalletNFTs(nfts => [...nfts, ...stakedNFTs]);
      setLoading(false);
    }

    if (publicKey) {
      console.log("Fetching NFTs");
      fetchNFTs()
    }
  }, [publicKey])



  return {walletNFTs, loading}
}

export default useWalletNFTs;