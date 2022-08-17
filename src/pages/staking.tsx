import type { NextPage } from "next";
import Head from "next/head";
import { StakingView } from "../views";

const Staking: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>OceanGuardians Staking</title>
        <meta
          name="Stake your NFTs!"
          content="Stake your NFTs!"
        />
      </Head>
      <StakingView />
    </div>
  );
};

export default Staking;