# Crypto Kingdoms: The On-Chain Dominion

Welcome to Crypto Kingdoms, a prototype for a fully on-chain Real-Time Strategy (RTS) game. Inspired by classics like *Rise of Kingdoms* and collaborative phenomena like *r/place*, this project explores how every player action—from mining resources to claiming land and waging war, can be represented as a transaction within a persistent, player-owned world.

This project was built as an exploration of decentralized gameplay, where each tile of land is an NFT and all assets are tokens governed by smart contracts.

---

## Key Features

* **Fully On-Chain World:** Every land tile on the map is a unique asset, and the entire game state is managed by smart contracts on a local blockchain (Hardhat Node).
* **Simple RTS Mechanics:** Claim vacant land tiles and watch the game world take shape visually.
* **Player-Owned Economy:** A foundational framework for resources (like `$WOOD` or `$ORE`) that can be implemented as ERC-20 tokens.
* **Real-Time Visualization:** The game map is rendered with high performance using **PixiJS**, providing a smooth and interactive user experience.
* **Professional Monorepo Structure:** The backend (blockchain) and frontend (client) code is neatly organized in a single repository for streamlined development.

---

## Tech Stack

This project is divided into two main parts:

### **Blockchain (Backend)**
* **Language:** Solidity
* **Framework:** Hardhat
* **Contract Interaction:** Viem / Ethers.js
* **Local Blockchain:** Hardhat Node

### **Client (Frontend)**
* **Framework:** React (with Vite)
* **Game Rendering:** PixiJS
* **Styling:** Tailwind CSS
* **Wallet & Contract Connection:** Wagmi & RainbowKit
* **Routing:** React Router

---

## Getting Started Locally

Follow these steps to run the project on your local machine.

### **Prerequisites**
* Node.js (v18 or higher recommended)
* Git

### **1. Installation**

First, clone the repository and install all dependencies for the entire project.

```bash
# 1. Clone this repository
git clone [https://github.com/YOUR_USERNAME/crypto-kingdoms.git](https://github.com/YOUR_USERNAME/crypto-kingdoms.git)

# 2. Navigate into the project directory
cd crypto-kingdoms

# 3. Install root dependencies
npm install

# 4. Install client dependencies
cd client && npm install && cd ..

# 5. Install blockchain dependencies
cd blockchain && npm install && cd ..
```

### **2. Running the Game**

The project workflow requires **three separate terminals** running concurrently from the project's root directory (`crypto-kingdoms`).

#### **Terminal 1: Start the Local Blockchain Node**
Open your first terminal and run the local blockchain node. Leave this terminal running.
```bash
npm run start:node
```

#### **Terminal 2: Deploy the Smart Contract**
Open a second terminal. After the node in the first terminal is ready, deploy the smart contract.
```bash
npm run deploy:contract
```
*You only need to run this command again if you make changes to your Solidity code.*

#### **Terminal 3: Start the Frontend Application**
Open a third terminal and run the React client.
```bash
npm run start:client
```
Now, open your browser and navigate to `http://localhost:5173` (or the address shown in the terminal).

---

## Roadmap & Future Development

This project serves as a foundation that can be extended with the following features:

- [ ] Implement resource tokens (ERC-20).
- [ ] Staking mechanics to defend land tiles.
- [ ] Combat logic for territory conquest.
- [ ] Faction / Clan system as a DAO.
- [ ] Isometric (2.5D) map visualization.

---

## 📄 License
This project is licensed under the MIT License.


