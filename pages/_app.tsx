import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { connectorsForWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import type { AppProps } from 'next/app';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { arbitrum, goerli, mainnet, optimism, polygon } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { 
  injectedWallet,
  walletConnectWallet, 
  rainbowWallet,
  metaMaskWallet,
  coinbaseWallet
} from '@rainbow-me/rainbowkit/wallets';
import { Bitski } from 'bitski';

import { bitskiWallet } from './bitskiWallet';

const { chains, provider, webSocketProvider } = configureChains(
  [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [goerli] : []),
  ],
  [publicProvider()]
);

const bitski = new Bitski('1812bcfa-44ab-48e3-87b2-b06de6c8e89d', '/callback.html');

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      bitskiWallet({ bitski, chains }),
    ],
  },
  {
    groupName: 'Other Wallets',
    wallets: [
      injectedWallet({ chains }),
      walletConnectWallet({ chains, projectId: 'YOUR_PROJECT_ID' }),
      metaMaskWallet({ chains }),
      coinbaseWallet({ appName: 'YOUR_APP_NAME', chains }),
      rainbowWallet({ chains }),
    ],
  },
])

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
