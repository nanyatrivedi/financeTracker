"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
}

interface Budget {
  _id: string;
  category: string;
  amount: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0"];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [category, setCategory] = useState<string>("Food");
  const [budgetCategory, setBudgetCategory] = useState<string>("Food");
  const [budgetAmount, setBudgetAmount] = useState<number>(0);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); 

  useEffect(() => {
    fetchTransactions();
    fetchBudgets();
  }, []);

  async function fetchTransactions() {
    try {
      const res = await fetch("/api/transactions");
      const data = await res.json();
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    }
  }

  async function fetchBudgets() {
    try {
      const res = await fetch("/api/budgets");
      const data = await res.json();
      setBudgets(data);
    } catch (error) {
      console.error("Failed to fetch budgets", error);
    }
  }

  async function handleSubmitTransaction(e: React.FormEvent) {
    e.preventDefault();

    const newTransaction = {
      amount,
      description,
      date,
      category,
    };

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTransaction),
      });

      if (res.ok) {
        alert("Transaction added!");
        setAmount(0);
        setDescription("");
        setDate("");
        setCategory("Food");
        fetchTransactions();
      } else {
        alert("Failed to add transaction.");
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting to server.");
    }
  }

  async function handleSubmitBudget(e: React.FormEvent) {
    e.preventDefault();

    const newBudget = {
      category: budgetCategory,
      amount: budgetAmount,
    };

    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBudget),
      });

      if (res.ok) {
        alert("Budget saved!");
        setBudgetCategory("Food");
        setBudgetAmount(0);
        fetchBudgets();
      } else {
        alert("Failed to save budget.");
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting to server.");
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Transaction deleted!");
        fetchTransactions();
      } else {
        alert("Failed to delete transaction.");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting transaction.");
    }
  }

  const filteredTransactions = transactions.filter((txn) => {
    return txn.date.slice(0, 7) === selectedMonth;
  });

  const totalAmount = filteredTransactions.reduce((sum, txn) => sum + txn.amount, 0);

  const categoryData = Object.values(
    filteredTransactions.reduce((acc: any, txn) => {
      if (!acc[txn.category]) {
        acc[txn.category] = { name: txn.category, value: 0 };
      }
      acc[txn.category].value += txn.amount;
      return acc;
    }, {})
  );

  const budgetComparison = budgets.map((budget) => {
    const spent = filteredTransactions
      .filter((txn) => txn.category === budget.category)
      .reduce((sum, txn) => sum + txn.amount, 0);

    return {
      category: budget.category,
      budgeted: budget.amount,
      spent,
    };
  });

  const insights = budgetComparison.map(({ category, budgeted, spent }) => {
    if (spent > budgeted) {
      return `⚠️ You overspent ₹${spent - budgeted} in ${category}.`;
    } else {
      return `✅ Good job! You stayed ₹${budgeted - spent} under budget for ${category}.`;
    }
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <h1 className="text-4xl font-extrabold text-center text-gray-900">💰 Personal Finance Tracker</h1>

      {/* Month Selector */}
      <div className="flex justify-center">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Total Summary */}
      <div className="bg-white p-6 rounded-2xl shadow-md text-center">
        <h2 className="text-xl font-bold mb-2">Total Expenses in {selectedMonth}</h2>
        <p className="text-3xl text-red-600 font-extrabold">₹ {totalAmount}</p>
      </div>

      {/* Pie Chart */}
      {categoryData.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold mb-4 text-center">Expenses by Category</h2>
          <PieChart width={400} height={300}>
            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      )}

      {/* Budget vs Actual */}
      {budgetComparison.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold mb-4 text-center">Budget vs Spending</h2>

          <BarChart width={500} height={300} data={budgetComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="budgeted" fill="#8884d8" name="Budgeted" />
            <Bar dataKey="spent" fill="#82ca9d" name="Spent" />
          </BarChart>

          {/* Insights */}
          <div className="mt-6 space-y-2">
            {insights.map((msg, idx) => (
              <p key={idx} className="text-sm text-gray-700 text-center">{msg}</p>
            ))}
          </div>
        </div>
      )}

      {/* Add Transaction Form */}
      <form onSubmit={handleSubmitTransaction} className="space-y-6 bg-white p-6 rounded-2xl shadow-md">
        <div className="flex flex-col space-y-4">
          <input
            type="number"
            placeholder="Amount (₹)"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-black"
            required
          />

          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-black"
            required
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-black"
            required
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-black"
            required
          >
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded-lg text-lg font-semibold hover:bg-gray-800"
        >
          ➕ Add Transaction
        </button>
      </form>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <p className="text-center text-gray-500">No transactions for this month.</p>
        ) : (
          filteredTransactions.map((txn) => (
            <div
              key={txn._id}
              className="flex justify-between items-center p-4 bg-white rounded-xl shadow hover:shadow-lg transition"
            >
              <div>
                <h2 className="text-lg font-semibold">{txn.description}</h2>
                <p className="text-gray-500 text-sm">
                  {new Date(txn.date).toLocaleDateString()} • {txn.category}
                </p>
                <p className="mt-1 text-green-600 font-bold">₹ {txn.amount}</p>
              </div>
              <button
                onClick={() => handleDelete(txn._id)}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                ❌ Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
