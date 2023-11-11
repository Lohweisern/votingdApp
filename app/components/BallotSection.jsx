"use client";
import { useState, useEffect } from "react";
import { useAccount, useContractRead, usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";
import contractABI from "@/app/abis/VotingSystem";
import SimpleDateTime from 'react-simple-timestamp-to-date';
import dynamic from 'next/dynamic'
import { polygonMumbai } from 'wagmi/chains'
import "app/radio-button.css"
import Cookies from "js-cookie";

const BallotSection = () => {

  const { isConnected, address } = useAccount();
  const [ballots, setBallots] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedBallot, setSelectedBallot] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState(0);

  // Check if the user has already voted
  const hasUserVoted = (ballotId, userAddress) => {
    const key = `voted_${ballotId}_${userAddress}`;
    return Cookies.get(key) === 'true';
  }

  // Set the user's vote status in a cookie
  const setUserVoted = (ballotId, userAddress) => {
    const key = `voted_${ballotId}_${userAddress}`;
    Cookies.set(key, 'true', { expires: 365 }); // Set the cookie to expire in 1 year
  }

  const isUserVoted = hasUserVoted(selectedBallot, address);

  const { data: allBallots, error1 } = useContractRead({
    address: "0x5a41Fc7f857083C7a781D5a0BC3eeB5a1D212192",
    abi: contractABI,
    functionName: "getBallots",
  })

  if (error1) {
    console.log(error1); // Log the error to the console
    alert("Failed to read data from smart contract: " + error1.message); // Display an error message to the user
  }

  useEffect(() => {
    setBallots(allBallots);
  }, []);

  const { data: ballotCandidates, error2 } = useContractRead({
    address: '0x5a41Fc7f857083C7a781D5a0BC3eeB5a1D212192',
    abi: contractABI,
    functionName: 'getBallotCandidates',
    args: [selectedBallot],
  })

  if (error2) {
    console.log(error2); // Log the error to the console
    alert("Failed to read data from smart contract: " + error2.message); // Display an error message to the user
  }

  useEffect(() => {
    setCandidates(ballotCandidates);
  }, [selectedBallot])

  const { data: isVoter, error3 } = useContractRead({
    address: '0x5a41Fc7f857083C7a781D5a0BC3eeB5a1D212192',
    abi: contractABI,
    functionName: 'hasVoterRole',
    watch: true,
    args: [address],
  })

  if (error3) {
    console.log(error3); // Log the error to the console
    alert("Failed to read data from smart contract: " + error3.message); // Display an error message to the user
  }

  const { data: isActive } = useContractRead({
    address: '0x5a41Fc7f857083C7a781D5a0BC3eeB5a1D212192',
    abi: contractABI,
    functionName: 'isBallotActive',
    args: [selectedBallot],
    watch: true,
  })

  const { data: voted } = useContractRead({
    address: '0x5a41Fc7f857083C7a781D5a0BC3eeB5a1D212192',
    abi: contractABI,
    functionName: 'hasVoted',
    args: [selectedBallot, address],
    watch: true,
  })

  const { data: ballotVotes, error4 } = useContractRead({
    address: '0x5a41Fc7f857083C7a781D5a0BC3eeB5a1D212192',
    abi: contractABI,
    functionName: 'getBallotVotes',
    watch: true,
    args: [selectedBallot],
  })

  if (error4) {
    console.log(error4); // Log the error to the console
    alert("Failed to read data from smart contract: " + error4.message); // Display an error message to the user
  }

  const { config: vote } = usePrepareContractWrite({
    address: '0x5a41Fc7f857083C7a781D5a0BC3eeB5a1D212192',
    abi: contractABI,
    functionName: 'vote',
    args: [selectedBallot, selectedCandidate],
    chainid: polygonMumbai.id,
    onSuccess(data) {
      console.log('Success', data)
    },
    onError(error) {
      console.log('Error', error)
    },
  })

  const { write: voteWrite } = useContractWrite(vote);

  const { data: ballotWinner } = useContractRead({
    address: '0x5a41Fc7f857083C7a781D5a0BC3eeB5a1D212192',
    abi: contractABI,
    functionName: 'getBallotWinner',
    args: [selectedBallot],
    watch: true,
  })

  return (
    <section className="text-white" id="ballots">
      <h2 className="text-center text-4xl font-bold text-white mt-20 mb-10 md:mb-10">
        Ballots
      </h2>
      {selectedBallot === 0 ? (
        // Initial state, showing the list of ballots
        ballots.map((ballotArray, index) => (
          <div key={index}>
            <div className="flex justify-center items-center">
              <div className="text-white w-96 font-medium py-2.5 px-5 rounded-lg shadow-lg bg-gradient-to-r from-primary-400 to-secondary-400 m-5">
                <h2 className="mt-2 font-extrabold">Ballot ID: {index + 1}</h2>
                <ul>
                  {ballotArray.map((ballot, innerIndex) => (
                    <li key={innerIndex} className="mt-2">
                      <h3>Title: {ballot.title}</h3>
                      <p>Description: {ballot.description}</p>
                      <p>Starts At: <SimpleDateTime dateFormat="DMY" dateSeparator="/" timeSeparator=":" meridians="1">{ballot.startsAt.toString()}</SimpleDateTime></p>
                      <p>Ends At: <SimpleDateTime dateFormat="DMY" dateSeparator="/" timeSeparator=":" meridians="1">{ballot.endsAt.toString()}</SimpleDateTime></p>
                      <p className="mb-2">No. of candidates: {ballot.candidates.toString()}</p>
                      <div className="mt-4">
                        <button onClick={() => setSelectedBallot(index + 1)}>
                          <span className="block bg-[#121212] hover:bg-slate-800 rounded-xl px-5 py-2 mb-2">
                            Enter Ballot
                          </span>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))
      ) : (
        // Displaying candidate details for the selected ballot
        <div className="flex justify-center items-center">
          <div className="text-white w-auto font-medium py-2.5 px-5 rounded-lg shadow-lg bg-gradient-to-r from-primary-400 to-secondary-400 m-5">
            {candidates && candidates.length > 0 && isActive ? (
              candidates.map((candidate, cIndex) => (
                <div key={cIndex}>
                  <div className="flex items-center mt-2">
                    <img src={candidate.imageURL} alt="candidate image" className="flex items-center mt-3 rounded-xl h-24 w-24 object-cover" />
                    <div className="ml-4">
                      <p className="mt-2">Name: {candidate.name}</p>
                      <p>Party: {candidate.party}</p>
                      {/* <p>Votes: {(ballotVotes[cIndex].votes).toString()}</p> */}
                    </div>
                    <div className="ml-12">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name={`candidateSelection-${selectedBallot}`}
                          value={cIndex}
                          checked={selectedCandidate === cIndex}
                          onChange={() => setSelectedCandidate(cIndex)}
                        />
                        <div className="custom-radio"></div>
                      </label>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="justify-center items-center flex flex-col">
                {!isActive && ballotWinner && candidates && candidates.length > 0 && (
                  <h2 className="text-center font-extrabold text-2xl text-white mt-2">
                    Election Ended
                  </h2>
                )}

                <div className="flex items-center flex-wrap justify-center">
                  {candidates && candidates.length > 0 && ballotWinner && !isActive && (
                    candidates.map((candidate, cIndex) => (
                      <div key={cIndex} className="flex justify-center items-center mt-2 ml-2 mr-2">
                        <img src={candidate.imageURL} alt="candidate image" className="flex items-center mt-3 rounded-xl h-24 w-24 object-cover" />
                        <div className="ml-4">
                          <p className="mt-2">Name: {candidate.name}</p>
                          <p>Party: {candidate.party}</p>
                          <p>Votes: {(ballotVotes[cIndex].votes).toString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="w-96 mt-2 text-center">
                  {ballotWinner && ballotWinner.length > 1 ? (
                    // Display "Draw" with candidate details when there are two or more winners
                    <div>
                      <h2 className="mt-4 font-bold text-2xl text-center">
                        It's a Draw!
                      </h2>
                      {ballotWinner.map((bW, bwIndex) => (
                        !isActive && (
                          <div key={bwIndex}>
                            <div className="text-5xl">
                              <span role="img" aria-label="winner">👑</span>
                            </div>
                            <h2 className="mt-2 font-bold">Candidate ID: {bW.cid.toString()}</h2>
                            <img src={bW.imageURL} alt="winner image" className="mx-auto mt-3 rounded-xl h-24 w-24 object-cover" />
                            <p className="mt-2">Name: {bW.name}</p>
                            <p>Party: {bW.party}</p>
                            <p>Votes: {bW.votes.toString()}</p>
                          </div>
                        )
                      ))}
                    </div>
                  ) : (
                    // Display "Ballot Winner" when there's only one winner
                    ballotWinner && ballotWinner.map((bW, bwIndex) => (
                      !isActive && (
                        <div key={bwIndex}>
                          <h2 className="mt-4 font-bold text-2xl"> Ballot Winner </h2>
                          <div className="text-5xl">
                            <span role="img" aria-label="winner">👑</span>
                          </div>
                          <h2 className="mt-2 font-bold">Candidate ID: {bW.cid.toString()}</h2>
                          <img src={bW.imageURL} alt="winner image" className="mx-auto mt-3 rounded-xl h-24 w-24 object-cover" />
                          <p className="mt-2">Name: {bW.name}</p>
                          <p>Party: {bW.party}</p>
                          <p>Votes: {bW.votes.toString()}</p>
                        </div>
                      )
                    ))
                  )}
                  {!ballotWinner && (
                    <h2 className="text-center w-96 font-extrabold text-2xl text-white mt-2 mb-10">
                      Ballot Inactive
                    </h2>
                  )}
                </div>
              </div>


            )}

            <div className="mt-4 flex justify-between">
              <button onClick={() => setSelectedBallot(0)}>
                <span className="block bg-[#121212] hover:bg-slate-800 rounded-xl px-5 py-2 mb-2">
                  Back
                </span>
              </button>

              {isConnected && isActive && isVoter && !isUserVoted ? (

                <button
                  onClick={() => {
                    voteWrite?.();
                    setUserVoted(selectedBallot, address);
                  }}
                  className={"block bg-[#121212] hover:bg-slate-800 rounded-xl px-5 py-2 mb-2"}
                >
                  Vote
                </button>

              ) : isUserVoted && isActive ? (
                <button disabled className="block bg-red-500 rounded-xl px-5 py-2 mb-2">
                  Voted
                </button>
              ) : null}

            </div>
          </div>
        </div>
      )}
    </section>

  );
}

export default dynamic(() => Promise.resolve(BallotSection), { ssr: false });

