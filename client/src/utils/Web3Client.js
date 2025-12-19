// client/src/utils/Web3Client.js
import { ethers } from 'ethers';
import GameMapABI from '../contracts/GameMap.sol/GameMap.json'; 

// CONTRACT ADDRESS BARU Dari Sepolia
const CONTRACT_ADDRESS = "0xbA1607e5Ae846b46A328a946f11fCfDc58A99e85"; 

// ID Network Sepolia
const SEPOLIA_CHAIN_ID = "0xaa36a7"; 

export const getEthereumContract = async () => {
  const { ethereum } = window;
  if (!ethereum) throw new Error("MetaMask not found! Please install MetaMask extension.");

  const currentChainId = await ethereum.request({ method: 'eth_chainId' });
  
  if (currentChainId !== SEPOLIA_CHAIN_ID) {
    try {
      console.log("Switching network to Sepolia...");
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia Test Network',
                rpcUrls: ['https://sepolia.drpc.org'],
                nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch {
          throw new Error("Failed to add Sepolia network.");
        }
      } else {
        throw new Error("Please switch your MetaMask network to Sepolia manually.");
      }
    }
  }

  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  const abi = GameMapABI.abi ? GameMapABI.abi : GameMapABI;
  const gameContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

  return gameContract;
};

export const mintKingdomNFT = async (username, x, y, worldId, seasonName) => {
  try {
    const contract = await getEthereumContract();
    
    console.log(`🦊 Minting: ${username} at [${x},${y}] | World: ${worldId}`);
    
    // 1. PANGGIL FUNGSI KONTRAK BARU
    const tx = await contract.mintKingdom(username, x, y, worldId, seasonName);
    
    console.log("Tx Sent! Waiting confirmation...", tx.hash);
    
    // 2. TUNGGU KONFIRMASI BLOCKCHAIN
    const receipt = await tx.wait();
    
    console.log("Tx Confirmed!", receipt);

    let mintedId = null;
    
    // Cari event "KingdomMinted" di dalam logs
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog && parsedLog.name === 'KingdomMinted') {
          mintedId = parsedLog.args[1].toString(); 
          console.log("MINTED TOKEN ID:", mintedId);
          break;
        }
      } catch (e) {
        console.log("Log parse skip...", e);
      }
    }

    return { 
      success: true, 
      hash: tx.hash, 
      receipt: receipt, 
      tokenId: mintedId
    };

  } catch (error) {
    console.error("Minting Failed:", error);
    let errorMessage = error.message;
    if (error.reason) errorMessage = error.reason;
    if (error.code === 'ACTION_REJECTED') errorMessage = "User rejected transaction.";
    return { success: false, error: errorMessage };
  }
};