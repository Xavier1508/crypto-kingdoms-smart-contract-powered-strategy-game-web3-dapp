import React, { useState } from 'react';

const RegisterForm = ({ onToggle }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    kingdomName: '',
    email: '',
    password: ''
  });

  const handleRegister = (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Registering...', formData);
    // TODO: Tambahkan logika registrasi
    setTimeout(() => setIsLoading(false), 1500);
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
          Kingdom Name
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