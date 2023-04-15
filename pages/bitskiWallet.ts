import { Chain, Wallet } from "@rainbow-me/rainbowkit";
import {
  Ethereum,
  InjectedConnector,
  InjectedConnectorOptions,
} from "@wagmi/core";
import { Bitski } from "bitski";

export interface BitskiWalletOptions {
  bitski?: Bitski;
  chains: Chain[];
}

class BitskiConnector extends InjectedConnector {
  bitski?: Bitski;
  windowEthereum?: Ethereum;

  constructor({
    bitski,
    chains,
    options: options_,
  }: {
    bitski?: Bitski;
    chains?: Chain[];
    options?: InjectedConnectorOptions;
  } = {}) {
    let provider: any;

    if (
      typeof window !== "undefined" &&
      (window.ethereum as any) &&
      (window.ethereum as any).isBitski
    ) {
      provider = window.ethereum;
    }

    if (typeof window !== "undefined" && !provider) {
      provider = bitski?.getProvider();
    }

    const options = {
      shimDisconnect: true,
      getProvider: () => provider,
      ...options_,
    };

    super({ chains, options });

    this.windowEthereum = provider;
    this.bitski = bitski;
  }

  private injectProvider() {
    if (!global.window) return;
    global.window.ethereum = this.bitski?.getProvider() as unknown as Ethereum;
  }

  private ejectProvider() {
    if (!global.window) return;
    global.window.ethereum = this.windowEthereum;
  }

  async connect({ chainId }: { chainId?: number } = {}) {
    this.injectProvider();

    const user = await this.bitski?.signIn();
    const result = await super.connect({ chainId });
    return result;
  }

  async disconnect(): Promise<void> {
    this.ejectProvider();

    await super.disconnect();
    await this.bitski?.signOut();
    await this.bitski?.getAuthStatus();
  }
}

export const bitskiWallet = ({
  bitski,
  chains,
  ...options
}: BitskiWalletOptions & InjectedConnectorOptions): Wallet => ({
  id: "bitski",
  name: "Bitski",
  installed:
    !!bitski ||
    (typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined" &&
      ((window.ethereum as any).isBitski === true ||
        !!window.ethereum.providers?.find((p: any) => p.isBitski === true))),
  iconUrl: async () => (await import("./bitskiWallet.svg")).default,
  iconBackground: "#fff",
  downloadUrls: {
    browserExtension:
      "https://chrome.google.com/webstore/detail/bitski/feejiigddaafeojfddjjlmfkabimkell",
    ios: "https://apps.apple.com/us/app/bitski-wallet/id1587199538",
  },
  createConnector: () => ({
    connector: new BitskiConnector({
      bitski,
      chains,
      options,
    }),
  }),
});
