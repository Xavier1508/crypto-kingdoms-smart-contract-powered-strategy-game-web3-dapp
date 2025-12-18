// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract GameMap is ERC721URIStorage {
    uint256 private _tokenIds;

    struct Kingdom {
        string username;
        int256 x;
        int256 y;
        uint256 power;
    }

    mapping(uint256 => Kingdom) public kingdoms;
    mapping(address => bool) public hasKingdom;

    event KingdomMinted(address indexed owner, uint256 tokenId, int256 x, int256 y);

    constructor() ERC721("CryptoKingdoms", "CKREALM") {}

    function mintKingdom(
        string memory _username,
        int256 _x,
        int256 _y,
        string memory _tokenURI // [BARU] Menerima URL Metadata
    ) public returns (uint256) {
        require(!hasKingdom[msg.sender], "One wallet, one kingdom!");

        _tokenIds++;
        uint256 newItemId = _tokenIds;

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, _tokenURI); // [BARU] Simpan URL di Blockchain

        kingdoms[newItemId] = Kingdom(_username, _x, _y, 1000);
        hasKingdom[msg.sender] = true;

        emit KingdomMinted(msg.sender, newItemId, _x, _y);

        return newItemId;
    }

    // Fungsi untuk mengubah Power (Hanya owner/server yang harusnya bisa, simplified here)
    function updatePower(uint256 _tokenId, uint256 _newPower) public {
        // require(ownerOf(_tokenId) == msg.sender, "Not your kingdom");
        kingdoms[_tokenId].power = _newPower;
    }
}