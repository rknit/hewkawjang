// components/my-wallet.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';

interface MyWalletProps {
  balance: number;
  onAddBalance?: () => void;
}

export default function MyWallet({ balance, onAddBalance }: MyWalletProps) {
  return (
    <div className="bg-[#FDF6F0] border border-[#F5C9A0] rounded-xl p-6 flex items-center justify-between w-full max-w-lg mx-auto shadow-md">
      {/* Left: Wallet Icon */}
      <div className="flex-shrink-0">
        <Ionicons name="wallet-outline" size={240} color="black" />
      </div>

      {/* Right: Balance and Add Button */}
      <div className="flex-1 flex flex-col items-start justify-center ml-6">
        <span className="text-black text-xl font-semibold">
          Balance : {balance.toLocaleString()} ฿
        </span>
        <button
          onClick={onAddBalance}
          className="mt-4 bg-[#D97706] text-white px-6 py-2 rounded-lg hover:bg-[#b95d04] transition"
        >
          Add balance
        </button>
      </div>
    </div>
  );
}
