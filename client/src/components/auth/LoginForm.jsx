import React, { useState } from 'react';

const LoginForm = ({ onToggle }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Logging in...', formData);
    // TODO: Tambahkan logika login (misal: konek wallet / panggil API)
    setTimeout(() => setIsLoading(false), 1500);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleLogin}>
      <div className="space-y-2">
        <label htmlFor="login-email" className="block text-sm font-medium text-gray-200">
          Email
        </label>
        <input 
          type="email" 
          id="login-email"
          name="email"
          placeholder="commander@kingdom.eth" 
          value={formData.email}
          onChange={handleChange}
          required 
          className="w-full px-3 py-2.5 bg-gray-700/50 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/50 transition-all"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="login-password" className="block text-sm font-medium text-gray-200">
          Password
        </label>
        <input 
          type="password" 
          id="login-password"
          name="password"
          placeholder="Enter your password" 
          value={formData.password}
          onChange={handleChange}
          required 
          className="w-full px-3 py-2.5 bg-gray-700/50 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/50 transition-all"
        />
      </div>
      
      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full py-3 px-4 bg-[#d4af37] text-[#1a2332] text-lg font-bold rounded-md transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        style={{ fontFamily: 'Cinzel, serif' }}
      >
        {isLoading ? 'Entering Kingdom...' : 'Login'}
      </button>
      
      <div className="text-center">
        <button 
          type="button"
          className="text-sm text-[#00d4ff] hover:text-[#00bfea] font-medium hover:underline transition-colors"
        >
          Forgot password?
        </button>
      </div>
    </form>
  );
};

export default LoginForm;