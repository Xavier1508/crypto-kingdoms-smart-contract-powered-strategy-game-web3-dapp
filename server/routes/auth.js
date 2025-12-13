const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db'); // Import fungsi 'getDB'
const { ObjectId } = require('mongodb'); // mengubah string jadi _id

router.post('/register', async (req, res) => {
  try {
    // 1. Ambil data dari frontend
    const { username, email, password, walletAddress } = req.body;

    if (!username || !email || !password || !walletAddress) {
      return res.status(400).json({ msg: 'Mohon isi semua field' });
    }

    // 3. Hubungkan ke DB
    const db = getDB();
    const usersCollection = db.collection('users');
    const charactersCollection = db.collection('characters');

    // 4. Cek apakah user sudah ada (berdasarkan email ATAU username)
    const existingUser = await usersCollection.findOne({
      $or: [{ email: email }, { username: username }],
    });

    if (existingUser) {
      return res.status(400).json({ msg: 'Email atau Username sudah terdaftar' });
    }

    // 5. Enkripsi (Hash) Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 6. Siapkan dokumen user baru
    const newUserDocument = {
      username,
      email,
      password: hashedPassword,
      walletAddress,
      createdAt: new Date(),
    };

    // 7. Simpan user baru ke database
    const result = await usersCollection.insertOne(newUserDocument);
    const newUserId = result.insertedId; // Ambil _id dari user yang baru dibuat

    // 8. PENTING: Otomatis buatkan "character" untuk user baru
    // Ini adalah implementasi dari rencana kita!
    const newCharacterDocument = {
      userId: newUserId, // Link ke _id user
      level: 1,
      
      // 5 Core Resources
      food: 100,         // <-- TAMBAHKAN INI (Untuk pasukan)
      wood: 100,
      stone: 50,
      gold: 100,
      aetherShards: 0,   // <-- TAMBAHKAN INI (Resource "Gem" premium)

      troops: 10, // Pasukan default
      lastLogin: new Date(),
    };
    await charactersCollection.insertOne(newCharacterDocument);

    // 9. Buat Token (JWT) untuk auto-login
    const payload = {
      user: {
        id: newUserId,
        wallet: walletAddress,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d', // Token berlaku 7 hari
    });

    // 10. Kirim balasan sukses ke frontend
    res.status(201).json({
      token,
      msg: 'Registrasi berhasil! Karakter default telah dibuat.',
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// =========================================
// @route    POST /api/auth/login
// @desc     Login user & dapatkan token
// @access   Public
// =========================================
router.post('/login', async (req, res) => {
  try {
    // 1. Ambil data dari frontend
    const { email, password } = req.body;

    // 2. Validasi sederhana
    if (!email || !password) {
      return res.status(400).json({ msg: 'Mohon isi email dan password' });
    }

    // 3. Hubungkan ke DB
    const db = getDB();
    const usersCollection = db.collection('users');

    // 4. Cek apakah user ada (berdasarkan email)
    const user = await usersCollection.findOne({ email: email });

    if (!user) {
      // Jika email tidak ditemukan
      return res.status(400).json({ msg: 'Email atau Password salah' });
    }

    // 5. Cek Password
    // Kita bandingkan password dari frontend (plain text) 
    // dengan password di database (yang sudah di-hash)
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Jika password tidak cocok
      return res.status(400).json({ msg: 'Email atau Password salah' });
    }

    // 6. Jika berhasil: Update 'lastLogin' di 'characters' (Best Practice)
    // Ini opsional tapi bagus untuk game Anda
    try {
      const charactersCollection = db.collection('characters');
      await charactersCollection.updateOne(
        { userId: user._id }, // Cari karakter milik user ini
        { $set: { lastLogin: new Date() } } // Update waktu login terakhirnya
      );
    } catch (err) {
      console.warn("Gagal update lastLogin untuk user:", user._id, err.message);
      // Tidak perlu menghentikan login jika ini gagal, jadi kita lanjut saja
    }

    // 7. Buat Token (JWT)
    const payload = {
      user: {
        id: user._id, // _id dari collection 'users'
        wallet: user.walletAddress,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d', // Token berlaku 7 hari
    });

    // 8. Kirim balasan sukses ke frontend
    res.status(200).json({
      token,
      user: {
        id: user._id,        // <-- PENTING: Kirim ID user ke depan
        username: user.username,
        wallet: user.walletAddress
      },
      msg: 'Login berhasil!',
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;