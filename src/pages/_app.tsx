import { AppProps } from 'next/app';
import Head from 'next/head';
import { FC } from 'react';
import { WalletContextProvider } from '../contexts/ContextProvider';
import { AppBar } from '../components/AppBar';
import { ContentContainer } from '../components/ContentContainer';
import { Footer } from '../components/Footer';
import Notifications from '../components/Notification'

require('@solana/wallet-adapter-react-ui/styles.css');
require('../styles/globals.css');

const App: FC<AppProps> = ({ Component, pageProps }) => {
    return (
        <>
          <Head>
            <title>Dynamic NFT Trait Swap</title>
          </Head>

          <WalletContextProvider>
            <div className="flex flex-col min-h-screen"> {/* with class "h-screen" the footer and header are sticky */}
              <Notifications />
              <AppBar/>
              <ContentContainer>
                <Component {...pageProps} />
              </ContentContainer>
              <Footer/>
            </div>
          </WalletContextProvider>
        </>
    );
};

export default App;
