// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameMap is ERC721, Ownable {
    uint256 private _tokenIds;
    string private _baseTokenURI;

    struct KingdomData {
        string username;
        int256 x;
        int256 y;
        uint256 worldId;
        string seasonName;
        uint256 rankTier;
        string title;
        uint256 power;
    }

    mapping(uint256 => KingdomData) public kingdomDetails;
    
    mapping(address => mapping(uint256 => bool)) public walletJoinedWorld;

    event KingdomMinted(address indexed owner, uint256 tokenId, uint256 worldId, string username);
    event TitleUpdated(uint256 tokenId, string newTitle, uint256 newTier);
    event BaseURIUpdated(string newURI);

    constructor(string memory initialBaseURI) ERC721("CryptoKingdoms", "CKREALM") Ownable(msg.sender) {
        _baseTokenURI = initialBaseURI;
    }

    // buat minting
    function mintKingdom(
        string memory _username,
        int256 _x,
        int256 _y,
        uint256 _worldId,
        string memory _seasonName
    ) public returns (uint256) {
        require(!walletJoinedWorld[msg.sender][_worldId], "You already have a Kingdom in this specific World!");

        _tokenIds++;
        uint256 newItemId = _tokenIds;

        _mint(msg.sender, newItemId);

        kingdomDetails[newItemId] = KingdomData({
            username: _username,
            x: _x,
            y: _y,
            worldId: _worldId,
            seasonName: _seasonName,
            rankTier: 0,
            title: "Novice Commander",
            power: 1000
        });

        walletJoinedWorld[msg.sender][_worldId] = true;

        emit KingdomMinted(msg.sender, newItemId, _worldId, _username);
        return newItemId;
    }

    // ADMIN / SERVER (untuk update achivment)
    function updateAchievement(
        uint256 _tokenId, 
        uint256 _newTier, 
        string memory _newTitle, 
        uint256 _currentPower
    ) public onlyOwner {
        KingdomData storage k = kingdomDetails[_tokenId];
        
        k.rankTier = _newTier;
        k.title = _newTitle;
        k.power = _currentPower;

        emit TitleUpdated(_tokenId, _newTitle, _newTier);
    }

    // buat URI
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    // Admin bisa ganti URL Backend jika pindah server/domain
    function setBaseURI(string memory newBaseURI) public onlyOwner {
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    function getKingdomData(uint256 tokenId) public view returns (KingdomData memory) {
        return kingdomDetails[tokenId];
    }
}