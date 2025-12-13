// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract GameMap {
    struct Tile {
        address owner;
        uint8 tileType; // 0 = Plain, 1 = Mountain, 2 = Mine
    }

    // Mapping: World ID => Koordinat X => Koordinat Y => Data Petak
    // Ini memungkinkan kita punya ribuan "Dunia" di dalam satu kontrak
    mapping(uint256 => mapping(uint256 => mapping(uint256 => Tile))) public worldTiles;

    // Event: Sekarang menyertakan worldId
    event TileClaimed(uint256 indexed worldId, uint256 x, uint256 y, address newOwner);

    function claimTile(uint256 worldId, uint256 x, uint256 y) public {
        // Cek apakah petak di dunia tersebut sudah dimiliki
        require(worldTiles[worldId][x][y].owner == address(0), "Tile is already owned");
        
        worldTiles[worldId][x][y].owner = msg.sender;
        
        emit TileClaimed(worldId, x, y, msg.sender);
    }

    function getTileOwner(uint256 worldId, uint256 x, uint256 y) public view returns (address) {
        return worldTiles[worldId][x][y].owner;
    }
}