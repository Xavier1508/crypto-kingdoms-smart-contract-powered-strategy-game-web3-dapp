// client/src/utils/Web3Client.js
import { ethers } from 'ethers';
import GameMapABI from '../contracts/GameMap.sol/GameMap.json';

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const getEthereumContract = async () => {
  const { ethereum } = window;
  if (!ethereum) throw new Error("MetaMask not found!");

  // 1. Connect ke Provider (MetaMask)
  const provider = new ethers.BrowserProvider(ethereum);
  
  // 2. Dapatkan Signer (User yang sedang login & mau bayar gas)
  const signer = await provider.getSigner();
  
  // 3. Buat Instance Kontrak
  // Kita ambil 'abi' dari file JSON. Kadang strukturnya langsung array, kadang ada di properti .abi
  const abi = GameMapABI.abi ? GameMapABI.abi : GameMapABI;
  
  const gameContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

  return gameContract;
};

// --- FUNGSI MINTING KINGDOM ---
export const mintKingdomNFT = async (username, x, y) => {
  try {
    const contract = await getEthereumContract();
    
    console.log(`🦊 MetaMask: Minting Kingdom for ${username} at (${x}, ${y})...`);
    
    // Panggil fungsi di Smart Contract: mintKingdom(string, int, int)
    const tx = await contract.mintKingdom(username, x, y);
    
    console.log("⏳ Transaction sent! Waiting for confirmation...", tx.hash);
    
    // Tunggu sampai transaksi selesai (1 block confirmation)
    await tx.wait();
    
    console.log("✅ Mint Success! Transaction Hash:", tx.hash);
    return { success: true, hash: tx.hash };

  } catch (error) {
    console.error("Minting Failed:", error);
    // Cek error spesifik (misal: "One wallet, one kingdom!")
    if (error.reason) return { success: false, error: error.reason };
    return { success: false, error: error.message };
  }
};