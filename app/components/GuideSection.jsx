"use client";
import React, { useTransition, useState } from "react";
import Image from "next/image";
import TabButton from "./TabButton";
import dynamic from "next/dynamic";

const TAB_DATA = [
  {
    title: "Requirements",
    id: "requirements",
    content: (
      <ul className="list-disc pl-2">
        <li>Ensure that MetaMask extension is installed on your browser</li>
        <li>Create a MetaMask account if you haven't</li>
        <li>Add Mumbai Polygon network to your MetaMask</li>
        <li>Switch to Mumbai Polygon Network</li>
        <li>Prepare some faucet MATIC for the gas fees needed to approve the vote transaction in MetaMask</li>
      </ul>
    ),
  },
  {
    title: "Rules",
    id: "rules",
    content: (
      <ul className="list-disc pl-2">
        <li>Only eligible registered voters are allowed to vote</li>
        <li>If "Vote" button is not available for you, it's either you are not connected to MetaMask or you don't have the voter role or you have already
          voted or ballot is not active yet</li>
        <li>Carefully select your candidate to cast your vote before clicking the "Vote" button because if you reject the
          transaction in MetaMask, you will not be able to vote again and the vote will be counted as void.
        </li>
        <li>There will only be 1 admin which is the deployer of the smart contract</li>
      </ul>
    ),
  },
  {
    title: "Steps",
    id: "steps",
    content: (
      <ul className="list-disc pl-2">
        <li>Navigate to the ballots section</li>
        <li>Connect to MetaMask</li>
        <li>Enter the ballot</li>
        <li>Choose your candidate</li>
        <li>Cast your vote by clicking on the "Vote" button</li>
        <li>The winner will be revealed after the election ends</li>
      </ul>
    ),
  },
];

const GuideSection = () => {
  const [tab, setTab] = useState("requirements");
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (id) => {
    startTransition(() => {
      setTab(id);
    });
  };

  return (
    <section className="text-white" id="guide">
      <div className="md:grid md:grid-cols-2 gap-8 items-center py-8 px-4 xl:gap-16 sm:py-16 xl:px-16">
        <div className="w-[250px] h-[250px] lg:w-[400px] lg:h-[400px] relative">
          <Image
            src="/images/guide-image.png"
            alt="guide image"
            className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
            width={500}
            height={500}
          />
        </div>
        <div className="mt-4 md:mt-0 text-left flex flex-col h-full">
          <h2 className="text-4xl font-bold text-white mt-20 mb-4">How To Vote ?</h2>
          <p className="text-base lg:text-lg">
            The ONLY guide you need for the voting process
          </p>
          <div className="flex flex-row justify-start mt-8">
            <TabButton
              selectTab={() => handleTabChange("requirements")}
              active={tab === "requirements"}
            >
              {" "}
              Requirements{" "}
            </TabButton>
            <TabButton
              selectTab={() => handleTabChange("rules")}
              active={tab === "rules"}
            >
              {" "}
              Rules{" "}
            </TabButton>
            <TabButton
              selectTab={() => handleTabChange("steps")}
              active={tab === "steps"}
            >
              {" "}
              Steps{" "}
            </TabButton>
          </div>
          <div className="mt-8">
            {TAB_DATA.find((t) => t.id === tab).content}
          </div>
        </div>
      </div>
    </section>
  );
};
export default dynamic(() => Promise.resolve(GuideSection), { ssr: false });
