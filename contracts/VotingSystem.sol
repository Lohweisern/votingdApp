// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract VotingSystem {
    //PERMISSIONS & ROLES
    event GrantRole(bytes32 indexed role, address indexed account);
    event RevokeRole(bytes32 indexed role, address indexed account);

    //role => account => bool
    mapping(bytes32 => mapping(address => bool)) public roles;

    //bytes32: 0xdf8b4c520ffe197c5343c6f5aec59570151ef9a492f2c624fd45ddde6135ec42
    bytes32 private constant ADMIN = keccak256(abi.encodePacked("ADMIN"));
    //bytes32: 0x15283fd96aa656c9df35ac2fcb112678a5f24f1ca97e591a97d1d16003dbfc9c
    bytes32 private constant VOTER = keccak256(abi.encodePacked("VOTER"));

    modifier onlyRole(bytes32 _role) {
        require(roles[_role][msg.sender], "Not Authorized");
        _;
    }

    constructor() {
        _grantRole(ADMIN, msg.sender);
    }

    function _grantRole(bytes32 _role, address _account) internal {
        roles[_role][_account] = true;
        emit GrantRole(_role, _account);
    }

    function grantRole(
        bytes32 _role,
        address _account
    ) external onlyRole(ADMIN) {
        _grantRole(_role, _account);
    }

    function revokeRole(
        bytes32 _role,
        address _account
    ) external onlyRole(ADMIN) {
        roles[_role][_account] = false;
        emit RevokeRole(_role, _account);
    }

    function getRoles(
        address _account
    ) public view returns (bool admin, bool voter) {
        admin = roles[ADMIN][_account];
        voter = roles[VOTER][_account];
    }

    function hasVoterRole(address _account) public view returns (bool) {
        return roles[VOTER][_account];
    }

    struct Ballot {
        string title;
        string description;
        uint256 candidates;
        uint256 startsAt;
        uint256 endsAt;
    }

    struct Candidate {
        string imageURL;
        string name;
        string party;
    }

    struct CandidateVotes {
        uint256 cid;
        uint256 votes;
    }

    struct ballotWinner {
        uint256 cid;
        string name;
        string party;
        string imageURL;
        uint256 votes;
    }

    mapping(uint256 => Candidate) candidates;
    mapping(uint256 => Ballot) ballots;
    mapping(uint256 => mapping(uint256 => uint256)) ballotCandidates;
    mapping(uint256 => mapping(uint256 => uint256)) ballotVotes;
    mapping(uint256 => mapping(address => uint256)) voted;

    uint256 public candidateCount;
    uint256 public ballotCount;

    function createCandidate(
        string memory name,
        string memory party,
        string memory imageURL
    ) public onlyRole(ADMIN) returns (uint256) {
        require(bytes(name).length > 0, "Candidate Name cannot be empty");
        require(bytes(party).length > 0, "Party cannot be empty");
        require(bytes(imageURL).length > 0, "Image URL cannot be empty");
        uint256 cid = ++candidateCount;
        candidates[cid] = Candidate(imageURL, name, party);
        return cid;
    }

    function createBallot(
        uint256[] memory cids,
        string memory title,
        string memory description,
        uint256 startsAt,
        uint256 endsAt
    ) public onlyRole(ADMIN) returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(
            startsAt < endsAt,
            "Invalid ballot time frame: startsAt must be before endsAt"
        );
        require(
            startsAt >= getCurrentTimestamp(),
            "Ballot cannot be created before current time"
        );
        require(cids.length >= 2, "At least 2 candidates required");
        uint256 bid = ++ballotCount;
        ballots[bid] = Ballot({
            title: title,
            description: description,
            startsAt: startsAt,
            endsAt: endsAt,
            candidates: cids.length
        });
        for (uint256 i; i < cids.length; i++) {
            uint256 cid = cids[i];
            require(cid <= candidateCount, "Invalid candidate");
            for (uint256 j; j < i; j++) {
                require(cid != cids[j], "Duplicate candidate");
            }
            ballotCandidates[bid][i] = cid;
        }
        return bid;
    }

    function getBallots() public view returns (Ballot[][] memory) {
        Ballot[][] memory allBallots = new Ballot[][](ballotCount);

        for (uint256 i = 1; i <= ballotCount; i++) {
            allBallots[i - 1] = new Ballot[](1);
            allBallots[i - 1][0] = ballots[i];
        }

        return allBallots;
    }

    function getBallotCandidates(
        uint256 bid
    ) public view returns (Candidate[] memory) {
        require(bid > 0 && bid <= ballotCount, "Invalid ballot ID");

        Ballot storage ballot = ballots[bid];
        uint256 candidateCountInBallot = ballot.candidates;
        Candidate[] memory result = new Candidate[](candidateCountInBallot);

        for (uint256 i = 0; i < candidateCountInBallot; i++) {
            uint256 cid = ballotCandidates[bid][i];
            require(cid > 0, "Invalid candidate");
            result[i] = candidates[cid];
        }

        return result;
    }

    function vote(uint256 bid, uint256 c_index) public onlyRole(VOTER) {
        require(isBallotActive(bid), "Ballot is not active");
        require(!hasVoted(bid, msg.sender), "Already voted in this ballot");

        uint256 cid = ballotCandidates[bid][c_index + 1];

        voted[bid][msg.sender] = cid;
        ballotVotes[bid][c_index + 1]++;
    }

    function getCurrentTimestamp() public view returns (uint256) {
        return block.timestamp;
    }

    function hasVoted(
        uint256 bid,
        address _account
    ) public view returns (bool) {
        return voted[bid][_account] > 0;
    }

    function getBallotVotes(
        uint256 bid
    ) public view returns (CandidateVotes[] memory v) {
        uint256 n = ballots[bid].candidates;
        v = new CandidateVotes[](n);
        for (uint256 i = 0; i < n; i++) {
            uint256 candidateID = ballotCandidates[bid][i];
            uint256 candidateVotes = ballotVotes[bid][candidateID];

            v[i] = CandidateVotes({cid: candidateID, votes: candidateVotes});
        }
    }

    function isBallotActive(uint256 bid) public view returns (bool active) {
        Ballot storage ballot = ballots[bid];
        uint256 t = getCurrentTimestamp();
        return t >= ballot.startsAt && t < ballot.endsAt;
    }

    function getBallotWinner(
        uint256 bid
    ) public view returns (ballotWinner[] memory winners) {
        Ballot storage ballot = ballots[bid];
        require(ballot.endsAt <= getCurrentTimestamp(), "Ballot still active");
        uint256 n = ballot.candidates;
        uint256 maxVotes = 0;
        uint256 winnerCount = 0;

        // First pass to determine the maximum number of votes
        for (uint256 i = 0; i < n; i++) {
            uint256 votes = ballotVotes[bid][i + 1]; // Use i + 1 to correctly index votes

            if (votes > maxVotes) {
                maxVotes = votes;
                winnerCount = 1;
            } else if (votes == maxVotes) {
                winnerCount++;
            }
        }

        winners = new ballotWinner[](winnerCount);
        uint256 winnerIndex = 0;

        // Second pass to collect the winners' information
        for (uint256 i = 0; i < n; i++) {
            uint256 candidateID = ballotCandidates[bid][i];
            uint256 votes = ballotVotes[bid][i + 1]; // Use i + 1 to correctly index votes

            if (votes == maxVotes) {
                Candidate storage candidate = candidates[candidateID];
                winners[winnerIndex] = ballotWinner({
                    cid: candidateID,
                    name: candidate.name,
                    party: candidate.party,
                    imageURL: candidate.imageURL,
                    votes: maxVotes
                });
                winnerIndex++;
            }
        }
        return winners;
    }
}
