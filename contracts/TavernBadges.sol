// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title TavernBadges
/// @notice Soulbound(ish) achievement tokens. Once minted, they cannot be transferred.
contract TavernBadges is ERC721, Ownable {
    uint256 public nextTokenId;
    mapping(uint256 => string) private _tokenURIs;

    event BadgeMinted(uint256 indexed tokenId, address indexed to, string tokenURI);

    constructor() ERC721("Tavern Badge", "TAVERNBDG") Ownable(msg.sender) {}

    function mintBadge(address to, string calldata tokenURI_) external onlyOwner returns (uint256) {
        require(to != address(0), "Invalid recipient");
        uint256 tokenId = ++nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        emit BadgeMinted(tokenId, to, tokenURI_);
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

    /// @dev Soulbound behavior: block transfers and approvals.
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Badges are soulbound");
        }
        return super._update(to, tokenId, auth);
    }

    function approve(address, uint256) public pure override {
        revert("Badges are soulbound");
    }

    function setApprovalForAll(address, bool) public pure override {
        revert("Badges are soulbound");
    }
}
