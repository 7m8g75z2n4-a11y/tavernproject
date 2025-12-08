import { ethers } from "ethers";

const RPC_URL = process.env.TAVERN_RPC_URL || "";
const PRIVATE_KEY = process.env.TAVERN_MINT_PRIVATE_KEY || "";
const CHARACTER_CONTRACT_ADDRESS =
  process.env.TAVERN_CHARACTER_MINT_ADDRESS || "";
const BADGE_CONTRACT_ADDRESS =
  process.env.TAVERN_BADGE_MINT_ADDRESS || "";

// Very simple ABI: adjust to match your real contracts later.
const CHARACTER_ABI = [
  // e.g. function mintTo(address to, string uri) returns (uint256 tokenId)
  "function mintTo(address to, string uri) public returns (uint256)",
];

const BADGE_ABI = [
  // e.g. function mintBadge(address to, string uri) returns (uint256 tokenId)
  "function mintBadge(address to, string uri) public returns (uint256)",
];

function hasCharacterChainConfig() {
  return !!RPC_URL && !!PRIVATE_KEY && !!CHARACTER_CONTRACT_ADDRESS;
}

function hasBadgeChainConfig() {
  return !!RPC_URL && !!PRIVATE_KEY && !!BADGE_CONTRACT_ADDRESS;
}

function getSignerAndContract(address: string, abi: any[]) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(address, abi, wallet);
  return { wallet, contract };
}

export async function mintCharacterOnChain(opts: {
  to: string;
  tokenUri: string;
}) {
  const { to, tokenUri } = opts;

  if (!hasCharacterChainConfig()) {
    // Simulation mode
    return {
      simulated: true,
      txHash: "0xSIMULATED_CHARACTER_MINT",
      tokenId: "0",
    };
  }

  const { contract } = getSignerAndContract(
    CHARACTER_CONTRACT_ADDRESS,
    CHARACTER_ABI
  );

  const tx = await contract.mintTo(to, tokenUri);
  const receipt = await tx.wait();
  const tokenId =
    receipt?.logs?.[0]?.topics?.[3] ??
    "0"; // you’ll probably parse this properly later

  return {
    simulated: false,
    txHash: tx.hash,
    tokenId: tokenId.toString?.() ?? String(tokenId),
  };
}

export async function mintBadgeOnChain(opts: {
  to: string;
  tokenUri: string;
}) {
  const { to, tokenUri } = opts;

  if (!hasBadgeChainConfig()) {
    return {
      simulated: true,
      txHash: "0xSIMULATED_BADGE_MINT",
      tokenId: "0",
    };
  }

  const { contract } = getSignerAndContract(
    BADGE_CONTRACT_ADDRESS,
    BADGE_ABI
  );

  const tx = await contract.mintBadge(to, tokenUri);
  const receipt = await tx.wait();
  const tokenId =
    receipt?.logs?.[0]?.topics?.[3] ??
    "0";

  return {
    simulated: false,
    txHash: tx.hash,
    tokenId: tokenId.toString?.() ?? String(tokenId),
  };
}
