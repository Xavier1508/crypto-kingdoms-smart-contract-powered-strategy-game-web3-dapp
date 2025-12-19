import React, { useState } from 'react';
import { Wallet } from 'lucide-react';

const RegisterForm = ({ onToggle, onRegisterSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    kingdomName: '',
    email: '',
    walletAddress: '',
    password: ''
  });

  const API_URL = import.meta.env.VITE_API_URL; 

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setFormData(prev => ({ ...prev, walletAddress: account }));
        console.log("Wallet Connected:", account);
      } catch {
        setError("Failed to connect wallet. Please check MetaMask.");
      }
    } else {
      setError("MetaMask not found! Please install it.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.walletAddress) {
        setError("Please connect your wallet first!");
        setIsLoading(false);
        return;
    }

    try {
      const endpoint = `${API_URL}/api/auth/register`; 
      
      console.log("Registering to:", endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.kingdomName,
          email: formData.email,
          password: formData.password,
          walletAddress: formData.walletAddress
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Registrasi gagal');
      }
      onRegisterSuccess(); 
    } catch (err) {
      console.error("Register Error:", err);
      setError(err.message || "Failed to register. Check connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleRegister}>
      <div className="space-y-2">
        <label htmlFor="reg-kingdom" className="block text-sm font-medium text-gray-200">
          Kingdom Name (Username)
        </label>
        <input 
          type="text" 
          id="reg-kingdom"
          name="kingdomName"
          placeholder="Choose your kingdom name" 
          value={formData.kingdomName}
          onChange={handleChange}
          required 
          className="w-full px-3 py-2.5 bg-gray-700/50 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/50 transition-all"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="reg-email" className="block text-sm font-medium text-gray-200">
          Email
        </label>
        <input 
          type="email" 
          id="reg-email"
          name="email"
          placeholder="commander@kingdom.eth" 
          value={formData.email}
          onChange={handleChange}
          required 
          className="w-full px-3 py-2.5 bg-gray-700/50 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/50 transition-all"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="reg-wallet" className="block text-sm font-medium text-gray-200">
          Wallet Address
        </label>
        <div className="flex gap-2">
            <input 
            type="text" 
            id="reg-wallet"
            name="walletAddress"
            placeholder="Click connect ->" 
            value={formData.walletAddress}
            readOnly
            className="flex-1 px-3 py-2.5 bg-gray-700/50 border border-gray-600 rounded-md text-gray-400 focus:outline-none cursor-not-allowed"
            />
            <button 
                type="button"
                onClick={connectWallet}
                className="px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-md font-bold flex items-center gap-2 transition-colors"
                title="Connect MetaMask"
            >
                <Wallet className="w-5 h-5" />
            </button>
        </div>
        <p className="text-[10px] text-gray-500">
            *Requires MetaMask (Sepolia Network Recommended)
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="reg-password" className="block text-sm font-medium text-gray-200">
          Password
        </label>
        <input 
          type="password" 
          id="reg-password"
          name="password"
          placeholder="Create a strong password" 
          value={formData.password}
          onChange={handleChange}
          required 
          className="w-full px-3 py-2.5 bg-gray-700/50 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/50 transition-all"
        />
      </div>
      {error && (
        <div className="text-center text-red-400 text-sm p-3 bg-red-900/30 rounded-md border border-red-500/50">
          {error}
        </div>
      )}
      
      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full py-3 px-4 bg-[#d4af37] text-[#1a2332] text-lg font-bold rounded-md transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        style={{ fontFamily: 'Cinzel, serif' }}
      >
        {isLoading ? 'Creating Kingdom...' : 'Create Account'}
      </button>
      
      <p className="text-center text-sm text-gray-400">
        Already have an account?{' '}
        <button 
          type="button"
          onClick={onToggle}
          className="text-[#00d4ff] font-semibold hover:text-[#00bfea] hover:underline transition-colors"
        >
          Sign in
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;