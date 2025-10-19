Crypto Kingdoms: The On-Chain Dominion

Welcome to Crypto Kingdoms, a prototype for a Real-Time Strategy (RTS) game with a hybrid architecture. Inspired by classics like Rise of Kingdoms, this project explores a hybrid model where:

Real-Time Actions (Off-Chain): All frequent actions (resource regeneration, player stats, chat, level progression) are handled by a fast Node.js backend and a MongoDB database.

Asset Ownership (On-Chain): The ownership of core, high-value assets (like Land Plots) is permanently secured as NFTs on the blockchain.

This project is an exploration of a sustainable "Play-to-Own" gameplay model, where players use the off-chain resources they gather to mint valuable on-chain assets.

Key Features

Hybrid Architecture

Combines a Node.js/Express/MongoDB backend for real-time game state (resources, levels, troops) with a Hardhat blockchain for NFT asset ownership (Land Plots).

Player-Owned Economy (The "Crypto Loop")

Players gather off-chain resources (Food, Wood, Gold, etc.) to build their kingdom, which in turn allows them to mint the lands they conquer as on-chain NFTs.

Full Authentication System

Complete user registration and login with password hashing (bcrypt) and JSON Web Tokens (JWT) managed by the backend server.

Rich UI Dashboard

A post-login HomePage (Lobby) built with React, displaying player vitals, 5 core resources, and a social hub (Chat, Alliance, Logs).

Real-Time Map Visualization

An interactive game map, currently in development, rendered with high performance using PixiJS.

Professional Monorepo Structure

Cleanly organized into three distinct parts: blockchain (Smart Contracts), server (Backend API), and client (React Frontend).

Tech Stack

The project is divided into three main parts:

1. Blockchain (Smart Contracts)

Language: Solidity

Framework: Hardhat

Contract Interaction: Viem / Ethers.js

Local Blockchain: Hardhat Node

2. Server (Backend API)

Runtime: Node.js

Framework: Express

Database: MongoDB (with Mongoose/MongoDB Driver)

Authentication: JSON Web Tokens (JWT), bcryptjs

Middleware: CORS

3. Client (Frontend)

Framework: React (with Vite)

Game Rendering: PixiJS

Styling: Tailwind CSS (v4)

Wallet & Contracts: Wagmi & RainbowKit

Routing: React Router

Icons: Lucide React

Getting Started Locally

Follow these steps to run the full project on your local machine.

Prerequisites

Node.js (v18 or higher)

Git

A MongoDB connection (Local or Atlas)

1. Installation

First, clone the repository and install all dependencies for each part of the project.

# 1. Clone this repository
git clone [https://github.com/Xavier1508/Crypto-Kingdoms-The-On-Chain-Dominion.git](https://github.com/Xavier1508/Crypto-Kingdoms-The-On-Chain-Dominion.git)
cd Crypto-Kingdoms-The-On-Chain-Dominion

# 2. Install root dependencies
npm install

# 3. Install Blockchain dependencies
cd blockchain && npm install && cd ..

# 4. Install Server API dependencies
cd server && npm install && cd ..

# 5. Install Client (Frontend) dependencies
cd client && npm install && cd ..


2. Environment Configuration (.env)

You need to create a .env file inside the /server folder to handle your database connection and JWT secret.

File: /server/.env

MONGO_URI="your_mongodb_atlas_connection_string"
JWT_SECRET="YOUR_VERY_STRONG_AND_SECRET_KEY"


3. Running the Project (4 Terminals Required)

This project requires four separate terminals running concurrently. Run all commands from the project's root directory (Crypto-Kingdoms-The-On-Chain-Dominion).

NOTE: You may want to add a start:server script to your root package.json for consistency:

"start:server": "cd server && npm run dev",


Terminal 1: Start the Blockchain Node

Open your first terminal and run the local Hardhat node. Leave this running.

npm run start:node


Terminal 2: Deploy the Smart Contract

Open a second terminal. After the node in Terminal 1 is ready, deploy your contracts.

npm run deploy:contract


(You only need to run this again if you change your Solidity code).

Terminal 3: Start the Backend API Server

Open a third terminal and run the Express (Node.js) server. This server connects to MongoDB.

npm run start:server


(If you didn't add the script above, run cd server && npm run dev)

Terminal 4: Start the Frontend Application

Open a fourth terminal and run the React client.

npm run start:client


Now, open your browser and navigate to http://localhost:5173 (or the address shown in Terminal 4).

📄 License

This project is licensed under the MIT License.