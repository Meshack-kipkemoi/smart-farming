"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Edit2, Trash2 } from "lucide-react";

interface Transaction {
  id: string;
  order_id: string;
  amount: number;
  payment_method: string;
  status: string;
  mpesa_request_id?: string;
  created_at: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchTransactions();
  }, [filterStatus]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/transactions?status=${filterStatus}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (
    transactionId: string,
    newStatus: string,
  ) => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setTransactions(
          transactions.map((t) =>
            t.id === transactionId ? { ...t, status: newStatus } : t,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to update transaction:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 min-h-screen w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Transactions</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 w-full">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-gray-600 text-sm font-medium">
              Total Transactions
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {transactions.length}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium">Total Amount</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              KES {totalAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium">
              Average Transaction
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              KES{" "}
              {transactions.length > 0
                ? Math.round(totalAmount / transactions.length).toLocaleString()
                : 0}
            </p>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-8">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <Card className="p-8 text-center text-gray-600">
          No transactions found
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {transaction.order_id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      KES {transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {transaction.payment_method.toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={transaction.status}
                        onChange={(e) =>
                          handleStatusChange(transaction.id, e.target.value)
                        }
                        className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${getStatusColor(
                          transaction.status,
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye size={18} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit2 size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
