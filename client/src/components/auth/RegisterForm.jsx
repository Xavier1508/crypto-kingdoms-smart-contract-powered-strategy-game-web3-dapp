import React, { useState } from 'react';

const RegisterForm = ({ onToggle, onRegisterSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    kingdomName: '',
    email: '',
    walletAddress: '',
    password: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
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
      setError(err.message);
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
          Wallet Address (0x...)
        </label>
        <input 
          type="text" 
          id="reg-wallet"
          name="walletAddress"
          placeholder="0x..." 
          value={formData.walletAddress}
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


// import React, { useState } from 'react';
// // import { useNavigate } from 'react-router-dom'; // Gunakan ini jika Anda pakai React Router

// const RegisterForm = ({ onToggle }) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null); // State untuk pesan error
//   const [formData, setFormData] = useState({
//     kingdomName: '', // Ini akan kita kirim sebagai 'username'
//     email: '',
//     walletAddress: '',
//     password: ''
//   });
  
//   // const navigate = useNavigate(); // Inisialisasi navigate

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError(null); // Bersihkan error sebelumnya

//     try {
//       const response = await fetch('http://localhost:5000/api/auth/register', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           username: formData.kingdomName, // Mapping kingdomName -> username
//           email: formData.email,
//           password: formData.password,
//           walletAddress: formData.walletAddress
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         // Jika server mengembalikan error (misal: "Email sudah terdaftar")
//         throw new Error(data.msg || 'Registrasi gagal');
//       }

//       // --- Registrasi Sukses ---
//       console.log('Registrasi berhasil:', data);
      
//       // 1. Simpan token ke localStorage
//       localStorage.setItem('token', data.token);
      
//       // 2. Arahkan user ke halaman game
//       // navigate('/game'); // Cara yang lebih baik jika pakai React Router
//       window.location.href = '/game'; // Cara sederhana untuk redirect

//     } catch (err) {
//       // Tangkap error (baik dari fetch atau dari server)
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   return (
//     <form className="space-y-6" onSubmit={handleRegister}>
//       {/* Input Kingdom Name */}
//       <div className="space-y-2">
//         <label htmlFor="reg-kingdom" className="block text-sm font-medium text-gray-200">
//           Kingdom Name (Username)
//         </label>
//         <input 
//           type="text" 
//           id="reg-kingdom"
//           name="kingdomName"
//           placeholder="Choose your kingdom name" 
//           value={formData.kingdomName}
//           onChange={handleChange}
//           required 
//           className="w-full px-3 py-2.5 bg-gray-700/50 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/50 transition-all"
//         />
//       </div>

//       {/* Input Email */}
//       <div className="space-y-2">
//         <label htmlFor="reg-email" className="block text-sm font-medium text-gray-200">
//           Email
//         </label>
//         <input 
//           type="email" 
//           id="reg-email"
//           name="email"
//           placeholder="commander@kingdom.eth" 
//           value={formData.email}
//           onChange={handleChange}
//           required 
//           className="w-full px-3 py-2.5 bg-gray-700/50 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/50 transition-all"
//         />
//       </div>

//       {/* --- INPUT BARU: WALLET ADDRESS --- */}
//       <div className="space-y-2">
//         <label htmlFor="reg-wallet" className="block text-sm font-medium text-gray-200">
//           Wallet Address (0x...)
//         </label>
//         <input 
//           type="text" 
//           id="reg-wallet"
//           name="walletAddress"
//           placeholder="0x..." 
//           value={formData.walletAddress}
//           onChange={handleChange}
//           required 
//           className="w-full px-3 py-2.5 bg-gray-700/50 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/50 transition-all"
//         />
//       </div>
//       {/* ---------------------------------- */}
      
//       {/* Input Password */}
//       <div className="space-y-2">
//         <label htmlFor="reg-password" className="block text-sm font-medium text-gray-200">
//           Password
//         </label>
//         <input 
//           type="password" 
//           id="reg-password"
//           name="password"
//           placeholder="Create a strong password" 
//           value={formData.password}
//           onChange={handleChange}
//           required 
//           className="w-full px-3 py-2.5 bg-gray-700/50 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/50 transition-all"
//         />
//       </div>

//       {/* Tampilkan Error jika ada */}
//       {error && (
//         <div className="text-center text-red-400 text-sm p-3 bg-red-900/30 rounded-md border border-red-500/50">
//           {error}
//         </div>
//       )}
      
//       <button 
//         type="submit" 
//         disabled={isLoading}
//         className="w-full py-3 px-4 bg-[#d4af37] text-[#1a2332] text-lg font-bold rounded-md transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//         style={{ fontFamily: 'Cinzel, serif' }}
//       >
//         {isLoading ? 'Creating Kingdom...' : 'Create Account'}
//       </button>
      
//       <p className="text-center text-sm text-gray-400">
//         Already have an account?{' '}
//         <button 
//           type="button"
//           onClick={onToggle}
//           className="text-[#00d4ff] font-semibold hover:text-[#00bfea] hover:underline transition-colors"
//         >
//           Sign in
//         </button>
//       </p>
//     </form>
//   );
// };

// export default RegisterForm;