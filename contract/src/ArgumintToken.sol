// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ArgumintToken
 * @dev A soulbound ERC20 token. Non-transferable. Minted by the Argumint contract.
 */
contract ArgumintToken is ERC20, Ownable {
    address public minter;

    constructor(
        address initialOwner
    ) ERC20("ArgumintToken", "AMT") Ownable(initialOwner) {}

    modifier onlyMinter() {
        require(msg.sender == minter, "Not authorized minter");
        _;
    }

    function setMinter(address _minter) external  {
        minter = _minter;
    }

    function mint(address to, uint256 amount) external  {
        _mint(to, amount);
    }

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override {
        // Allow only minting (from == 0) and burning (to == 0)
        require(
            from == address(0) || to == address(0),
            "Soulbound: transfers disabled"
        );
        super._update(from, to, value);
    }
}
