import { useState, useEffect } from 'react';
import { FiX, FiDollarSign, FiCreditCard } from 'react-icons/fi';

const WithdrawalForm = ({ investment, onClose, onWithdraw }) => {
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    ifscCode: '',
    amount: 0
  });

  useEffect(() => {
    // Set the amount when the investment prop changes
    if (investment && investment.returns) {
      setFormData(prev => ({
        ...prev,
        amount: investment.returns
      }));
    }
  }, [investment]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onWithdraw(formData);
  };

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
                readOnly
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Available returns from your investment
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