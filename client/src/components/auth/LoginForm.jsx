import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ onToggle }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Login gagal');

      localStorage.setItem('token', data.token);
      
      navigate('/game');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

// import React, { useState } from 'react';

// // import { useNavigate } from 'react-router-dom';

// const LoginForm = ({ onToggle }) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null); // State untuk pesan error
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
  
//   // const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError(null);

//     try {
//       const response = await fetch('http://localhost:5000/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData), // formData sudah pas (email, password)
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         // Jika server mengembalikan error (misal: "Email atau Password salah")
//         throw new Error(data.msg || 'Login gagal');
//       }

//       // --- Login Sukses ---
//       console.log('Login berhasil:', data);
      
//       // 1. Simpan token ke localStorage
//       localStorage.setItem('token', data.token);
      
//       // 2. Arahkan user ke halaman game
//       // navigate('/game');
//       window.location.href = '/game'; // Cara sederhana untuk redirect

//     } catch (err) {
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
//     <form className="space-y-6" onSubmit={handleLogin}>
//       <div className="space-y-2">
//         <label htmlFor="login-email" className="block text-sm font-medium text-gray-200">
//           Email
//         </label>
//         <input 
//           type="email" 
//           id="login-email"
//           name="email"
//           placeholder="commander@kingdom.eth" 
//           value={formData.email}
//           onChange={handleChange}
//           required 
//           className="w-full px-3 py-2.5 bg-gray-700/50 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/50 transition-all"
//         />
//       </div>
      
//       <div className="space-y-2">
//         <label htmlFor="login-password" className="block text-sm font-medium text-gray-200">
//           Password
//         </label>
//         <input 
//           type="password" 
//           id="login-password"
//           name="password"
//           placeholder="Enter your password" 
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
//         {isLoading ? 'Entering Kingdom...' : 'Login'}
//       </button>
      
//       <div className="text-center">
//         <button 
//           type="button"
//           className="text-sm text-[#00d4ff] hover:text-[#00bfea] font-medium hover:underline transition-colors"
//         >
//           Forgot password?
//         </button>
//       </div>
//     </form>
//   );
// };

// export default LoginForm;

