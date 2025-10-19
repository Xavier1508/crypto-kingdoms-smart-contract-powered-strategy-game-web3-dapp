const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db; // Variabel untuk menyimpan koneksi database

// Fungsi untuk menghubungkan ke DB
async function connectDB() {
  if (db) return db; // Jika sudah terkoneksi, kembalikan koneksi yang ada

  try {
    await client.connect();
    db = client.db("crypto_kingdom_db"); // Ganti "CryptoKingdomsDB" dengan nama database Anda
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    return db;
  } catch (err) {
    console.error("Gagal terhubung ke MongoDB", err);
    process.exit(1); // Keluar dari aplikasi jika gagal konek
  }
}

// Fungsi untuk mendapatkan koneksi DB yang sudah ada
function getDB() {
  if (!db) {
    throw new Error("Database not initialized!");
  }
  return db;
}

module.exports = { connectDB, getDB };