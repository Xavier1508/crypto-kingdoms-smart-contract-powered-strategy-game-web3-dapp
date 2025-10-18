// blockchain/hardhat.config.ts

import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition-ethers";
import "dotenv/config";
import "@nomicfoundation/hardhat-verify";
import * as tdly from "@tenderly/hardhat-tenderly";


const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    
    tenderlyDev: {
      url: process.env.TENDERLY_RPC_URL || "",
      chainId: 31335,
      accounts: process.env.DEV_PRIVATE_KEY ? [process.env.DEV_PRIVATE_KEY] : [],
    },

    sepolia: {
      url: "https://eth-sepolia.public.blastapi.io",
      accounts: process.env.DEV_PRIVATE_KEY ? [process.env.DEV_PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  tenderly: {
    username: "Xavier1508",
    project: "project",
    privateVerification: false,
  },
  etherscan: {
    apiKey: {
      tenderlyDev: "TENDERLY_DUMMY_KEY",
    },
    customChains: [
      {
        network: "tenderlyDev",
        chainId: 31335,
        urls: {
          apiURL: `${process.env.TENDERLY_RPC_URL}/verify/etherscan`,
          browserURL: process.env.TENDERLY_RPC_URL || ""
        }
      }
    ]
  },
};

export default config;