const { ethers } = require("hardhat");

async function main() {
  const TavernCharacters = await ethers.getContractFactory("TavernCharacters");
  const contract = await TavernCharacters.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`TavernCharacters deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
