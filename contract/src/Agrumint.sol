// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Interface to interact with the NFT contract
interface IArgumintNFT {
    function mintForWinner(address _winner) external;
}

/**
 * @title Argumint
 * @dev The main contract for the Proof of Persuasion Protocol.
 * Manages debates, teams, points, and triggers NFT rewards.
 */
contract Argumint {
    // ======== STATE VARIABLES ========

    address public owner;
    IArgumintNFT public nftContract;

    struct Question {
        string questionText;
        string optionOne;
        string optionTwo;
        uint256 startTime;
        uint256 endTime;
    }

    struct Debate {
        uint256 teamOneScore;
        uint256 teamTwoScore;
        // To store the final members of each team for iteration
        address[] teamOneMembers;
        address[] teamTwoMembers;
        // For quick lookups of a user's current team (0=none, 1=teamOne, 2=teamTwo)
        mapping(address => uint8) memberTeam;
        bool isFinalized;
    }

    Question[] public questions;
    mapping(uint256 => Debate) public debates;

    // ======== EVENTS ========

    event QuestionCreated(uint256 indexed questionId);
    event TeamJoined(
        uint256 indexed questionId,
        address indexed user,
        uint8 indexed teamId
    );
    event TeamSwitched(
        uint256 indexed questionId,
        address indexed user,
        uint8 newTeamId,
        address indexed converter
    );
    event DebateFinalized(uint256 indexed questionId, uint8 winningTeam);

    // ======== MODIFIERS ========

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    // ======== CORE FUNCTIONS ========

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Creates a new question and initializes its debate state.
     */
    function createQuestion(
        string memory _questionText,
        string memory _optionOne,
        string memory _optionTwo,
        uint256 _durationInSeconds
    ) public onlyOwner {
        require(_durationInSeconds > 0, "Duration must be positive");
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + _durationInSeconds;

        questions.push(
            Question({
                questionText: _questionText,
                optionOne: _optionOne,
                optionTwo: _optionTwo,
                startTime: startTime,
                endTime: endTime
            })
        );
        emit QuestionCreated(questions.length - 1);
    }

    /**
     * @notice Allows a user to join a team for the first time.
     * @param _questionId The ID of the debate.
     * @param _optionId The team to join (1 or 2).
     */
    function joinTeam(uint256 _questionId, uint8 _optionId) public {
        Question storage q = questions[_questionId];
        Debate storage debate = debates[_questionId];

        require(block.timestamp < q.endTime, "Debate has ended");
        require(_optionId == 1 || _optionId == 2, "Invalid option ID");
        require(
            debate.memberTeam[msg.sender] == 0,
            "You have already joined a team"
        );

        debate.memberTeam[msg.sender] = _optionId;
        if (_optionId == 1) {
            debate.teamOneMembers.push(msg.sender);
            debate.teamOneScore += 1; // Loyal members are worth 1 point
        } else {
            debate.teamTwoMembers.push(msg.sender);
            debate.teamTwoScore += 1;
        }
        emit TeamJoined(_questionId, msg.sender, _optionId);
    }

    /**
     * @notice Allows a user to switch teams, prompted by a "converter".
     * @param _questionId The ID of the debate.
     * @param _converter The address of the user from the opposing team who persuaded the switch.
     */
    function switchTeam(uint256 _questionId, address _converter) public {
        Question storage q = questions[_questionId];
        Debate storage debate = debates[_questionId];

        require(block.timestamp < q.endTime, "Debate has ended");
        uint8 currentTeamId = debate.memberTeam[msg.sender];
        require(currentTeamId != 0, "You must join a team before switching");

        uint8 converterTeamId = debate.memberTeam[_converter];
        require(
            converterTeamId != 0 && converterTeamId != currentTeamId,
            "Converter must be on the opposing team"
        );

        uint8 newTeamId = converterTeamId;

        // Update scores: -1 from old team, +3 to new team
        // Update teams and member arrays
        if (currentTeamId == 1) {
            // Leaving team 1 for team 2
            debate.teamOneScore -= 1;
            debate.teamTwoScore += 3;
            _removeAddressFromArray(debate.teamOneMembers, msg.sender);
            debate.teamTwoMembers.push(msg.sender);
        } else {
            // Leaving team 2 for team 1
            debate.teamTwoScore -= 1;
            debate.teamOneScore += 3;
            _removeAddressFromArray(debate.teamTwoMembers, msg.sender);
            debate.teamOneMembers.push(msg.sender);
        }

        debate.memberTeam[msg.sender] = newTeamId;
        emit TeamSwitched(_questionId, msg.sender, newTeamId, _converter);
    }

    /**
     * @notice Finalizes a debate, determines the winner, and mints NFTs.
     */
    function finalizeDebate(uint256 _questionId) public {
        Question storage q = questions[_questionId];
        Debate storage debate = debates[_questionId];

        require(block.timestamp >= q.endTime, "Debate has not ended yet");
        require(!debate.isFinalized, "Debate is already finalized");
        require(
            address(nftContract) != address(0),
            "NFT contract address not set"
        );

        debate.isFinalized = true;
        uint8 winningTeam;

        if (debate.teamOneScore > debate.teamTwoScore) {
            winningTeam = 1;
            for (uint i = 0; i < debate.teamOneMembers.length; i++) {
                nftContract.mintForWinner(debate.teamOneMembers[i]);
            }
        } else if (debate.teamTwoScore > debate.teamOneScore) {
            winningTeam = 2;
            for (uint i = 0; i < debate.teamTwoMembers.length; i++) {
                nftContract.mintForWinner(debate.teamTwoMembers[i]);
            }
        } else {
            // It's a draw, no NFTs minted.
            winningTeam = 0;
        }
        emit DebateFinalized(_questionId, winningTeam);
    }

    /**
     * @dev Function created to know on which team a user is on.
     */

    function getTeam(
        uint256 _questionId,
        address _user
    ) public view returns (uint8) {
        return debates[_questionId].memberTeam[_user];
    }

    // ======== HELPER & ADMIN FUNCTIONS ========

    /**
     * @dev Internal helper to remove an address from an array. Gas-intensive.
     */
    function _removeAddressFromArray(
        address[] storage _array,
        address _addrToRemove
    ) internal {
        for (uint i = 0; i < _array.length; i++) {
            if (_array[i] == _addrToRemove) {
                _array[i] = _array[_array.length - 1];
                _array.pop();
                return;
            }
        }
    }

    /**
     * @notice Sets the address of the NFT contract.
     */
    function setNftContract(address _nftContractAddress) public onlyOwner {
        nftContract = IArgumintNFT(_nftContractAddress);
    }
}
