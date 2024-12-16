import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { shortenAddress, formatAmount, shortenTxHash } from '../utils/formatting';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wallet, ArrowRightLeft } from 'lucide-react';
import { ethers } from "ethers";

interface Transaction {
  transactionHash?: string;
  signature?: string;
  gasUsed?: bigint;
  effectiveGasPrice?: bigint;
}

export default function WalletInterface() {
  const { 
    address, 
    balance, 
    network, 
    transactions, 
    connectWallet, 
    setNetwork 
  } = useWallet();
  
  // Menangani rendering client-side dengan lebih aman
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fungsi untuk menghitung biaya gas
  const calculateGasCost = (tx: Transaction): string => {
    try {
      if (network === 'ethereum' && tx.gasUsed && tx.effectiveGasPrice) {
        const gasCost = tx.gasUsed * tx.effectiveGasPrice;
        return ethers.formatEther(gasCost);
      }
      return '0';
    } catch (error) {
      console.error('Error calculating gas cost:', error);
      return '0';
    }
  };

  // Fungsi render transaksi dengan tipe yang lebih ketat
  const renderTransactionDetails = (tx: Transaction, index: number) => {
    const txHash = network === 'ethereum' 
      ? tx.transactionHash 
      : tx.signature;

    return (
      <li 
        key={index} 
        className="py-3 flex justify-between items-center border-b last:border-b-0"
      >
        <div className="flex items-center">
          <ArrowRightLeft className="mr-3 h-5 w-5 text-gray-400" />
          <span className="font-mono text-sm">
            {shortenTxHash(txHash || '')}
          </span>
        </div>
        {network === 'ethereum' && (
          <span className="text-sm text-gray-500">
            {formatAmount(calculateGasCost(tx))} ETH
          </span>
        )}
      </li>
    );
  };

  // Hindari render yang tidak perlu
  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Multi-Chain Wallet Interface
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Select 
                value={network} 
                onValueChange={(value: 'ethereum' | 'solana') => setNetwork(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum (MetaMask)</SelectItem>
                  <SelectItem value="solana">Solana (Phantom)</SelectItem>
                </SelectContent>
              </Select>

              {!address ? (
                <Button onClick={connectWallet} className="w-full">
                  <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
                </Button>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Address:</span>
                    <span className="font-mono">{shortenAddress(address)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Balance:</span>
                    <span className="font-mono">
                      {formatAmount(balance || '0')} {network === 'ethereum' ? 'ETH' : 'SOL'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Recent Transactions
                    </h3>
                    {transactions.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {transactions.map(renderTransactionDetails)}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">No recent transactions</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}