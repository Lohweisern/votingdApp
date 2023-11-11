"use client"
import { usePrepareContractWrite, useContractWrite, useAccount } from "wagmi";
import contractABI from "@/app/abis/VotingSystem";
import { polygonMumbai } from 'wagmi/chains'
import { useState } from 'react'
import dynamic from 'next/dynamic';

const AdminOnly = () => {
    const { isConnected, address } = useAccount();

    const [imageURL, setImageURL] = useState('');
    const [name, setName] = useState('');
    const [party, setParty] = useState('');
    const [cids, setCids] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startsAt, setStartTime] = useState('');
    const [endsAt, setEndTime] = useState('');
    const [walletAddressA, setWalletAddressA] = useState('');
    const [walletAddressB, setWalletAddressB] = useState('');

    const toTimeStamp = (dateStr) => {
        const dateObj = Date.parse(dateStr);
        return dateObj / 1000;
    }

    const handleAddressChangeA = (e) => {
        const inputAddress = e.target.value;
        setWalletAddressA(inputAddress);
    };

    const handleAddressChangeB = (e) => {
        const inputAddress = e.target.value;
        setWalletAddressB(inputAddress);
    };

    const { config: grantVoterRole } = usePrepareContractWrite({
        address: "0x5a41Fc7f857083C7a781D5a0BC3eeB5a1D212192",
        abi: contractABI,
        functionName: "grantRole",
        args: ["0x15283fd96aa656c9df35ac2fcb112678a5f24f1ca97e591a97d1d16003dbfc9c", walletAddressA],
        chainid: polygonMumbai.id,
        onSuccess(data) {
            console.log('Success', data)
        },
        onError(error) {
            console.log('Error', error)
        },
    });

    const { write: grantVoterRoleWrite } = useContractWrite(grantVoterRole);

    const { config: revokeVoterRole } = usePrepareContractWrite({
        address: "0x5a41Fc7f857083C7a781D5a0BC3eeB5a1D212192",
        abi: contractABI,
        functionName: "revokeRole",
        args: ["0x15283fd96aa656c9df35ac2fcb112678a5f24f1ca97e591a97d1d16003dbfc9c", walletAddressB],
        chainid: polygonMumbai.id,
        onSuccess(data) {
            console.log('Success', data)
        },
        onError(error) {
            console.log('Error', error)
        },
    });

    const { write: revokeVoterRoleWrite } = useContractWrite(revokeVoterRole);

    const { config: createCandidate } = usePrepareContractWrite({
        address: "0x5a41Fc7f857083C7a781D5a0BC3eeB5a1D212192",
        abi: contractABI,
        functionName: 'createCandidate',
        args: [name, party, imageURL],
        chainid: polygonMumbai.id,
        onSuccess(data) {
            console.log('Success', data)
        },
        onError(error) {
            console.log('Error', error)
        },
    });

    const { write: createCandidateWrite } = useContractWrite(createCandidate);

    const canId = (cids.slice(1, -1).split(',').map(i => parseInt(i.trim())));

    const { config: createBallot } = usePrepareContractWrite({
        address: "0x5a41Fc7f857083C7a781D5a0BC3eeB5a1D212192",
        abi: contractABI,
        functionName: 'createBallot',
        args: [canId, title, description, toTimeStamp(startsAt), toTimeStamp(endsAt)],
        chainid: polygonMumbai.id,
        onSuccess(data) {
            console.log('Success', data)
        },
        onError(error) {
            console.log('Error', error)
        },
    });

    const { write: createBallotWrite } = useContractWrite(createBallot);

    return (
        <section className="text-white" id="adminonly">
            <h2 className="text-center text-4xl font-bold text-white mt-20 mb-10 md:mb-10">
                Admin Only
            </h2>

            <div className="flex">
                <div className="flex flex-col w-full items-center"> {/* Center the content vertically */}
                    <p className="text-2xl text-center font-bold text-p-extra mt-10">Create Candidate</p>
                    <input
                        type="text"
                        className="border border-p-extra rounded w-1/2 py-2 px-3 mb-3 text-pink-700 m-5"
                        placeholder="Image URL"
                        value={imageURL}
                        onChange={(e) => setImageURL(e.target.value)}
                    />
                    <input
                        type="text"
                        className="border border-p-extra rounded w-1/2 py-2 px-3 mb-3 text-pink-700 m-5"
                        placeholder="Candidate Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        type="text"
                        className="border border-p-extra rounded w-1/2 py-2 px-3 mb-3 text-pink-700 m-5"
                        placeholder="Candidate Party"
                        value={party}
                        onChange={(e) => setParty(e.target.value)}
                    />

                    <div className="m-5">
                        {isConnected && address === "0xf9aB1bFdCb1ccE5742ab7CCf0bfedd62994AB767" && (
                            <button
                                className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2.5 px-5 rounded-lg w-full"
                                disabled={!createCandidateWrite}
                                type="submit"
                                onClick={() => createCandidateWrite?.()}
                            >
                                Create
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col w-full items-center"> {/* Center the content vertically */}
                        <p className="text-2xl text-center font-bold text-p-extra mt-2">Grant Voter Role</p>
                        <input
                            type="text"
                            className="border border-p-extra rounded w-1/2 py-2 px-3 mb-3 text-pink-700 m-5"
                            placeholder="Wallet Address"
                            value={walletAddressA}
                            onChange={handleAddressChangeA}
                        />
                        <div className="m-5">
                            {isConnected && address === "0xf9aB1bFdCb1ccE5742ab7CCf0bfedd62994AB767" && (
                                <button
                                    className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2.5 px-5 rounded-lg w-full"
                                    disabled={!grantVoterRoleWrite}
                                    type="submit"
                                    onClick={() => grantVoterRoleWrite?.()}
                                >
                                    Grant
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col w-full items-center"> {/* Center the content vertically */}
                        <p className="text-2xl text-center font-bold text-p-extra mt-2">Revoke Voter Role</p>
                        <input
                            type="text"
                            className="border border-p-extra rounded w-1/2 py-2 px-3 mb-3 text-pink-700 m-5"
                            placeholder="Wallet Address"
                            value={walletAddressB}
                            onChange={handleAddressChangeB}
                        />
                        <div className="m-5">
                            {isConnected && address === "0xf9aB1bFdCb1ccE5742ab7CCf0bfedd62994AB767" && (
                                <button
                                    className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2.5 px-5 rounded-lg w-full"
                                    disabled={!revokeVoterRoleWrite}
                                    type="submit"
                                    onClick={() => revokeVoterRoleWrite?.()}
                                >
                                    Revoke
                                </button>
                            )}
                        </div>
                    </div>

                </div>
                <div className="flex flex-col w-full items-center"> {/* Center the content vertically */}
                    <p className="text-2xl text-center font-bold text-p-extra mt-10">Create Ballot</p>

                    <input
                        type="text"
                        className="border border-p-extra rounded w-1/2 py-2 px-3 mb-3 text-pink-700 m-5"
                        placeholder="Candidate IDs, Format: [1, 2, 3]"
                        value={cids}
                        onChange={(e) => setCids(e.target.value)}
                    />

                    <input
                        type="text"
                        className="border border-p-extra rounded w-1/2 py-2 px-3 mb-3 text-pink-700 m-5"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <input
                        type="text"
                        className="border border-p-extra rounded w-1/2 py-2 px-3 mb-3 text-pink-700 m-5"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <small className="mb-[-10px]">Starts At</small>
                    <input
                        type="datetime-local"
                        className="border border-p-extra rounded w-1/2 py-2 px-3 mb-3 text-pink-700 m-5"
                        placeholder="Starts At"
                        value={startsAt}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                    <small className="mb-[-10px]">Ends At</small>
                    <input
                        type="datetime-local"
                        className="border border-p-extra rounded w-1/2 py-2 px-3 mb-3 text-pink-700 m-5"
                        placeholder="Ends At"
                        value={endsAt}
                        onChange={(e) => setEndTime(e.target.value)}
                    />
                    <div className="m-5">
                        {isConnected && address === "0xf9aB1bFdCb1ccE5742ab7CCf0bfedd62994AB767" && (
                            <button
                                className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2.5 px-5 rounded-lg w-full"
                                disabled={!createBallotWrite}
                                type="submit"
                                onClick={() => createBallotWrite?.()}
                            >
                                Create
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}


export default dynamic(() => Promise.resolve(AdminOnly), { ssr: false });