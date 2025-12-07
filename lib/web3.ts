import { ethers } from "ethers";

export const CHAIN_ID = Number(process.env.CHAIN_ID || 137);
export const TAVERN_CHARACTERS_ADDRESS = process.env
  .TAVERN_CHARACTERS_ADDRESS as string;
export const TAVERN_BADGES_ADDRESS = process.env
  .BADGES_CONTRACT_ADDRESS as string;
export const BADGES_CHAIN_ID = Number(process.env.BADGES_CHAIN_ID || CHAIN_ID);

if (!TAVERN_CHARACTERS_ADDRESS) {
  throw new Error("TAVERN_CHARACTERS_ADDRESS is not set");
}
if (!TAVERN_BADGES_ADDRESS) {
  throw new Error("BADGES_CONTRACT_ADDRESS is not set");
}

const RPC_URL = process.env.RPC_URL as string;
const MINTER_PRIVATE_KEY = process.env.MINTER_PRIVATE_KEY as string;

if (!RPC_URL || !MINTER_PRIVATE_KEY) {
  throw new Error("RPC_URL or MINTER_PRIVATE_KEY not set");
}

// Simple provider + signer
export const provider = new ethers.JsonRpcProvider(RPC_URL);
export const minterSigner = new ethers.Wallet(MINTER_PRIVATE_KEY, provider);

// Minimal ABI for TavernCharacters
export const tavernCharactersAbi = [
  "function mintCharacter(address to, string tokenURI) external returns (uint256)",
  "function nextTokenId() view returns (uint256)",
];

export const tavernBadgesAbi = [
  "function mintBadge(address to, string tokenURI) external returns (uint256)",
  "function nextTokenId() view returns (uint256)",
];
