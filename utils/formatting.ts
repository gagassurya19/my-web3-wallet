export function shortenAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  
  export function formatAmount(amount: string): string {
    return parseFloat(amount).toFixed(4);
  }
  
  // Add a new function to format transaction hashes
  export function shortenTxHash(hash: string): string {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  }
  
  