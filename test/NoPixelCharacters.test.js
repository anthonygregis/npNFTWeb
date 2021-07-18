const { assert } = require("chai");
const NoPixelCharacters = artifacts.require("./NoPixelCharacters.sol");

const baseURI = "http://localhost:4000/c/";

require("chai")
  .use(require("chai-as-promised"))
  .should();

contract("NoPixelCharacters", (accounts) => {
  let contract;

  before(async () => {
    contract = await NoPixelCharacters.deployed();
  });

  describe("Deployment", async () => {
    it("deploys successfully", async () => {
      const address = contract.address;
      assert.ok(address);
      assert.notEqual(address, "");
      assert.notEqual(address, 0x0);
    });

    it("has a name", async () => {
      const name = await contract.name();
      assert.equal(name, "NoPixel Characters");
    });

    it("has a symbol", async () => {
      const symbol = await contract.symbol();
      assert.equal(symbol, "NPC");
    });
  });

  describe("Minting", async () => {
    it("creates a new token", async () => {
      const result = await contract.mint(1);
      const totalSupply = await contract.totalSupply();
      const event = result.logs[0].args;

      assert.equal(totalSupply, 1);
      assert.equal(event.tokenId.toNumber(), 1, "id is correct");
      assert.equal(
        event.from,
        "0x0000000000000000000000000000000000000000",
        "from address is correct"
      );
      assert.equal(event.to, accounts[0], "to address is correct");
    });
  });

  describe("URI Storage", async () => {
    it("returns a valid token uri", async () => {
      const tokenUri = await contract.tokenURI(1);

      assert.equal(tokenUri, baseURI + 1);
    });
  });
});
