import React from "react";
import WithdrawalHistoryCard from "./components/withdrawal-history";
import WithdrawalFormCard from "./components/withdrawal-card";

const WithdrawalPage = () => {
  return (
    <div className="min-h-screen bg-[#1c1c1c] p-4 sm:p-6 lg:p-8 mt-4">
      <div className="grid sm:grid-cols-3 lg:grid-cols-3 gap-5">
        <div className="wrap">
          <WithdrawalFormCard />
        </div>
        <div className="wrap sm:col-span-2">
          <WithdrawalHistoryCard />
        </div>
      </div>
    </div>
  );
};

export default WithdrawalPage;
