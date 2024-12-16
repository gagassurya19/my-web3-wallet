import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

export function useWallet() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [solanaConnection, setSolanaConnection] = useState<Connection | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [network, setNetwork] = useState<'ethereum' | 'solana'>('ethereum');
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
    }
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    setSolanaConnection(connection);
  }, []);

  const connectEthereumWallet = async () => {
    if (provider) {
      try {
        const accounts = await provider.send("eth_requestAccounts", []);
        setAddress(accounts[0]);
        
        const balance = await provider.getBalance(accounts[0]);
        setBalance(ethers.formatEther(balance));

        const signer = await provider.getSigner();
        const transactionCount = await provider.getTransactionCount(await signer.getAddress());
        const transactions = await Promise.all(
          Array.from({ length: 5 }, (_, i) => 
            provider.getTransactionReceipt((transactionCount - i - 1).toString())
          )
        );
        setTransactions(transactions.filter(Boolean));
      } catch (error) {
        console.error("Failed to connect Ethereum wallet:", error);
      }
    }
  };

  const connectSolanaWallet = async () => {
    if (window.solana && window.solana.isPhantom && solanaConnection) {
      try {
        const resp = await window.solana.connect();
        const publicKey = resp.publicKey.toString();
        setAddress(publicKey);

        const balance = await solanaConnection.getBalance(new PublicKey(publicKey));
        setBalance((balance / 1e9).toFixed(2)); // Convert Lamports to SOL

        // Fetch recent transactions (simplified, as Solana doesn't have a direct equivalent)
        const transactions = await solanaConnection.getSignaturesForAddress(new PublicKey(publicKey), { limit: 5 });
        setTransactions(transactions);
      } catch (error) {
        console.error("Failed to connect Solana wallet:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (network === 'ethereum') {
      await connectEthereumWallet();
    } else if (network === 'solana') {
      await connectSolanaWallet();
    }
  };

  return { provider, address, balance, network, transactions, connectWallet, setNetwork };
}

