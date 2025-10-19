require('dotenv').config(); // Muat .env paling pertama
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db'); // Import fungsi koneksi DB kita

// 1. Hubungkan ke Database
connectDB();

// 2. Inisialisasi Aplikasi Express
const app = express();

// 3. Setup Middleware
app.use(cors()); // Izinkan request dari frontend (React)
app.use(express.json()); // Izinkan server menerima data JSON (req.body)

// 4. Rute (Routes)
// Rute tes sederhana
app.get('/', (req, res) => {
  res.send('API Crypto Kingdoms sedang berjalan!');
});

// Import dan gunakan Rute untuk Autentikasi (Register/Login)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes); // Semua rute di auth.js akan diawali /api/auth

// 5. Jalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));