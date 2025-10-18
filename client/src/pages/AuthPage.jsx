// src/pages/AuthPage.jsx

import React, { useState } from 'react';

// Komponen Form Login
const LoginForm = ({ onToggle }) => {
  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Logging in...');
  };

  return (
    <form className="w-full max-w-md p-10" onSubmit={handleLogin}>
      <h2 className="text-3xl font-bold text-center text-brand-gold mb-8">
        Masuk ke Kerajaan
      </h2>
      
      <div className="mb-5">
        <label htmlFor="login-email" className="block mb-2 font-semibold text-brand-text-secondary">
          Email
        </label>
        <input 
          type="email" 
          id="login-email" 
          placeholder="email@kerajaan.com" 
          required 
          className="w-full p-3 bg-brand-dark border border-brand-border rounded-md text-brand-text focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/50"
        />
      </div>
      
      <div className="mb-5">
        <label htmlFor="login-password" className="block mb-2 font-semibold text-brand-text-secondary">
          Password
        </label>
        <input 
          type="password" 
          id="login-password" 
          placeholder="********" 
          required 
          className="w-full p-3 bg-brand-dark border border-brand-border rounded-md text-brand-text focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/50"
        />
      </div>
      
      <button 
        type="submit" 
        className="w-full p-4 border-none rounded-md bg-brand-gold text-brand-dark text-lg font-bold cursor-pointer transition-all duration-300 ease-in-out hover:bg-brand-gold-hover hover:shadow-[0_0_15px_rgba(212,175,55,0.5)] hover:-translate-y-0.5 mt-3"
      >
        Masuk
      </button>
      
      <p className="text-center mt-6 text-brand-text-secondary">
        Belum punya akun? <span onClick={onToggle} className="text-brand-blue font-semibold cursor-pointer hover:underline">
          Daftar di sini
        </span>
      </p>
    </form>
  );
};

// Komponen Form Registrasi
const RegisterForm = ({ onToggle }) => {
  const handleRegister = (e) => {
    e.preventDefault();
    console.log('Registering...');
  };

  return (
    <form className="w-full max-w-md p-10" onSubmit={handleRegister}>
      <h2 className="text-3xl font-bold text-center text-brand-gold mb-8">
        Daftar Akun Baru
      </h2>

      <div className="mb-5">
        <label htmlFor="reg-username" className="block mb-2 font-semibold text-brand-text-secondary">
          Nama Kerajaan (Username)
        </label>
        <input 
          type="text" 
          id="reg-username" 
          placeholder="Kerajaan Terkuat" 
          required 
          className="w-full p-3 bg-brand-dark border border-brand-border rounded-md text-brand-text focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/50"
        />
      </div>

      <div className="mb-5">
        <label htmlFor="reg-email" className="block mb-2 font-semibold text-brand-text-secondary">
          Email
        </label>
        <input 
          type="email" 
          id="reg-email" 
          placeholder="email@kerajaan.com" 
          required 
          className="w-full p-3 bg-brand-dark border border-brand-border rounded-md text-brand-text focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/50"
        />
      </div>
      
      <div className="mb-5">
        <label htmlFor="reg-password" className="block mb-2 font-semibold text-brand-text-secondary">
          Password
        </label>
        <input 
          type="password" 
          id="reg-password" 
          placeholder="********" 
          required 
          className="w-full p-3 bg-brand-dark border border-brand-border rounded-md text-brand-text focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/50"
        />
      </div>
      
      <button 
        type="submit" 
        className="w-full p-4 border-none rounded-md bg-brand-gold text-brand-dark text-lg font-bold cursor-pointer transition-all duration-300 ease-in-out hover:bg-brand-gold-hover hover:shadow-[0_0_15px_rgba(212,175,55,0.5)] hover:-translate-y-0.5 mt-3"
      >
        Buat Akun
      </button>
      
      <p className="text-center mt-6 text-brand-text-secondary">
        Sudah punya akun? <span onClick={onToggle} className="text-brand-blue font-semibold cursor-pointer hover:underline">
          Masuk di sini
        </span>
      </p>
    </form>
  );
};


// Komponen Halaman Utama
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="flex md:flex-row flex-col min-h-screen w-full bg-gradient-to-br from-brand-med to-brand-dark text-brand-text">
      
      {/* Bagian Kiri (Hero) */}
      <div className="flex-1 flex flex-col justify-center items-center p-10 text-center">
        {/* Nanti Anda bisa ganti div ini dengan gambar kastil atau pertempuran */}
        <div className="w-4/5 h-72 border-2 border-dashed border-brand-border bg-white/5 flex justify-center items-center rounded-xl mb-8 text-lg text-brand-text-secondary">
          <p>Tempat Gambar Hero Keren Anda</p>
        </div>
        <h1 className="text-5xl font-bold text-brand-gold mb-3 [text-shadow:2px_2px_8px_rgba(0,0,0,0.5)]">
          Crypto Kingdoms
        </h1>
        <p className="text-xl text-brand-text">
          Bangun, Bertempur, Taklukkan. Sepenuhnya On-Chain.
        </p>
      </div>

      {/* Bagian Kanan (Form) */}
      <div className="flex-1 flex justify-center items-center bg-brand-form shadow-[-10px_0px_30px_rgba(0,0,0,0.4)] md:min-h-screen py-10 md:py-0">
        {isLogin ? (
          <LoginForm onToggle={toggleAuthMode} />
        ) : (
          <RegisterForm onToggle={toggleAuthMode} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;