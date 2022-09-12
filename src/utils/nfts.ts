import { PublicKey, Connection, } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { NFT } from "../hooks/useWalletNFTs";
import axios from "axios";
import { programs } from "@metaplex/js"
import _ from 'lodash';
import { solana } from 'aleph-sdk-ts/accounts';
import { aggregate } from 'aleph-sdk-ts';
import { BorshAccountsCoder, Idl, utils, Program, AnchorProvider } from "@project-serum/anchor";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";

const hashList = require('../../public/mint-addresses.json');
const idl: Idl = require('../../public/stake_pool.json');

const alephAcc = solana.ImportAccountFromPrivateKey(Uint8Array.from(JSON.parse(process.env.NEXT_PUBLIC_ALEPH_KP)));

const {
    metadata: { Metadata },
  } = programs
  
  export async function getNFTMetadata(
    mint: string,
    conn: Connection,
    pubkey?: string
  ): Promise<NFT | undefined> {
    try {
      // Fetch on-chain & metadata
      const metadataPDA = await Metadata.getPDA(mint)
      const onchainMetadata = (await Metadata.load(conn, metadataPDA)).data
      const externalMetadata = (await axios.get(onchainMetadata.data.uri)).data      

      // Fetch Dynamic Layers
      const id = externalMetadata.name.replace(' #', 'Official');
      const dynamicLayers: {Wave: string, Location: string, Board: string} = (await aggregate.Get({address: alephAcc.address, keys: [id], APIServer: "https://api2.aleph.im"}))[id];      

      return {
        pubkey: pubkey ? new PublicKey(pubkey) : undefined,
        mint: new PublicKey(mint),
        onchainMetadata,
        externalMetadata,
        dynamicLayers
      }
    } catch (e) {
      console.log(`failed to pull metadata for token ${mint}`)
    }
  }
  
  export async function getNFTMetadataForMany(
    tokens: any[],
    conn: Connection
  ): Promise<NFT[]> {
    const promises: Promise<NFT | undefined>[] = []
    tokens.forEach((token) =>
      promises.push(getNFTMetadata(token.mint, conn, token.pubkey))
    )
    const nfts = (await Promise.all(promises)).filter((n) => !!n)
  
    return nfts
  }

export async function getNFTsByOwner(
    owner: PublicKey,
    conn: Connection
  ): Promise<NFT[]> {        
    const tokenAccounts = await conn.getParsedTokenAccountsByOwner(owner, {
      programId: TOKEN_PROGRAM_ID,
    })
  
    const tokens = tokenAccounts.value.filter((tokenAccount) => {
        const amount = tokenAccount.account.data.parsed.info.tokenAmount
  
        return amount.decimals === 0 && amount.uiAmount === 1
      })
      .map((tokenAccount) => {
        return {
          pubkey: tokenAccount.pubkey,
          mint: tokenAccount.account.data.parsed.info.mint,
        }
      })
      .filter((mint) => {
        return _.includes(hashList, mint.mint)
      });      
  
    return await getNFTMetadataForMany(tokens, conn)
  }

export async function getStakedNFTs(
    owner: PublicKey,
    conn: Connection
  ) {
    const programID = new PublicKey('CsfVevZy66ARUY74VCw8Hqxzjkjis9qLAN3bj49m5wTB');
    const distributorProgramID = new PublicKey('DEvYCMc1BQ7uN3hHgdmHgiNQee2vydMdX3xg9ZJf42c8');

    const stakedEntriesForUser = await conn.getProgramAccounts(
        programID,
        {
            filters: [
                { memcmp: { offset: 41, bytes: bs58.encode([1])} },
                { memcmp: { offset: 81, bytes: owner.toBase58()} }
            ]
        }
    );     
                
    const coder = new BorshAccountsCoder(idl);

    const tokens = await Promise.all(
        _.map(stakedEntriesForUser, async account => {                    
        const stakeEntryData = coder.decode(
            "StakeEntry",
            account.account.data
        );
        return {
          mint: stakeEntryData.stakeMint.toBase58()
        }
    }))
        
    return await getNFTMetadataForMany(tokens, conn)
  }