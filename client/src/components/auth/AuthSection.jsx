import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const SuccessModal = ({ onClose }) => {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown <= 0) {
      onClose();
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prevCount) => prevCount - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-gray-800 p-8 shadow-2xl border border-gray-700 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
          Registration Successful!
        </h3>
        
        <p className="text-gray-300 mb-6">
          Your kingdom has been created. Please proceed to the login page to enter.
        </p>

        <p className="text-sm text-gray-400 mb-4">
          Redirecting in {countdown} seconds...
        </p>

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 bg-[#d4af37] text-[#1a2332] text-md font-bold rounded-md transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          style={{ fontFamily: 'Cinzel, serif' }}
        >
          Go to Login Now
        </button>
      </div>
    </div>
  );
};


const AuthSection = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  const handleRegisterSuccess = () => {
    setShowSuccessModal(true);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setIsLogin(true);
  };

  return (
    <div className="w-full max-w-md animate-fade-in relative">
      {/* Modal Sukses */}
      {showSuccessModal && <SuccessModal onClose={closeSuccessModal} />}

      <div className="bg-[#2a3a4a]/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#d4af37]/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-[#d4af37]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-100 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
            Enter the Kingdom
          </h2>
          <p className="text-gray-400 text-sm">
            Join thousands of commanders on-chain
          </p>
        </div>

        {/* Tombol Tab Login/Register */}
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

        {/* Tampilkan Form Sesuai Tab */}
        {isLogin ? (
          <LoginForm onToggle={toggleAuthMode} />
        ) : (
          <RegisterForm 
            onToggle={toggleAuthMode} 
            onRegisterSuccess={handleRegisterSuccess} 
          />
        )}
      </div>
    </div>
  );
};

export default AuthSection;