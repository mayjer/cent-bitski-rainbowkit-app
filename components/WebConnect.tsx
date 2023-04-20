import React, { useState, useEffect, useCallback } from "react";
import styles from "./web3Connect.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";

export const Web3Connect: React.FC = () => {
  const [currentWallet, setCurrentWallet] = useState<any>("");
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  const { address } = useAccount({
    onConnect: async ({ address, isReconnected, connector }) => {
      const chain = await connector?.getChainId();
      console.log("Web3Connect::onConnect::", { address, chain });
      if (!isReconnected) signIn(address as string, chain as number);
      setCurrentWallet(address);
    },
  });

  const onDisconnect = useCallback(() => {
    console.log("Web3Connect::onDisconnect");
    disconnect();
  }, [disconnect]);

  useEffect(() => {
    if (currentWallet && address && currentWallet !== address) {
      console.log("Web3Connect::current wallet is different:", { currentWallet, address });
      onDisconnect();
    }
  }, [currentWallet, address, onDisconnect]);

  const signIn = async (address: string, chainId: number) => {
    console.log("Web3Connect::signIn::", { address, chainId });
    if (!address || !chainId) return;

    try {
      const message = "Cent Marketplace";
      console.log("Web3Connect::signIn:: signing message");
      const _signature: string = await signMessageAsync({ message });
      if (_signature) return;

      console.log("Web3Connect: message signed");
      const userData = {
        wallet: address,
        signedMsg: _signature,
        message,
      };
      console.log("Web3Connect::signIn::", { userData });
    } catch (error) {
      console.log("Web3Connect: error sign in", { error });
      onDisconnect();
    }
  };

  return (
    <div className={styles.connectDiv}>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openChainModal,
          openConnectModal,
          openAccountModal,
          mounted,
        }) => {
          const ready = mounted;
          const connected = ready && account && chain;
          return (
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
            >
              {(() => {
                if (chain && chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      type="button"
                      className={styles.wrongNetwork}
                    >
                      Switch To Supported Network
                    </button>
                  );
                }

                return (
                  <div style={{ display: "flex", gap: 12 }}>
                    {connected ? (
                      <button
                        onClick={() => onDisconnect()}
                        type="button"
                        className={styles.connectBtn}
                      >
                        Disonnect
                      </button>
                    ) : (
                      <button
                        onClick={() => openConnectModal()}
                        type="button"
                        className={styles.connectBtn}
                      >
                        Connect Wallet
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
};
