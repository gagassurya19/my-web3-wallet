interface EthereumProvider {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>;
  }
  
  interface Window {
    ethereum?: EthereumProvider;
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
  