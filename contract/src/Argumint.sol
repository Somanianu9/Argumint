// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IArgumintNFT {
    function mintForFlipper(address _flipper) external;
}
interface IArgumintToken {
    function mint(address to, uint256 amount) external;
}

error invalidDebateData(string reason);
error debateEnded(uint256 debateId);
error roomFull(uint256 debateId, uint8 team);
error debateNotStarted(uint256 debateId);
error debateAlreadyStarted(uint256 debateId);
error cannotStartYet(uint256 debateId, uint256 remainingTime);

/**
@title Argumint
@dev A contract for managing debates, participants, and rewards.
**/

contract Argumint {

    // ——— State Variables ———
    uint256 public constant JOIN_FEE = 0.01 ether;
    address public immutable owner;
    IArgumintNFT public nft;
    IArgumintToken public amt;

    struct Participant {
        uint8 team; // 0 = none, 1 or 2
        bool flipped; // has switched once
        uint32 totalFlips; // how many people this user flipped
        uint32 points; // accumulated points
    }

    struct Debate {
        string  title;
        uint256 startedAt; // timestamp when the debate started
        uint256 duration;
        uint16 maxPerTeam;
        bool finalized;
        bool started; // whether the debate has been manually started
        address[] team1;
        address[] team2;
    }

    uint256 public debateCount; // will be used as debate ID
    mapping(uint256 => Debate) public debates; // debate ID => Debate
    mapping(uint256 => mapping(address => Participant)) public parts; // debate ID => (user address => Participant)

    // ——— Events ———
    /// @notice Emitted when a new debate is created.
    event DebateCreated(
        uint256 indexed debateId,
        string title,
        uint256 duration
    );
    /// @notice Emitted when a debate is started manually by the owner.
    event DebateStarted(uint256 indexed debateId,
                        uint256 actualStartTime);
    /// @notice Emitted when a user joins a team in a debate.
    event Joined(uint256 indexed debateId,
                 address indexed who,
                 uint8 team);
    /// @notice Emitted when a debate is finished, with final scores.
    event Finished(
        uint256 indexed debateId,
        uint256 team1Score,
        uint256 team2Score
    );
    /// @notice Emitted when a user flips teams, persuading another user.
    event Flipped(
        uint256 indexed debateId,
        address indexed user,
        address indexed persuader
    ); // may need the current team or extract it from the Participant struct

    /// @notice Emitted when a debate ends in a tie.
    event Tie(
        uint256 indexed debateId,
        uint256 team1Score,
        uint256 team2Score
    );
    /// @notice Emitted when the owner withdraws funds from the contract.
    event Withdrawn(address indexed owner, uint256 amount);


        // ——— Modifiers ——— //
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier debateExists(uint256 id) {
    require(id > 0 && id <= debateCount, "Debate does not exist");
    _;
}

    constructor(address _nft, address _amt) {
        owner = msg.sender;
        nft = IArgumintNFT(_nft);
        amt = IArgumintToken(_amt);
    }
    // ——— Debate Management ———
    /**
     * @notice Creates a new debate with specified parameters.
     * @param title The title of the debate.
     * @param duration Duration of the debate, in seconds.
     * @param maxPerTeam Maximum number of participants per team.
     */
    function createDebate(
        string calldata title,
        uint256 duration,
        uint16 maxPerTeam
    ) external onlyOwner returns (uint256) {
        if (bytes(title).length == 0) {
            revert invalidDebateData("Title cannot be empty");
        }
        if (maxPerTeam < 1) {  // fails if maxPerTeam is 1;
            revert invalidDebateData("Not enough participants per team");
        }

        debateCount += 1;
        Debate storage d = debates[debateCount];
        d.title = title;
        d.duration = duration;
        d.maxPerTeam = maxPerTeam;

        d.started = false; // Initialize as not started

        emit DebateCreated(debateCount, title, duration);
        return debateCount; // Return the debate ID
    }

    /**
     * @notice Manually starts a debate after the start delay has elapsed.
     * @param id The ID of the debate to start.
     */
    function startDebate(uint256 id) external onlyOwner debateExists(id) {
        Debate storage d = debates[id];

        //  check if debate has participants
        require(d.team1.length > 0 || d.team2.length > 0, "Not enough participants");


        // Check if already started
        if (d.started) {
            revert debateAlreadyStarted(id);
        }

        // Check if start delay has elapsed

     d.startedAt = block.timestamp;
        d.started = true;
        emit DebateStarted(id, block.timestamp);
    }
    /**
     * @notice Allows a user to join a team in a debate.
     * @param id The ID of the debate.
     * @param team The team number (1 or 2) to join.
     */
    function joinTeam(uint256 id, uint8 team) external payable debateExists(id) {
        require(team == 1 || team == 2, "Invalid team number");
        Debate storage d = debates[id];
        require(msg.value >= JOIN_FEE, "Incorrect join fee");


        require(!d.finalized, "Debate already finalized");
if (d.started && block.timestamp >= d.startedAt + d.duration) {
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
    /**
     * @notice Allows a user to switch teams, persuading another user.
     * @param id The ID of the debate.
     * @param _flipper The address of the user being persuaded.
     */
    function switchTeam(uint256 id, address _flipper) external debateExists(id) {
        Debate storage d = debates[id];

        // Check if debate has been manually started
        if (!d.started) {
            revert debateNotStarted(id);
        }

        if (block.timestamp >= d.startedAt + d.duration) {
    revert debateEnded(id);
}

        Participant storage user = parts[id][msg.sender];
        Participant storage pdr = parts[id][_flipper];
        require(
            user.team > 0 && pdr.team > 0 && user.team != pdr.team,
            "Invalid team switch"
        );
        require(!user.flipped, "Already flipped");

        // move user between arrays
        _move(d.team1, d.team2, msg.sender, user.team);
        user.team = 3 - user.team;

        // record persuasion
        user.flipped = true;
        pdr.totalFlips += 1;


        emit Flipped(id, msg.sender, _flipper);
        amt.mint(_flipper, 3); // 3 tokens to the persuaded user
        nft.mintForFlipper(_flipper);
    }
    /**
     * @notice Finalizes a debate, computes scores, and rewards participants.
     * @param id The ID of the debate to finalize.
     */
    function finishDebate(uint256 id) external debateExists(id) {
        Debate storage d = debates[id];

            require(block.timestamp >= d.startedAt + (d.duration * 1 seconds), "Debate not ended yet");

        if (d.finalized) {
            revert debateEnded(id);
        }

        d.finalized = true;
        uint256 team1Score = _score(id, d.team1);
        uint256 team2Score = _score(id, d.team2);


        emit Finished(id, team1Score, team2Score);

        address[] storage winners;
        if (team1Score > team2Score) {
            winners = d.team1;
        } else if (team2Score > team1Score) {
            winners = d.team2;
        } else {
            // tie - no winners
            emit Tie(id, team1Score, team2Score);
            return;
        }

        // 6) Reward **all** winners
        for (uint i = 0; i < winners.length; ++i) {
            address user = winners[i];
            Participant storage p = parts[id][user];
            p.points += 1 + (p.totalFlips * 3); // 1 point + 3 for each flip
            payable(user).transfer(p.points * JOIN_FEE); // Transfer points as ether
            amt.mint(user, p.points); // Mint tokens equal to points
        }


        if (winners.length > 0) {
            for (uint i = 0; i < winners.length && i < 3; ++i) {
                nft.mintForFlipper(winners[i]);
            }
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
        address[] storage dst = team == 1 ? to : from;
        // one of them is true so lets say if src is t0 then dst will be t1
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

    function _score(
        uint256 id,
        address[] storage members
    ) private view returns (uint256 sum) {
        for (uint i; i < members.length; ++i) {
            Participant storage p = parts[id][members[i]];
            sum += 1 + (p.totalFlips * 3);
        }
    }
    // ——— View Functions ———
    function isDebateEnded(uint256 id) external view returns (bool) {
        Debate storage d = debates[id];
        return d.started && block.timestamp >= d.startedAt + d.duration;

    }
    function isDebateStarted(uint256 id) external view returns (bool) {
        Debate storage d = debates[id];
        return d.started;
    }


function withdraw() external onlyOwner {
    uint256 amount = address(this).balance;
    emit Withdrawn(owner, amount);
    (bool ok, ) = payable(owner).call{value: amount}("");
    require(ok, "Failed transfer");
}

 fallback() external payable {
    require(msg.value > 0, "No ether sent");

}

receive() external payable {
    require(msg.value > 0, "No ether sent");
}
}
