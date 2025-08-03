// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ArgumintNFT
 * @dev An ERC721 token contract to mint reward NFTs for winners of debates.
 * Minting is restricted to the owner or a designated Minter contract (Argumint).
 */
contract ArgumintNFT is ERC721, Ownable {
    uint256 private _nextTokenId;
    address public minterAddress;

    event MinterAddressSet(address indexed newMinter);

    constructor(
        address initialOwner
    ) ERC721("Mind Flip", "MF") Ownable(initialOwner) {}

    /**
     * @dev Sets the address of the main Argumint contract, which is allowed to mint tokens.
     */
    function setMinter(address _minterAddress) public onlyOwner {
        minterAddress = _minterAddress;
        emit MinterAddressSet(_minterAddress);
    }

    /**
     * @dev Mints a new NFT to a specified flipper. Can only be called by the Minter contract.
     */
    function mintForFlipper(address _flipper) public {
        // require(minterAddress != address(0), "Minter address not set");
        uint256 tokenId = _nextTokenId++;
        _safeMint(_flipper, tokenId);
    }
    // /**
    // * @dev mints nft for top 3 performers
    // */
    // function mintForTopPerformers(address  winner) external onlyOwner {
    //     require(winner != address(0), "No winners provided");

    // }
}
