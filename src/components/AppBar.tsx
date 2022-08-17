import { FC } from 'react';

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export const AppBar: FC = props => {
  return (
    <div>
      {/* NavBar / Header */}
      <div className="navbar flex flex-row md:mb-2 shadow-lg bg-header">
        <div className="navbar-start">
          {/* TODO: Change Logo styles + maybe add text next to it */}
          <div className="inline w-22 h-22 md:p-2">
            <img
                src="/OG_Logo_without_text.png"
                width="60"
                height="60"
                alt="OceanGuardians NFT"
              />
          </div>
        </div>

        {/* Wallet & Settings */}
        <div className="navbar-end">
          <WalletMultiButton className="btn btn-ghost mr-1" />
        </div>
      </div>
      {props.children}
    </div>
  );
};
