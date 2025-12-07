const { ethers } = require("hardhat");

async function main() {
  const TavernBadges = await ethers.getContractFactory("TavernBadges");
  const contract = await TavernBadges.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(`TavernBadges deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
