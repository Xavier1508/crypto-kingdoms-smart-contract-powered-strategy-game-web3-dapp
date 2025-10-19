import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthSection = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="bg-[#2a3a4a]/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#d4af37]/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-[#d4af37]" />
          </div>
          <h2 
            className="text-2xl font-bold text-gray-100 mb-2" 
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Enter the Kingdom
          </h2>
          <p className="text-gray-400 text-sm">
            Join thousands of commanders on-chain
          </p>
        </div>

        {/* Tabs */}
        <div className="flex w-full mb-8 bg-gray-700/50 rounded-lg p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
              isLogin
                ? 'bg-[#d4af37] text-[#1a2332] shadow-lg'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
              !isLogin
                ? 'bg-[#d4af37] text-[#1a2332] shadow-lg'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Forms */}
        {isLogin ? (
          <LoginForm onToggle={toggleAuthMode} />
        ) : (
          <RegisterForm onToggle={toggleAuthMode} />
        )}
      </div>
    </div>
  );
};

export default AuthSection;