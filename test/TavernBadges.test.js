const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TavernBadges", function () {
  async function deployFixture() {
    const [owner, alice] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("TavernBadges");
    const contract = await Factory.deploy();
    await contract.waitForDeployment();
    return { contract, owner, alice };
  }

  it("mints only by owner and stores tokenURI", async function () {
    const { contract, owner, alice } = await deployFixture();
    const uri = "ipfs://badge/1";

    await expect(contract.connect(owner).mintBadge(alice.address, uri))
      .to.emit(contract, "BadgeMinted")
      .withArgs(1, alice.address, uri);

    expect(await contract.nextTokenId()).to.equal(1n);
    expect(await contract.ownerOf(1)).to.equal(alice.address);
    expect(await contract.tokenURI(1)).to.equal(uri);
  });

  it("blocks non-owner mint", async function () {
    const { contract, alice } = await deployFixture();
    await expect(
      contract.connect(alice).mintBadge(alice.address, "uri")
    ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
  });

  it("is soulbound (no transfers or approvals)", async function () {
    const { contract, owner, alice } = await deployFixture();
    await contract.connect(owner).mintBadge(alice.address, "ipfs://badge/1");

    await expect(
      contract.connect(alice)["safeTransferFrom(address,address,uint256)"](
        alice.address,
        owner.address,
        1
      )
    ).to.be.revertedWith("Badges are soulbound");

    await expect(
      contract.connect(alice).approve(owner.address, 1)
    ).to.be.revertedWith("Badges are soulbound");

    await expect(
      contract.connect(alice).setApprovalForAll(owner.address, true)
    ).to.be.revertedWith("Badges are soulbound");
  });
});
