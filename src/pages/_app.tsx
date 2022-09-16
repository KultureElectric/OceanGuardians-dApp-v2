import { AppProps } from 'next/app';
import Head from 'next/head';
import { FC } from 'react';
import { WalletContextProvider } from '../contexts/ContextProvider';
import { AppBar } from '../components/AppBar';
import { ContentContainer } from '../components/ContentContainer';
import { Footer } from '../components/Footer';
import { ToastContainer } from 'react-toastify'

require('@solana/wallet-adapter-react-ui/styles.css');
require('../styles/globals.css');
import 'react-toastify/dist/ReactToastify.css';

const App: FC<AppProps> = ({ Component, pageProps }) => {
    return (
        <>
          <Head>
            <title>Dynamic NFT Trait Swap</title>
          </Head>

          <WalletContextProvider>
            <div className="flex flex-col min-h-screen"> {/* with class "h-screen" the footer and header are sticky */}
              <AppBar/>
              <ContentContainer>
                <Component {...pageProps} />
                <ToastContainer
                  position="bottom-left"
                  theme='dark'
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  bodyClassName={"font-bold text-sm"}
                />
              </ContentContainer>
              <Footer/>
            </div>
          </WalletContextProvider>
        </>
    );
};

export default App;
