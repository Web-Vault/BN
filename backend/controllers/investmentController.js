const withdrawInvestment = async (req, res) => {
  try {
    const { investmentId } = req.params;
    const { bankName, accountNumber, accountHolderName, ifscCode, amount } = req.body;

    // Validate bank details
    if (!bankName || !accountNumber || !accountHolderName || !ifscCode || !amount) {
      return res.status(400).json({ msg: 'All bank details are required' });
    }

    const investment = await Investment.findById(investmentId);
    if (!investment) {
      return res.status(404).json({ msg: 'Investment not found' });
    }

    // Check if the user is the investor
    if (investment.investor.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to withdraw from this investment' });
    }

    // Check if the withdrawal amount is valid
    if (amount > investment.returns) {
      return res.status(400).json({ msg: 'Withdrawal amount cannot exceed available returns' });
    }

    // Create withdrawal record
    const withdrawal = new Withdrawal({
      investment: investmentId,
      investor: req.user.id,
      amount,
      bankDetails: {
        bankName,
        accountNumber,
        accountHolderName,
        ifscCode
      },
      status: 'pending'
    });

    await withdrawal.save();

    // Update investment returns
    investment.returns -= amount;
    await investment.save();

    res.json({
      msg: 'Withdrawal request submitted successfully',
      withdrawal
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
}; 