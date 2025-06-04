import { useState, useEffect } from 'react';
import { FiX, FiDollarSign, FiCreditCard } from 'react-icons/fi';
import axios from 'axios';

const WithdrawalForm = ({ investment, onClose, onWithdraw }) => {
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    ifscCode: '',
    amount: 0
  });
  const [availableAmount, setAvailableAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/investments/withdrawals",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Find withdrawals for this investment, handling null investment fields
        const investmentWithdrawals = (response.data || []).filter(
          w => w && w.investment && w.investment._id && w.investment._id === investment._id
        );

        // Calculate total withdrawn amount
        const totalWithdrawn = investmentWithdrawals.reduce(
          (sum, w) => sum + (w.status === "completed" ? w.amount : 0),
          0
        );

        // The returns value is already calculated by the backend in the /my-investments route
        // and stored in investment.returns
        const available = Math.max(0, investment.returns - totalWithdrawn);
        
        console.log("Withdrawal calculation details:", {
          investmentId: investment._id,
          returns: investment.returns,
          totalWithdrawn,
          available,
          investmentType: investment.type,
          investmentAmount: investment.amount,
          userInvestment: investment.investors.find(inv => inv.user === localStorage.getItem("userId")),
          withdrawals: investmentWithdrawals // Log the filtered withdrawals
        });

        setAvailableAmount(available);
        setFormData(prev => ({
          ...prev,
          amount: available
        }));
      } catch (error) {
        console.error("Error fetching withdrawals:", error);
        // Set available amount to just the returns if there's an error fetching withdrawals
        setAvailableAmount(investment.returns);
        setFormData(prev => ({
          ...prev,
          amount: investment.returns
        }));
      } finally {
        setLoading(false);
      }
    };

    if (investment) {
      fetchWithdrawals();
    }
  }, [investment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'amount') {
      // Ensure amount is a valid number and doesn't exceed available amount
      const amount = Math.min(
        Math.max(0, parseFloat(value) || 0),
        availableAmount
      );
      setFormData(prev => ({
        ...prev,
        [name]: amount
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert amount to number and ensure it's not negative
      const amount = Math.max(0, parseFloat(formData.amount));
      if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount");
        return;
      }
      
      // Update formData with the validated amount
      const updatedFormData = {
        ...formData,
        amount: amount
      };
      
      const response = await onWithdraw(updatedFormData);
      
      // If withdrawal was successful, close the form
      if (response) {
        onClose();
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      alert(error.response?.data?.msg || "Failed to process withdrawal");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Withdraw Returns</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Name
            </label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter bank name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number
            </label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter account number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Holder Name
            </label>
            <input
              type="text"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter account holder name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IFSC Code
            </label>
            <input
              type="text"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter IFSC code"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Withdrawal Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">
                <FiDollarSign className="w-5 h-5" />
              </span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                max={availableAmount}
                step="0.01"
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Available returns: ${availableAmount.toFixed(2)}
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
          >
            <FiCreditCard className="w-5 h-5" />
            Process Withdrawal
          </button>
        </form>
      </div>
    </div>
  );
};

export default WithdrawalForm; 