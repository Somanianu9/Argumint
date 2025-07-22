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
    ) ERC721("Argumint", "AM") Ownable(initialOwner) {}

    /**
     * @dev Sets the address of the main Argumint contract, which is allowed to mint tokens.
     */
    function setMinter(address _minterAddress) public onlyOwner {
        minterAddress = _minterAddress;
        emit MinterAddressSet(_minterAddress);
    }

    /**
     * @dev Mints a new NFT to a specified winner. Can only be called by the Minter contract.
     */
    function mintForWinner(address _winner) public {
        require(
            msg.sender == minterAddress,
            "Caller is not the authorized minter"
        );
        require(minterAddress != address(0), "Minter address not set");
        uint256 tokenId = _nextTokenId++;
        _safeMint(_winner, tokenId);
    }
}
