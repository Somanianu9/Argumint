// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {Argumint} from "../src/Agrumint.sol";

contract ArgumintTesting is Test {
    Argumint public argumint;

    function setUp() public {
        argumint = new Argumint();
    }
}
