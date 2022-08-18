import create, { State } from 'zustand'
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const waveMint = new PublicKey('wavewWFGmDDTJ3CU1AeU1eXUNjxnN8JJY8hSpi7Hz1V');

interface UserTokenBalanceStore extends State {
  balance: number;
  getUserTokenBalance: (publicKey: PublicKey, connection: Connection) => void
}

const useUserTokenBalanceStore = create<UserTokenBalanceStore>((set, _get) => ({
  balance: 0,
  getUserTokenBalance: async (publicKey, connection) => {
  let balance = 0;

    try {
      const [ata] = await PublicKey.findProgramAddress(
        [publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), waveMint.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
    
      balance = (await connection.getTokenAccountBalance(ata)).value.uiAmount;
    } catch (e) {
      console.log(`error getting balance: `, e);
    }
    set((s) => {
      s.balance = balance;
      console.log(`balance updated, `, balance);
    })
  },
}));

export default useUserTokenBalanceStore;