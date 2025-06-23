import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config/config.js';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const TwoFactorSetup = () => {
  const [qr, setQr] = useState(null);
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('start'); // start | show | verified
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSetup = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`${config.API_BASE_URL}/api/admin/2fa/setup`, {}, { headers });
      setQr(res.data.qr);
      setSecret(res.data.secret);
      setStep('show');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate 2FA secret');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`${config.API_BASE_URL}/api/admin/2fa/verify`, { code }, { headers });
      if (res.data.success) {
        setStep('verified');
        toast.success('Two-Factor Authentication enabled!');
      } else {
        toast.error(res.data.message || 'Invalid code');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-blue-700 mb-2 text-center">Two-Factor Authentication Setup</h2>
        <p className="text-gray-600 text-center mb-6 text-sm">Protect your admin account with an extra layer of security.</p>
        {step === 'start' && (
          <>
            <button
              onClick={handleSetup}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition mb-4"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate QR Code'}
            </button>
            <button
              onClick={() => navigate('/admin/settings')}
              className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md border border-gray-300"
            >
              Back to Settings
            </button>
          </>
        )}
        {step === 'show' && (
          <>
            <div className="flex flex-col items-center mb-4">
              <img src={qr} alt="2FA QR Code" className="w-40 h-40 mb-2 border rounded shadow" />
              <div className="text-xs text-gray-500 break-all mb-2">Secret: <span className="font-mono text-blue-700">{secret}</span></div>
              <div className="text-xs text-gray-500 text-center mb-2">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.), or enter the secret manually.</div>
            </div>
            <form onSubmit={handleVerify} className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Enter 6-digit code from your app</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                maxLength={6}
                pattern="[0-9]{6}"
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="123456"
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
              </button>
            </form>
            <button
              onClick={() => navigate('/admin/settings')}
              className="w-full mt-3 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md border border-gray-300"
            >
              Back to Settings
            </button>
          </>
        )}
        {step === 'verified' && (
          <div className="text-center">
            <div className="text-green-600 text-3xl mb-2">✔</div>
            <div className="font-semibold mb-2">Two-Factor Authentication is now enabled!</div>
            <button
              onClick={() => navigate('/admin/settings')}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md mt-4 rounded-md"
            >
              Back to Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetup; 