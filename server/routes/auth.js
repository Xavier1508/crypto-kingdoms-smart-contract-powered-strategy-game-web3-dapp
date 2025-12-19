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
      food: 100,
      wood: 100,
      stone: 50,
      gold: 100,
      aetherShards: 0,

      troops: 10,
      lastLogin: new Date(),
    };
    await charactersCollection.insertOne(newCharacterDocument);

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

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: 'Mohon isi email dan password' });
    }

    const db = getDB();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ msg: 'Email atau Password salah' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Email atau Password salah' });
    }

    try {
      const charactersCollection = db.collection('characters');
      await charactersCollection.updateOne(
        { userId: user._id }, // Cari karakter milik user ini
        { $set: { lastLogin: new Date() } } // Update waktu login terakhirnya
      );
    } catch (err) {
      console.warn("Gagal update lastLogin untuk user:", user._id, err.message);
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