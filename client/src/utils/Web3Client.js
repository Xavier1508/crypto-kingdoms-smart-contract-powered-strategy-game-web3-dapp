// client/src/utils/Web3Client.js
import { ethers } from 'ethers';
import GameMapABI from '../contracts/GameMap.sol/GameMap.json';

const CONTRACT_ADDRESS = "0x4e4161C652D57668add1c3E8Ef62b678548235Bd";

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
export const mintKingdomNFT = async (username, x, y, tokenURI) => {
  try {
    const contract = await getEthereumContract();
    
    console.log(`🦊 MetaMask: Minting with URI: ${tokenURI}`);
    
    // Panggil fungsi Smart Contract yang BARU (4 parameter)
    const tx = await contract.mintKingdom(username, x, y, tokenURI);
    
    console.log("⏳ Waiting confirmation...", tx.hash);
    
    // Tunggu receipt untuk mendapatkan Token ID
    const receipt = await tx.wait();
    
    // Cara mengambil Token ID dari Event Log (sedikit tricky di Ethers v6)
    // Untuk simplifikasi, kita anggap sukses dulu. 
    // Di real-world, kita parse receipt.logs untuk dapat tokenId.
    // Tapi karena ini local & demo, kita bisa fetch counter atau tebak (increment).
    // NAMUN, yang paling aman untuk demo: Return hashnya.
    
    return { success: true, hash: tx.hash, receipt: receipt };

  } catch (error) {
    console.error("Minting Failed:", error);
    if (error.reason) return { success: false, error: error.reason };
    return { success: false, error: error.message };
  }
};