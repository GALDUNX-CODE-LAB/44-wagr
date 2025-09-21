'use client'

import React, { useState } from 'react';
import { Search, ChevronDown, Bitcoin, Coins } from 'lucide-react';

const WithdrawalHistoryCard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Dummy data for the table
  const transactions = [
    {
      id: '001',
      hash: '0x1234...abcd',
      amount: '0.5',
      date: '2024-01-15',
      crypto: { name: 'Bitcoin', icon: Bitcoin },
      status: 'approved'
    },
    {
      id: '002',
      hash: '0x5678...efgh',
      amount: '2.3',
      date: '2024-01-14',
      crypto: { name: 'Ethereum', icon: Coins },
      status: 'cancelled'
    },
    {
      id: '003',
      hash: '0x9012...ijkl',
      amount: '1.8',
      date: '2024-01-13',
      crypto: { name: 'Bitcoin', icon: Bitcoin },
      status: 'pending'
    },
    {
      id: '004',
      hash: '0x3456...mnop',
      amount: '5.2',
      date: '2024-01-12',
      crypto: { name: 'Ethereum', icon: Coins },
      status: 'approved'
    },
  ];

  const getStatusStyle = (status: string) => {
    const baseStyle = "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'cancelled':
        return `${baseStyle} bg-red-500/10 text-red-400 border border-red-500/20`;
      case 'approved':
        return `${baseStyle} bg-[#C8A2FF] text-black`;
      case 'pending':
        return `${baseStyle} bg-yellow-500/10 text-yellow-400 border border-yellow-500/20`;
      default:
        return baseStyle;
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.crypto.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || tx.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full max-w-[720px] h-auto min-h-[352px] bg-[#212121] border border-white/10 rounded-[20px] p-4 sm:p-6">
     
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-4">
        <h2 className="text-white font-normal text-lg -mt-2 ">Withdraw History</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-32 h-8 pl-9 pr-3 bg-[#1C1C1C] border border-white/10 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
          
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none w-full sm:w-24 h-8 px-2 pr-6 bg-[#1C1C1C] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table - Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-white/60 text-xs ">
              <th className="text-left px-2 pb-3 font-medium">ID</th>
              <th className="text-left px-2 pb-3 font-medium">Hash</th>
              <th className="text-left px-2 pb-3 font-medium">Amount</th>
              <th className="text-left px-2 pb-3 font-medium">Date</th>
              <th className="text-left px-2 pb-3 font-medium">Crypto</th>
              <th className="text-left px-2 pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.slice(0, 4).map((tx) => {
              const IconComponent = tx.crypto.icon;
              return (
                <tr key={tx.id} className="text-white  text-sm  hover:bg-white/5 transition-colors">
                  <td className="py-3 px-2">{tx.id}</td>
                  <td className="py-3 px-2">{tx.hash}</td>
                  <td className="py-3 px-2">{tx.amount}</td>
                  <td className="py-3 px-2">{tx.date}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">{tx.crypto.name}</span>
                    </div>
                  </td>
                  <td className="py-3 ">
                    <span className={getStatusStyle(tx.status)}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards - Mobile View */}
      <div className="md:hidden space-y-3">
        {filteredTransactions.slice(0, 4).map((tx) => {
          const IconComponent = tx.crypto.icon;
          return (
            <div key={tx.id} className="bg-[#1C1C1C] border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4 text-orange-500" />
                  <span className="text-white font-medium">{tx.crypto.name}</span>
                </div>
                <span className={getStatusStyle(tx.status)}>
                  {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">ID:</span>
                  <span className="text-white">{tx.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white font-medium">{tx.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-gray-300">{tx.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Hash:</span>
                  <span className="text-gray-300 truncate ml-2">{tx.hash}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WithdrawalHistoryCard;