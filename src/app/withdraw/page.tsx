import React from 'react';
import WithdrawalHistoryCard from './components/withdrawal-history';
import WithdrawalFormCard from './components/withdrawal-card';

const WithdrawalPage = () => {
  return (
    <div className="min-h-screen bg-[#1c1c1c] p-4 sm:p-6 lg:p-8 mt-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="hidden lg:flex gap-8 items-start">
          <WithdrawalFormCard />
          <WithdrawalHistoryCard />
        </div>

        <div className="hidden md:flex lg:hidden flex-col xl:flex-row gap-6 items-start">
          <div className="w-full xl:w-auto">
            <WithdrawalFormCard />
          </div>
          <div className="w-full xl:w-auto">
            <WithdrawalHistoryCard />
          </div>
        </div>

        <div className="md:hidden space-y-6">
          <WithdrawalFormCard />
          <WithdrawalHistoryCard />
        </div>
      </div>
    </div>
  );
};

export default WithdrawalPage;