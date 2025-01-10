const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IdentityManager", function () {
  let IdentityManager;
  let identityManager;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get test accounts
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the contract
    IdentityManager = await ethers.getContractFactory("IdentityManager");
    identityManager = await IdentityManager.deploy();
    // No need to call deployed() in newer versions
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await identityManager.owner()).to.equal(owner.address);
    });
  });

  describe("Identity Creation", function () {
    it("Should create a new identity", async function () {
      const name = "John Doe";
      const documentHash = "QmHash123";

      await identityManager.connect(addr1).createIdentity(name, documentHash);
      
      const identity = await identityManager.getIdentity(addr1.address);
      expect(identity[0]).to.equal(name);
      expect(identity[1]).to.equal(documentHash);
      expect(identity[2]).to.equal(false); // isVerified should be false initially
    });

    it("Should fail if identity already exists", async function () {
      await identityManager.connect(addr1).createIdentity("John Doe", "QmHash123");
      
      await expect(
        identityManager.connect(addr1).createIdentity("John Doe 2", "QmHash456")
      ).to.be.revertedWith("Identity already exists");
    });
  });

  describe("Identity Verification", function () {
    beforeEach(async function () {
      await identityManager.connect(addr1).createIdentity("John Doe", "QmHash123");
    });

    it("Should allow owner to verify identity", async function () {
      await identityManager.connect(owner).verifyIdentity(addr1.address, true);
      
      const identity = await identityManager.getIdentity(addr1.address);
      expect(identity[2]).to.equal(true);
    });

    it("Should not allow non-owner to verify identity", async function () {
      await expect(
        identityManager.connect(addr2).verifyIdentity(addr1.address, true)
      ).to.be.revertedWith("Only owner can perform this action");
    });
  });

  describe("Document Hash Update", function () {
    beforeEach(async function () {
      await identityManager.connect(addr1).createIdentity("John Doe", "QmHash123");
    });

    it("Should allow updating document hash", async function () {
      const newHash = "QmNewHash456";
      await identityManager.connect(addr1).updateDocumentHash(newHash);
      
      const identity = await identityManager.getIdentity(addr1.address);
      expect(identity[1]).to.equal(newHash);
    });

    it("Should fail if identity doesn't exist", async function () {
      await expect(
        identityManager.connect(addr2).updateDocumentHash("QmNewHash456")
      ).to.be.revertedWith("Identity does not exist");
    });
  });

  describe("Events", function () {
    it("Should emit IdentityCreated event", async function () {
      const name = "John Doe";
      const documentHash = "QmHash123";

      await expect(identityManager.connect(addr1).createIdentity(name, documentHash))
        .to.emit(identityManager, "IdentityCreated")
        .withArgs(addr1.address, name);
    });

    it("Should emit IdentityVerified event", async function () {
      await identityManager.connect(addr1).createIdentity("John Doe", "QmHash123");

      await expect(identityManager.connect(owner).verifyIdentity(addr1.address, true))
        .to.emit(identityManager, "IdentityVerified")
        .withArgs(addr1.address, true);
    });
  });
});