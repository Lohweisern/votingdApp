"use client";

import React from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { polygonMumbai, sepolia, lineaTestnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const projectId = "2495bb656e02a8c5b734d12ae20a8472";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygonMumbai, sepolia, lineaTestnet],
  [publicProvider()]
);

const { wallets } = getDefaultWallets({
  appName: "Fair & Square",
  projectId,
  chains,
});

const demoAppInfo = {
  appName: "Fair & Square",
};

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: "Other",
    wallets: [
      argentWallet({ projectId, chains }),
      trustWallet({ projectId, chains }),
      ledgerWallet({ projectId, chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const Providers = ({ children }) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        appInfo={demoAppInfo}
        modalSize="compact"
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default Providers;