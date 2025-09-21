'use client'

import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { getUserWithdrawals } from '../../../lib/api';

const WithdrawalHistoryCard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const response = await getUserWithdrawals();
        setWithdrawals(response.data.withdrawals);
      } catch (error) {
        console.error('Failed to fetch withdrawals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawals();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusStyle = (status) => {
    const baseStyle = "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium";
    
    switch (status.toLowerCase()) {
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

  const filteredTransactions = withdrawals.filter(tx => {
    const matchesSearch = tx._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.amount.toString().includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || tx.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  if (loading) {
    return (
      <div className="w-full max-w-[720px] h-auto min-h-[352px] bg-[#212121] border border-white/10 rounded-[20px] p-4 sm:p-6 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

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

      {filteredTransactions.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          No withdrawals found
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-white/60 text-xs ">
                  <th className="text-left px-2 pb-3 font-medium">ID</th>
                  <th className="text-left px-2 pb-3 font-medium">Hash</th>
                  <th className="text-left px-2 pb-3 font-medium">Amount</th>
                  <th className="text-left px-2 pb-3 font-medium">Date</th>
                  <th className="text-left px-2 pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.map((tx) => (
                  <tr key={tx._id} className="text-white text-sm hover:bg-white/5 transition-colors">
                    <td className="py-1 px-2">{tx._id.slice(-6)}</td>
                    <td className="py-1 px-2">{tx.hash || 'N/A'}</td>
                    <td className="py-1 px-2">{tx.amount}</td>
                    <td className="py-1 px-2">{formatDate(tx.date)}</td>
                    <td className="py-1">
                      <span className={getStatusStyle(tx.status)}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {currentTransactions.map((tx) => (
              <div key={tx._id} className="bg-[#1C1C1C] border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">USDT</span>
                  <span className={getStatusStyle(tx.status)}>
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">ID:</span>
                    <span className="text-white">{tx._id.slice(-6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white font-medium">{tx.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span className="text-gray-300">{formatDate(tx.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hash:</span>
                    <span className="text-gray-300 truncate ml-2">{tx.hash || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
              <div className="text-sm text-gray-400">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} entries
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-[#1C1C1C] border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    const isCurrentPage = page === currentPage;
                    const showPage = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                    
                    if (!showPage && page !== 2 && page !== totalPages - 1) {
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2 text-gray-400">...</span>;
                      }
                      return null;
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isCurrentPage
                            ? 'bg-[#C8A2FF] text-black'
                            : 'bg-[#1C1C1C] border border-white/10 text-white hover:bg-white/5'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-[#1C1C1C] border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WithdrawalHistoryCard;