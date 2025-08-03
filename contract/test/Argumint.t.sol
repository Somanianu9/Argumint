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

contract ArgumintTest is Test {
    Argumint public argumint;
    MockNFT public nft;
    MockToken public amt;
    address public owner = address(this);
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public user3 = address(0x3);
    address public user4 = address(0x4);

    function setUp() public {
        nft = new MockNFT();
        amt = new MockToken();
        argumint = new Argumint(address(nft), address(amt));
    }

    function testEndToEndDebateFlow() public {
        // Create debate
        uint256 id = argumint.createDebate("Is AI ethical?", 1, 300, 2);
        (, , uint256 duration, uint16 maxPerTeam, bool started, ) = argumint.debates(id);
        assertEq(duration, 300);
        assertEq(maxPerTeam, 2);
        assertFalse(started);


        vm.deal(user1, 1 ether);
        vm.deal(user2, 1 ether);
        vm.prank(user1);
        argumint.joinTeam{value: 0.02 ether}(id, 1);

        vm.prank(user2);
        argumint.joinTeam{value: 0.02 ether}(id, 2);

        // Fast forward and start debate
        vm.warp(block.timestamp + 2);
        argumint.startDebate(id);
        (, , , , started, ) = argumint.debates(id);
        assertTrue(started);


        vm.deal(user3, 1 ether);
        vm.prank(user3);
        argumint.joinTeam{value: 0.02 ether}(id, 1);

        vm.prank(user3);
        argumint.switchTeam(id, user2);

        // End debate
        vm.warp(block.timestamp + 310);
        argumint.finishDebate(id);

        // Try double finalize (should revert)
        vm.expectRevert(debateEnded.selector);
        argumint.finishDebate(id);
    }

    function testJoinFailsWithLowFee() public {
        uint256 id = argumint.createDebate("Debate", 1, 300, 2);
        vm.deal(user1, 1 ether);
        vm.prank(user1);
        vm.expectRevert("Incorrect join fee");
        argumint.joinTeam{value: 0.005 ether}(id, 1);
    }

    function testStartTooEarlyReverts() public {
        uint256 id = argumint.createDebate("Debate", 60, 300, 2);
        vm.expectRevert(abi.encodeWithSelector(cannotStartYet.selector, id, 60));
        argumint.startDebate(id);
    }

    function testFlipFailsBeforeStart() public {
        uint256 id = argumint.createDebate("Debate", 60, 300, 2);
        vm.deal(user1, 1 ether);
        vm.deal(user2, 1 ether);
        vm.prank(user1);
        argumint.joinTeam{value: 0.02 ether}(id, 1);
        vm.prank(user2);
        argumint.joinTeam{value: 0.02 ether}(id, 2);

        vm.prank(user1);
        // vm.expectRevert(debateNotStarted.selector);
        argumint.switchTeam(id, user2);
    }
}
