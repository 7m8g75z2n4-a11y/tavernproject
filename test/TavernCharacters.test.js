const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TavernCharacters", function () {
  async function deployFixture() {
    const [owner, alice, bob] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("TavernCharacters");
    const contract = await Factory.deploy();
    await contract.waitForDeployment();
    return { contract, owner, alice, bob };
  }

  it("mints only by owner and stores tokenURI", async function () {
    const { contract, owner, alice } = await deployFixture();
    const uri = "ipfs://example/character.json";

    const tx = await contract.connect(owner).mintCharacter(alice.address, uri);
    const receipt = await tx.wait();
    const tokenId = await contract.nextTokenId();

    expect(tokenId).to.equal(1n);
    expect(await contract.ownerOf(tokenId)).to.equal(alice.address);
    expect(await contract.tokenURI(tokenId)).to.equal(uri);

    const event = receipt.logs.find((log) => log.fragment?.name === "CharacterMinted");
    expect(event.args.tokenId).to.equal(1n);
    expect(event.args.to).to.equal(alice.address);
    expect(event.args.tokenURI).to.equal(uri);
  });

  it("reverts mint from non-owner", async function () {
    const { contract, alice, bob } = await deployFixture();
    await expect(
      contract.connect(alice).mintCharacter(bob.address, "uri")
    ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
  });

  it("allows owner to update tokenURI", async function () {
    const { contract, owner, alice } = await deployFixture();
    const initial = "ipfs://initial";
    const updated = "ipfs://updated";

    await contract.connect(owner).mintCharacter(alice.address, initial);
    await contract.connect(owner).updateTokenURI(1, updated);

    expect(await contract.tokenURI(1)).to.equal(updated);
  });
});
