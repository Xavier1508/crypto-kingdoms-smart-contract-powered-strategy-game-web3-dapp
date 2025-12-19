import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const GameMapModule = buildModule("GameMapModule", (m) => {
  const initialBaseURI = "https://crypto-kingdoms-backend-api.vercel.app/api/users/metadata/";
  const gameMap = m.contract("GameMap", [initialBaseURI]);
  return { gameMap };
});

export default GameMapModule;