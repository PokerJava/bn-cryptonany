const Token = artifacts.require('Token');
const Shop = artifacts.require('Shop');

module.exports = function(deployer, network, accounts) {
  deployer
    .deploy(Token, 1000000)
    .then(async () => {
      const tokenContract = await Token.deployed();
      return deployer.deploy(Shop, tokenContract.address);
    })
    .then(async () => {
      const token = await Token.deployed();
      const coinbase = accounts[0];
      const value = 50000;
      await token.transfer(coinbase, accounts[1], value);
    });
};

