import { ConnectionContext, WalletContextState } from "@solana/wallet-adapter-react"
import { NFT } from "hooks/useWalletNFTs"
import { solana } from "aleph-sdk-ts/accounts";
import { aggregate } from "aleph-sdk-ts";
import { ItemType } from "aleph-sdk-ts/messages/message";
import { Transaction, TransactionInstruction, PublicKey, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as splToken from "@solana/spl-token";

import { waveMint } from "stores/useUserTokenBalanceStore";
import { toast } from "react-toastify";
import Toast from "components/Toast";

export const swapTrait = async(previewTrait: string, traitReference: string, activeNFT: NFT, wallet: WalletContextState, connection: Connection, price: number) => {
    const account = solana.ImportAccountFromPrivateKey(Uint8Array.from(JSON.parse(process.env.NEXT_PUBLIC_ALEPH_KP || '')));
    
    const key = activeNFT.externalMetadata.name?.replace(' #', 'Official');
    const from = activeNFT.dynamicLayers[traitReference];    
    const to = previewTrait;
    const memo = `Switching ${traitReference} from ${from} to ${to}`;
    let dynamicLayers = activeNFT.dynamicLayers;
    dynamicLayers[traitReference] = previewTrait;

    const [ata] = await PublicKey.findProgramAddress(
        [wallet.publicKey.toBuffer(), splToken.TOKEN_PROGRAM_ID.toBuffer(), waveMint.toBuffer()],
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID
    );

    let tx = new Transaction();

    tx.add(new TransactionInstruction({
        keys: [{ pubkey: wallet.publicKey, isSigner: true, isWritable: true }],
        data: Buffer.from(memo, 'utf8'),
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr")
    }))    

    tx.add(
        splToken.Token.createTransferCheckedInstruction(
            splToken.TOKEN_PROGRAM_ID,
            ata,
            waveMint,
            new PublicKey('CSw5zDFYyF6NeGZCecezgrHYSvZfV5UCejwTv3bjBUhE'),
            wallet.publicKey,
            [],
            price * LAMPORTS_PER_SOL,
            9
        )
    );

    try {
        const blockhash = await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash.blockhash
        tx.feePayer = wallet.publicKey;
                
        await wallet.signTransaction(tx)
        const txHash = await connection.sendRawTransaction(tx.serialize());

        const toastId = toast.loading(Toast("Confirming Tx...", txHash))

        const confirmation = await connection.confirmTransaction({
                signature: txHash,
                blockhash: blockhash.blockhash,
                lastValidBlockHeight: blockhash.lastValidBlockHeight,
        }, 'confirmed')

        if (confirmation.value.err === null) {

            toast.update(toastId, { render: "Swapping Trait"})

            const res = await aggregate.Publish({
                account: account,
                key,
                content: dynamicLayers,
                channel: "OceanGuardiansNFT",
                storageEngine: ItemType.storage,
                inlineRequested: true,
                APIServer: "https://official.aleph.cloud",
            })

            if (res.item_hash) {
                toast.update(toastId, {render: "Success", type: "success", autoClose: 5000, isLoading: false})
            } else {
                toast.update(toastId, {render: "Error Swapping Trait. Please reach out in the Discord to receive personalized support", type: "error", autoClose: 5000, isLoading: false})
            }     

            const alephHash = res.item_hash;

            return {alephHash, txHash, traitReference, from, to};
        } else {
            toast.update(toastId, {render: `Error. ${confirmation.value.err.toString()}`, type: "error", autoClose: 5000, isLoading: false})
        }
    } catch (error) {
        toast(error.toString())
        console.log(error);
    }
}