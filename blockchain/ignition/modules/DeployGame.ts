import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const GameMapModule = buildModule("GameMapModule", (m) => {
  const gameMap = m.contract("GameMap", []);

  return { gameMap };
});

export default GameMapModule;