// src/pages/TestPage.jsx

import React from 'react';

function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white p-8">
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="text-6xl font-extrabold text-blue-400 drop-shadow-lg">
          Eksplorasi Layout Tailwind
        </h1>
        <p className="mt-4 text-xl text-gray-300">
          Melihat kemampuan tata letak dan styling dengan Tailwind CSS.
        </p>
      </header>

      {/* Main Content Area - Two Columns */}
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300 ease-in-out">
          <h2 className="text-4xl font-bold text-green-400 mb-6">
            Bagian Kiri (Aksi & Informasi)
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-6">
            Ini adalah kolom pertama. Kita bisa menempatkan informasi penting atau CTA (Call to Action) di sini.
            Tailwind memungkinkan kita mengatur spasi, warna, tipografi, dan responsivitas dengan sangat mudah.
          </p>
          <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-colors duration-300">
            Klik Saya!
          </button>
          <ul className="mt-8 space-y-3 text-lg text-gray-300">
            <li className="flex items-center">
              <span className="text-green-400 mr-3 text-2xl">✔</span> Fitur Cepat
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-3 text-2xl">✨</span> Desain Responsif
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-3 text-2xl">🚀</span> Performa Tinggi
            </li>
          </ul>
        </div>

        {/* Right Column */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300 ease-in-out">
          <h2 className="text-4xl font-bold text-yellow-400 mb-6">
            Bagian Kanan (Detail & Gambar)
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-6">
            Kolom kedua ini bisa untuk detail tambahan, gambar, atau bahkan form. 
            Perhatikan bagaimana kita menggunakan `grid grid-cols-1 md:grid-cols-2` untuk responsivitas. 
            Di layar kecil, ini akan menjadi satu kolom, di layar medium ke atas, akan menjadi dua kolom.
          </p>
          {/* Example Image Placeholder */}
          <div className="bg-gray-700 h-64 w-full rounded-lg flex items-center justify-center mb-6">
            <span className="text-gray-400 text-2xl">
              Placeholder Gambar 
            </span>
          </div>
          <p className="text-sm text-gray-400">
            *Ini hanya contoh layout. Anda bisa mengisi dengan konten nyata.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>&copy; 2023 Contoh Tailwind Layout. Hak Cipta Dilindungi.</p>
      </footer>
    </div>
  );
}

export default TestPage;