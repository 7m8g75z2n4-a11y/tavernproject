import { ethers } from "ethers";

export const CHAIN_ID = Number(process.env.CHAIN_ID || 137);
export const TAVERN_CHARACTERS_ADDRESS = process.env.TAVERN_CHARACTERS_ADDRESS ?? "";
export const TAVERN_BADGES_ADDRESS = process.env.BADGES_CONTRACT_ADDRESS ?? "";
export const BADGES_CHAIN_ID = Number(process.env.BADGES_CHAIN_ID || CHAIN_ID);

const RPC_URL = process.env.RPC_URL ?? "";
const MINTER_PRIVATE_KEY = process.env.MINTER_PRIVATE_KEY ?? "";

export const provider = RPC_URL ? new ethers.JsonRpcProvider(RPC_URL) : null;
export const minterSigner =
  RPC_URL && MINTER_PRIVATE_KEY && provider ? new ethers.Wallet(MINTER_PRIVATE_KEY, provider) : null;

// Minimal ABI for TavernCharacters
export const tavernCharactersAbi = [
  "function mintCharacter(address to, string tokenURI) external returns (uint256)",
  "function nextTokenId() view returns (uint256)",
];

export const tavernBadgesAbi = [
  "function mintBadge(address to, string tokenURI) external returns (uint256)",
  "function nextTokenId() view returns (uint256)",
];
