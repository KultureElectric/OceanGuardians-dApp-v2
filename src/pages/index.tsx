import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Dynamic NFT Trait Swap</title>
        <meta
          name="Swap the Traits of your NFTs!"
          content="Dynamic NFT Trait Swap"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
