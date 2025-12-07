// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title TavernCharacters
/// @notice ERC721 contract representing portable TTRPG characters.
/// Each token is a "character passport" whose metadata URI points to off-chain JSON.
contract TavernCharacters is ERC721, Ownable {
    uint256 public nextTokenId;
    mapping(uint256 => string) private _tokenURIs;

    event CharacterMinted(uint256 indexed tokenId, address indexed to, string tokenURI);

    constructor() ERC721("Tavern Character", "TAVERNCHAR") Ownable(msg.sender) {}

    /// @notice Mint a new character NFT to `to` with metadata `tokenURI_`.
    /// @dev Restricted to owner (backend minter) for v1.
    function mintCharacter(address to, string calldata tokenURI_) external onlyOwner returns (uint256) {
        require(to != address(0), "Invalid recipient");

        uint256 tokenId = ++nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        emit CharacterMinted(tokenId, to, tokenURI_);
        return tokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }

    function _setTokenURI(uint256 tokenId, string memory tokenURI_) internal {
        _requireOwned(tokenId);
        _tokenURIs[tokenId] = tokenURI_;
    }

    /// @notice Optional: allow owner to refresh metadata snapshot.
    function updateTokenURI(uint256 tokenId, string calldata newTokenURI) external onlyOwner {
        _setTokenURI(tokenId, newTokenURI);
    }
}
