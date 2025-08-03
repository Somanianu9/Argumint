// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Argumint.sol";

contract MockNFT is IArgumintNFT {
    function mintForFlipper(address) external override {}
}

contract MockToken is IArgumintToken {
    function mint(address, uint256) external override {}
}

contract ArgumintSwitchTeamTest is Test {
    Argumint argumint;
    address user1 = vm.addr(1);
    address user2 = vm.addr(2);

    function setUp() public {
        argumint = new Argumint(address(new MockNFT()), address(new MockToken()));
    }

    function testSwitchTeam_Success() public {
        uint256 id = argumint.createDebate("Debate A", 1, 2);

        vm.deal(user1, 1 ether);
        vm.startPrank(user1);
        argumint.joinTeam{value: 0.01 ether}(id, 1);
        vm.stopPrank();

        vm.deal(user2, 1 ether);
        vm.startPrank(user2);
        argumint.joinTeam{value: 0.01 ether}(id, 2);
        vm.stopPrank();

        argumint.startDebate(id);

        vm.prank(user1);
        argumint.switchTeam(id, user2);

        ( uint8 team, // 0 = none, 1 or 2
        bool flipped, // has switched once
        uint32 totalFlips, // how many people this user flipped
        uint32 points) = argumint.parts(id, user2);

        console.log("User2");
        console.log("Team:", team);
        console.log("Flipped:", flipped);
        console.log("Total Flips:", totalFlips);
        console.log("Points:", points);

        vm.warp(block.timestamp + 1000);
        // If you intended to advance time or manipulate state, use the appropriate vm function, e.g. vm.warp(block.timestamp + 1000);

        argumint.finishDebate(id);
        (
        ,
        uint256 startedAt, // timestamp when the debate started
        uint256 duration,
        uint16 maxPerTeam,
        bool finalized,
        bool started, // whether the debate has been manually started
        uint256 team1Score, // will be used to store scores
        uint256 team2Score
        ) = argumint.debates(id);
        console.log("Debate Finished");
        console.log("Team 1 Score:", team1Score);
        console.log("Team 2 Score:", team2Score);
    }
}
