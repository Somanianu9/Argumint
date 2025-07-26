// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IArgumintNFT {
    function mintForWinner(address _winner) external;
}
error invalidDebateData(string reason);
error debateEnded(uint256 debateId);
error roomFull(uint256 debateId, uint8 team);
error debateNotStarted(uint256 debateId);
contract Argumint {
    address public immutable owner;
    IArgumintNFT public nft;


    struct Participant {
        uint8  team;       // 0 = none, 1 or 2
        bool   flipped;    // has switched once
        uint32 totalFlips; // how many people this user flipped
        uint32 points;     // accumulated points
    }

    struct Debate {
        uint64   start;
        uint32   duration;
        uint16   maxPerTeam;
        bool     finalized;
        address[] team1;
        address[] team2;
    }

    uint256 public debateCount;  // will be used as debate ID
    mapping(uint256 => Debate) private debates; // debate ID => Debate
    mapping(uint256 => mapping(address => Participant)) private parts; // debate ID => (user address => Participant)

    event DebateCreated(uint256 indexed debateId, string title,uint32 startDelay , uint32 duration);
    event Joined(uint256 indexed debateId, address indexed who, uint8 team);
    event Finished(uint256 indexed debateId, uint256 team1Score, uint256 team2Score);
    event Flipped(uint256 indexed debateId, address indexed user, address indexed persuader); // may need the current team or extract it from the user

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setNFT(address _nft) external onlyOwner {
        nft = IArgumintNFT(_nft);
    }

    function createDebate(string calldata title, uint32 startDelay ,uint32 duration, uint16 maxPerTeam) external onlyOwner {
        if (bytes(title).length == 0) {
            revert invalidDebateData("Title cannot be empty");
        }
        if (maxPerTeam <= 1) {
            revert invalidDebateData("Not enough participants per team");
        }
        if (startDelay < 1 || duration < 1) {
            revert invalidDebateData("Start delay and duration must be at least 1 second");
        }
        debateCount += 1;
        Debate storage d = debates[debateCount];
        d.start = uint64(block.timestamp +  startDelay  * 1 seconds);
        d.duration = duration;
        d.maxPerTeam = maxPerTeam;
        emit DebateCreated(debateCount, title,startDelay , duration);
    }

    function joinTeam(uint256 id, uint8 team) external {
        Debate storage d = debates[id];

        if(block.timestamp >= d.start + d.duration) {
            revert debateEnded(id);
        }
        Participant storage p = parts[id][msg.sender];

require(p.team == 0, "Already joined a team");
        if (team == 1) {
            if (d.team1.length >= d.maxPerTeam) {
                revert roomFull(id, 1);
            }
            d.team1.push(msg.sender);
        } else {
            if (d.team2.length >= d.maxPerTeam) {
                revert roomFull(id, 2);
            }
            d.team2.push(msg.sender);
        }
        p.team = team;
        emit Joined(id, msg.sender, team);
    }

    function switchTeam(uint256 id, address persuader) external {
        Debate storage d = debates[id];
        if(block.timestamp >= d.start + d.duration) {
            revert debateEnded(id);
        }

        Participant storage user = parts[id][msg.sender];
        Participant storage pdr  = parts[id][persuader];
        require(user.team > 0 && pdr.team > 0 && user.team != pdr.team, "Bad switch");
        require(!user.flipped, "Already flipped");

        // move user between arrays
        _move(d.team1, d.team2, msg.sender, user.team);
        user.team = 3 - user.team;

        // record persuasion
        user.flipped = true;
        pdr.totalFlips += 1;
        pdr.points     += 3;

        emit Flipped(id, msg.sender, persuader);
    }

    function finishDebate(uint256 id) external {
    Debate storage d = debates[id];

    // 1) Ensure the debate window has passed
    if (block.timestamp < d.start + d.duration) {
        revert debateEnded(id);
    }
    // 2) Ensure we haven't already finalized
    if (d.finalized) {
        revert debateEnded(id);
    }

    // Mark as finalized to prevent re‑entrancy or double‑finalization
    d.finalized = true;

    // 3) Compute scores
    uint256 team1Score = _score(id, d.team1);
    uint256 team2Score = _score(id, d.team2);

    // 4) Emit the final scores
    emit Finished(id, team1Score, team2Score);

    // 5) Determine winners array (empty on tie)
    address[] memory winners;
    if (team1Score > team2Score) {
        winners = d.team1;
    } else if (team2Score > team1Score) {
        winners = d.team2;
    } else {
        winners = new address[](0);
    }


    for (uint i = 0; i < winners.length; ++i) {
        address user = winners[i];
        Participant storage p = parts[id][user];

        
        p.points += 1 + (p.flipped ? 2 : 0);


        nft.mintForWinner(user);
    }
}


    // ——— Helpers ———

    function _move(
        address[] storage from,
        address[] storage to,
        address who,
        uint8 team
    ) private {
        address[] storage src = team == 1 ? from : to;
        address[] storage dst = team == 1 ? to   : from;
        uint len = src.length;
        for (uint i; i < len; ++i) {
            if (src[i] == who) {
                src[i] = src[--len];
                src.pop();
                break;
            }
        }
        dst.push(who);
    }

    function _score(uint256 id, address[] storage members) private view returns (uint256 sum) {
        for (uint i; i < members.length; ++i) {
            Participant storage p = parts[id][members[i]];
            sum += p.flipped ? 3 : 1;
        }
    }

    // ——— Read Functions ———

    function getTeam(uint256 id, address who) external view returns (uint8) {
        return parts[id][who].team;
    }

    function getPoints(uint256 id, address who) external view returns (uint32) {
        return parts[id][who].points;
    }

    function getFlips(uint256 id, address who) external view returns (uint32) {
        return parts[id][who].totalFlips;
    }
}