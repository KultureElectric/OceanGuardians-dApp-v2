import { ConnectionContext, WalletContextState } from "@solana/wallet-adapter-react"
import { NFT } from "hooks/useWalletNFTs"
import { solana } from "aleph-sdk-ts/accounts";
import { aggregate } from "aleph-sdk-ts";
import { ItemType } from "aleph-sdk-ts/messages/message";
import { Transaction, TransactionInstruction, PublicKey, Connection } from "@solana/web3.js";

export const swapTrait = async(previewTrait: string, traitReference: string, activeNFT: NFT, wallet: WalletContextState, connection: Connection) => {
    const account = solana.ImportAccountFromPrivateKey(Uint8Array.from(JSON.parse(process.env.NEXT_PUBLIC_ALEPH_KP || '')));
    
    const key = activeNFT.externalMetadata.name?.replace(' #', 'Official');
    const from = activeNFT.dynamicLayers[traitReference];    
    const to = previewTrait;
    const memo = `Switching ${traitReference} from ${from} to ${to}`;
    let dynamicLayers = activeNFT.dynamicLayers;
    dynamicLayers[traitReference] = previewTrait;

    const tx = new Transaction().add(new TransactionInstruction({
        keys: [{ pubkey: wallet.publicKey, isSigner: true, isWritable: true }],
        data: Buffer.from(memo, 'utf8'),
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr")
    }));

    try {
        const blockhash = await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash.blockhash
        tx.feePayer = wallet.publicKey;
        await wallet.signTransaction(tx)
        const txHash = await connection.sendRawTransaction(tx.serialize());

        const confirmation = await connection.confirmTransaction({
            signature: txHash,
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight
        })        

        if (confirmation.value.err === null) {
            const res = await aggregate.Publish({
                account: account,
                key,
                content: dynamicLayers,
                channel: "OceanGuardiansNFT",
                storageEngine: ItemType.storage,
                inlineRequested: true,
                APIServer: "https://api2.aleph.im",
            });    
            const alephHash = res.item_hash;

            return {alephHash, txHash, traitReference, from, to};
        }

    } catch (error) {
        console.log(error);
    }
}