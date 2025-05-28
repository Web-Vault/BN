import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateInvestment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    type: "equity",
    returns: "",
    deadline: "",
  });

  const [validationErrors, setValidationErrors] = useState({
    title: "",
    description: "",
    amount: "",
    returns: "",
    deadline: "",
  });

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Title validation
    if (formData.title.length < 5) {
      errors.title = "Title must be at least 5 characters long";
      isValid = false;
    } else if (formData.title.length > 100) {
      errors.title = "Title must not exceed 100 characters";
      isValid = false;
    }

    // Description validation
    if (formData.description.length < 50) {
      errors.description = "Description must be at least 50 characters long";
      isValid = false;
    } else if (formData.description.length > 300) {
      errors.description = "Description must not exceed 300 characters";
      isValid = false;
    }

    // Amount validation
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.amount = "Amount must be greater than 0";
      isValid = false;
    } else if (amount > 1000000) {
      errors.amount = "Amount cannot exceed $1,000,000";
      isValid = false;
    }

    // Returns validation based on type
    if (formData.type === "equity") {
      // Validate equity percentage format (e.g., "21%")
      if (!formData.returns.match(/^\d+%$/)) {
        errors.returns = "Please enter a valid percentage (e.g., 21%)";
        isValid = false;
      } else {
        // Validate that equity percentage is between 1% and 100%
        const percentage = parseInt(formData.returns);
        if (percentage < 1 || percentage > 100) {
          errors.returns = "Equity percentage must be between 1% and 100%";
          isValid = false;
        }
      }
    } else if (formData.type === "loan") {
      // Validate loan interest format (e.g., "15% annual interest")
      if (!formData.returns.match(/^\d+% annual interest$/)) {
        errors.returns = "Please enter in format: 'X% annual interest'";
        isValid = false;
      } else {
        // Validate that interest rate is between 1% and 30%
        const percentage = parseInt(formData.returns);
        if (percentage < 1 || percentage > 30) {
          errors.returns = "Interest rate must be between 1% and 30%";
          isValid = false;
        }
      }
    } else if (formData.type === "donation") {
      if (formData.returns.length < 10) {
        errors.returns =
          "Please provide a detailed description of social impact";
        isValid = false;
      }
    }

    // Deadline validation
    const deadline = new Date(formData.deadline);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() + 1); // Maximum 1 year from now

    if (deadline < today) {
      errors.deadline = "Deadline cannot be in the past";
      isValid = false;
    } else if (deadline > maxDate) {
      errors.deadline = "Deadline cannot be more than 1 year from now";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/investments",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        toast.success("Investment request created successfully!");
        navigate("/profile");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to create investment";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] p-3 lg:p-8">
        <div className="max-w-3xl mx-auto bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Create Funding Request
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={100}
                className={`w-full px-4 py-2 rounded-lg border ${
                  validationErrors.title ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter a descriptive title"
              />
              {validationErrors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                maxLength={300}
                rows="4"
                className={`w-full px-4 py-2 rounded-lg border ${
                  validationErrors.description
                    ? "border-red-500"
                    : "border-gray-300"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Describe your funding request in detail"
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-red-600">
                  {validationErrors.description}
                </p>
                <div className="flex items-center gap-2">
                  <p className={`text-sm ${formData.description.length >= 280 ? 'text-red-400' : 'text-gray-500'}`}>
                    {formData.description.length}/300 characters
                  </p>
                  {formData.description.length >= 280 && (
                    <p className="text-sm text-red-400">
                      {300 - formData.description.length} characters remaining
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Amount Needed ($)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="1"
                  max="1000000"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    validationErrors.amount
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter amount"
                />
                {validationErrors.amount && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.amount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Investment Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="equity">Equity</option>
                  <option value="loan">Loan</option>
                  <option value="donation">Donation</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Returns
                </label>
                <input
                  type="text"
                  name="returns"
                  value={formData.returns}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 rounded-lg border ${
                    validationErrors.returns
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder={
                    formData.type === "equity"
                      ? "e.g., 21% (equity share)"
                      : formData.type === "loan"
                      ? "e.g., 15% annual interest"
                      : "e.g., Monthly impact reports"
                  }
                />
                {validationErrors.returns && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.returns}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  {formData.type === "equity" ? (
                    "For $10,000 investment, returns will be calculated as: $10,000 × equity percentage"
                  ) : formData.type === "loan" ? (
                    <>
                      Interest rate is calculated annually.
                      <br />
                      (must write in format: e.g., 15% annual interest)
                    </>
                  ) : (
                    "Describe the social impact reports you'll provide"
                  )}
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  max={
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() + 1)
                    )
                      .toISOString()
                      .split("T")[0]
                  }
                  className={`w-full px-4 py-2 rounded-lg border ${
                    validationErrors.deadline
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {validationErrors.deadline && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.deadline}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateInvestment;
