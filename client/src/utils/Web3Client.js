// client/src/utils/Web3Client.js
import { ethers } from 'ethers';

// Pastikan path ini sesuai dengan lokasi file JSON ABI di folder project Anda
// Jika error "Module not found", cek apakah file json ada di folder contracts/GameMap.sol/
import GameMapABI from '../contractABI/GameMap.json'; 

// ALAMAT KONTRAK RESMI DARI DEPLOYMENT ANDA (SEPOLIA)
const CONTRACT_ADDRESS = "0x4e4161C652D57668add1c3E8Ef62b678548235Bd"; //

// ID Network Sepolia (Hexadecimal untuk 11155111)
const SEPOLIA_CHAIN_ID = "0xaa36a7"; 

/**
 * Fungsi Utama: Mengambil Instance Kontrak
 * Otomatis memaksa user pindah ke Network Sepolia jika salah network.
 */
export const getEthereumContract = async () => {
  const { ethereum } = window;
  if (!ethereum) throw new Error("MetaMask not found! Please install MetaMask extension.");

  // --- [LOGIKA BARU] PAKSA PINDAH KE SEPOLIA ---
  // Ini solusi agar MetaMask tidak nyangkut di "Hardhat Localhost" dan minta GO Token.
  const currentChainId = await ethereum.request({ method: 'eth_chainId' });
  
  if (currentChainId !== SEPOLIA_CHAIN_ID) {
    try {
      console.log("🔄 Switching network to Sepolia...");
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError) {
      // Error 4902 artinya Network Sepolia belum ada di daftar MetaMask user
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia Test Network',
                rpcUrls: ['https://sepolia.drpc.org'], // RPC Publik yang stabil
                nativeCurrency: {
                  name: 'SepoliaETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addError) {
          console.error("Gagal menambahkan Sepolia:", addError);
          throw new Error("Failed to add Sepolia network to MetaMask.");
        }
      } else {
        console.error("Gagal ganti network:", switchError);
        throw new Error("Please switch your MetaMask network to Sepolia manually.");
      }
    }
  }

  // --- KONEKSI STANDAR ETHERS V6 ---
  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  
  // Ambil ABI dengan aman (kadang formatnya Array langsung, kadang Object .abi)
  const abi = GameMapABI.abi ? GameMapABI.abi : GameMapABI;
  
  const gameContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

  return gameContract;
};

// --- FUNGSI MINTING KINGDOM (Dipanggil oleh Frontend) ---
export const mintKingdomNFT = async (username, x, y, tokenURI) => {
  try {
    const contract = await getEthereumContract();
    
    console.log(`🦊 MetaMask: Minting Kingdom '${username}' at [${x},${y}]`);
    console.log(`🔗 Token URI: ${tokenURI}`);
    
    // Panggil fungsi Smart Contract "mintKingdom"
    // Tidak perlu kirim value (ETH) kecuali kontrak Anda payable dan mewajibkan bayar
    // Gas fee akan dihitung otomatis oleh MetaMask
    const tx = await contract.mintKingdom(username, x, y, tokenURI);
    
    console.log("⏳ Transaction sent! Waiting confirmation...", tx.hash);
    
    // Tunggu transaksi selesai di-mine di blockchain
    const receipt = await tx.wait();
    
    console.log("✅ Transaction Confirmed!", receipt);
    
    return { success: true, hash: tx.hash, receipt: receipt };

  } catch (error) {
    console.error("❌ Minting Failed:", error);
    
    // Return pesan error yang jelas ke User
    let errorMessage = error.message;
    if (error.reason) errorMessage = error.reason; // Error dari Smart Contract
    if (error.code === 'ACTION_REJECTED') errorMessage = "User rejected transaction in MetaMask.";

    return { success: false, error: errorMessage };
  }
};