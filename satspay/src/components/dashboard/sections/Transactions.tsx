import React, { useEffect, useState } from 'react';
import Card3D from '../../animations/Card3D';
import ShimmerEffect from '../../animations/ShimmerEffect';
import TransactionList from '../../transactions/TransactionList';
import TransactionDetailModal from '../../transactions/TransactionDetailModal';
import { useTransactionStore } from '../../../stores/transactionStore';
import { useAuthStore } from '../../../stores/authStore';
import { Transaction } from '../../../types/transaction';
import {
  groupTransactionsByDate
} from '../../../utils/transactionUtils';

interface TransactionFilters {
  type?: 'sent' | 'received' | 'all';
  status?: 'pending' | 'completed' | 'failed' | 'autopay' | 'all';
  dateRange?: 'today' | 'week' | 'month' | 'all';
}

const Transactions: React.FC = () => {
  const { user } = useAuthStore();
  const {
    transactions,
    loading,
    error,
    stats,
    fetchTransactions,
    fetchTransactionStats,
    clearError
  } = useTransactionStore();

  const [filters, setFilters] = useState<TransactionFilters>({
    type: 'all',
    status: 'all',
    dateRange: 'all'
  });

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (user) {
      // Fetch transactions with current filters
      const transactionFilters = {
        user_id: user.id,
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.status !== 'all' && { status: filters.status }),
        limit: 50
      };

      fetchTransactions(transactionFilters);
      fetchTransactionStats(user.id);
    }
  }, [user, filters, fetchTransactions, fetchTransactionStats]);

  const handleFilterChange = (filterType: keyof TransactionFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const filteredTransactions = React.useMemo(() => {
    let filtered = [...transactions];

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter(tx => new Date(tx.created_at) >= startDate);
    }

    return filtered;
  }, [transactions, filters]);

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  if (error) {
    return (
      <div className="space-y-6">
        <Card3D intensity="medium" className="transform-gpu">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <div className="text-center">
              <div className="text-red-600 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Transactions</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={clearError}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </Card3D>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Transaction Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card3D intensity="subtle" className="transform-gpu">
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.totalReceived.toFixed(8)}
              </div>
              <div className="text-sm text-secondary-600">Total Received</div>
            </div>
          </Card3D>
          <Card3D intensity="subtle" className="transform-gpu">
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.totalSent.toFixed(8)}
              </div>
              <div className="text-sm text-secondary-600">Total Sent</div>
            </div>
          </Card3D>
          <Card3D intensity="subtle" className="transform-gpu">
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pendingCount}
              </div>
              <div className="text-sm text-secondary-600">Pending</div>
            </div>
          </Card3D>
          <Card3D intensity="subtle" className="transform-gpu">
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.autopayCount}
              </div>
              <div className="text-sm text-secondary-600">Autopay</div>
            </div>
          </Card3D>
        </div>
      )}

      {/* Filters */}
      <Card3D intensity="subtle" className="transform-gpu">
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4">
          <div className="flex flex-wrap gap-4">
            {/* Type Filter */}
            <div className="flex-1 min-w-32">
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All</option>
                <option value="sent">Sent</option>
                <option value="received">Received</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex-1 min-w-32">
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="autopay">Autopay</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="flex-1 min-w-32">
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>
      </Card3D>

      {/* Transaction List */}
      <Card3D intensity="medium" className="transform-gpu">
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-secondary-900 mb-4">
            Transaction History
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-4 rounded-lg bg-secondary-50">
                  <ShimmerEffect className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <ShimmerEffect className="h-4 w-3/4" />
                    <ShimmerEffect className="h-3 w-1/2" />
                  </div>
                  <div className="text-right space-y-1">
                    <ShimmerEffect className="h-4 w-20" />
                    <ShimmerEffect className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                No Transactions Found
              </h3>
              <p className="text-secondary-600">
                {filters.type !== 'all' || filters.status !== 'all' || filters.dateRange !== 'all'
                  ? 'Try adjusting your filters to see more transactions.'
                  : 'Your transaction history will appear here once you start making payments.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
                <div key={date}>
                  <h3 className="text-sm font-semibold text-secondary-500 mb-3 sticky top-0 bg-white py-2">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                  <TransactionList
                    transactions={dayTransactions}
                    onTransactionClick={setSelectedTransaction}
                    showDate={true}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card3D>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
};

export default Transactions;