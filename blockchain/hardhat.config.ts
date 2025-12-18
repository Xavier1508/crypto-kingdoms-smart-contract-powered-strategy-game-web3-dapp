import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition-ethers";
import "dotenv/config"; 
import "@nomicfoundation/hardhat-verify";
import * as tdly from "@tenderly/hardhat-tenderly";

// --- DEFINISI VARIABEL (DENGAN FALLBACK AGAR TIDAK ERROR TYPESCRIPT) ---
const ALCHEMY_SEPOLIA_URL = process.env.ALCHEMY_SEPOLIA_URL || "";
const TENDERLY_RPC_URL = process.env.TENDERLY_RPC_URL || "";
const DEV_PRIVATE_KEY = process.env.DEV_PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28", // Sesuaikan dengan versi di GameMap.sol (biasanya 0.8.20 atau 0.8.28)
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // 1. Localhost
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    
    // 2. Sepolia Testnet (UTAMA UNTUK OPENSEA)
    sepolia: {
      url: ALCHEMY_SEPOLIA_URL,
      accounts: DEV_PRIVATE_KEY ? [DEV_PRIVATE_KEY] : [],
      chainId: 11155111,
    },

    // 3. Tenderly (KONFIGURASI LAMA ANDA)
    tenderlyDev: {
      url: TENDERLY_RPC_URL,
      chainId: 31335,
      accounts: DEV_PRIVATE_KEY ? [DEV_PRIVATE_KEY] : [],
    },
  },
  
  // Konfigurasi Etherscan
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  
  // Konfigurasi Tenderly Project
  tenderly: {
    username: "Xavier1508",
    project: "project",
    privateVerification: false,
  },
};

export default config;