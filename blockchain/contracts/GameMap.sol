// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract GameMap {
    struct Tile {
        address owner;
        uint8 tileType; // 0 = Plain, 1 = Mountain, 2 = Mine
    }

    // Mapping koordinat (x, y) ke data petak
    mapping(uint256 => mapping(uint256 => Tile)) public tiles;

    // Event untuk memberitahu frontend saat petak diklaim
    event TileClaimed(uint256 x, uint256 y, address newOwner);

    function claimTile(uint256 x, uint256 y) public {
        // Cek apakah petak sudah dimiliki
        require(tiles[x][y].owner == address(0), "Tile is already owned");

        // Set pemilik baru
        tiles[x][y].owner = msg.sender;

        // Kirim event
        emit TileClaimed(x, y, msg.sender);
    }
}